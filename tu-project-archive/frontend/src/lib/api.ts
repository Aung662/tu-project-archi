/**
 * Thin API client. All calls go to same-origin `/api/*`, which Next.js proxies
 * to the backend. Cookies (HttpOnly JWT) ride along automatically via
 * `credentials: 'include'`. No secrets ever live in the frontend bundle.
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
  meta?: unknown;
}

// A single fetch attempt guarded by an AbortController so it can never hang
// forever (a sleeping free-tier server would otherwise leave the UI spinning
// indefinitely, which users read as "the site is broken").
async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const options: RequestInit = {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.body && !(init.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(init.headers || {}),
    },
  };

  // GET requests are safe to retry. If the backend was asleep (free tier), the
  // first hit wakes it and may time out; a couple of quick retries then succeed
  // once it's warm — far better UX than one long hang or an instant error.
  const isRetriable = !init.method || init.method.toUpperCase() === 'GET';
  const maxAttempts = isRetriable ? 3 : 1;
  const perAttemptTimeout = isRetriable ? 8000 : 20000;

  let res: Response | null = null;
  let lastErr: unknown = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      res = await fetchWithTimeout(`/api${path}`, options, perAttemptTimeout);
      break; // got a response (any status) — stop retrying
    } catch (err) {
      lastErr = err;
      // Network error or timeout (likely cold start). Back off briefly, retry.
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 600 * attempt));
        continue;
      }
    }
  }

  if (!res) {
    throw new ApiError(
      0,
      'NETWORK',
      lastErr instanceof DOMException && lastErr.name === 'AbortError'
        ? 'Request timed out. Please check your connection and try again.'
        : 'Network error. Please try again.',
    );
  }

  let json: Envelope<T> | null = null;
  try {
    json = (await res.json()) as Envelope<T>;
  } catch {
    /* non-JSON (e.g. file streams handled elsewhere) */
  }

  if (!res.ok || !json?.success) {
    throw new ApiError(
      res.status,
      json?.error?.code || 'ERROR',
      json?.error?.message || `Request failed (${res.status})`,
      json?.error?.details,
    );
  }
  return json.data as T;
}

const qs = (params: Record<string, unknown>) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
};

export const api = {
  request,
  qs,
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  postForm: <T>(path: string, form: FormData) =>
    request<T>(path, { method: 'POST', body: form }),
};
