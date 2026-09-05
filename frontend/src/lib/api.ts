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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.body && !(init.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(init.headers || {}),
    },
  });

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
