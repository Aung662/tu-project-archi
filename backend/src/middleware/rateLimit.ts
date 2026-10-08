import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const json = { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, slow down.' } };

/** General API limiter (also throttles search scraping). */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: json,
});

/** Stricter limiter for auth endpoints (brute-force protection). */
export const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: json,
});

/**
 * Upload limiter — file uploads are expensive (disk + magic-byte scan) and a
 * natural abuse vector, so cap them well below the general API limit.
 */
export const uploadLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.UPLOAD_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: json,
});

/**
 * Folder imports are split into eight-image chunks by the admin UI. A separate,
 * still conservative limit permits a few hundred images per maintenance session
 * without raising the stricter limits for paid files or student uploads.
 */
export const wiringUploadLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: json,
});

/**
 * Search/duplicate-check limiter — similarity scanning is comparatively heavy
 * and the endpoint is public, so throttle scraping without hurting real users.
 */
export const searchLimiter = rateLimit({
  windowMs: 60_000,
  max: env.SEARCH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: json,
});
