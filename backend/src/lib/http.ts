import type { RequestHandler } from 'express';

/**
 * Wraps an async route handler so thrown/rejected errors reach Express' error
 * middleware without a try/catch in every handler.
 */
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Typed access to route params. Express 5 types params as string|string[];
 * after Zod validation they are plain strings, so this narrows safely.
 */
export const params = <T extends Record<string, string> = Record<string, string>>(req: {
  params: unknown;
}): T => req.params as T;

/** Standard success envelope. */
export const ok = <T>(data: T, meta?: Record<string, unknown>) => ({
  success: true as const,
  data,
  ...(meta ? { meta } : {}),
});

/**
 * Build a spec-correct `Content-Disposition` header value for a download.
 *
 * Non-ASCII filenames (e.g. Burmese project titles) cannot appear in a bare
 * `filename="..."` — they get mangled or dropped. RFC 5987 defines the
 * `filename*=UTF-8''<percent-encoded>` form; we emit BOTH an ASCII-fallback
 * `filename` and the UTF-8 `filename*` for maximum browser compatibility.
 */
export const contentDispositionAttachment = (
  filename: string,
  disposition: 'attachment' | 'inline' = 'attachment',
): string => {
  // ASCII fallback: strip anything non-ASCII and quotes.
  const ascii = filename.replace(/["\\]/g, '').replace(/[^\x20-\x7E]/g, '_') || 'download';
  const encoded = encodeURIComponent(filename).replace(/['()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
  return `${disposition}; filename="${ascii}"; filename*=UTF-8''${encoded}`;
};
