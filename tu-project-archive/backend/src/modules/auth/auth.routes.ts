import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, ok } from '../../lib/http.js';
import { validate } from '../../middleware/validate.js';
import { authLimiter } from '../../middleware/rateLimit.js';
import { requireAuth, optionalAuth } from '../../middleware/auth.js';
import { env, isProd } from '../../config/env.js';
import { audit } from '../../lib/audit.js';
import { getMe, login, register, requestPasswordReset, resetPassword } from './auth.service.js';

export const authRouter = Router();

/**
 * Parse a JWT-style duration string ("6h", "30m", "2d", "3600s", or a bare
 * seconds number) into milliseconds. The auth cookie's lifetime is derived from
 * the SAME `JWT_EXPIRES_IN` used to sign the token, so the cookie can never
 * outlive the JWT (which previously caused silent "logged-in but 401" windows).
 */
function durationToMs(v: string): number {
  const m = /^(\d+)\s*(s|m|h|d)?$/.exec(v.trim());
  if (!m) return 1000 * 60 * 60 * 6; // safe fallback: 6h
  const n = Number(m[1]);
  const unit = m[2] ?? 's';
  const mult = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit]!;
  return n * mult;
}

const SESSION_MAX_AGE_MS = durationToMs(env.JWT_EXPIRES_IN);

const cookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: 'lax' as const,
  maxAge: SESSION_MAX_AGE_MS, // always equals the JWT lifetime
  path: '/',
};

// Stronger password policy: length + at least one letter and one number. Kept
// pragmatic (not punishing) since this is a student-facing academic tool.
const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .refine((p) => /[A-Za-z]/.test(p) && /\d/.test(p), {
    message: 'Password must contain at least one letter and one number',
  });

const registerSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(200),
    password: strongPassword,
    name: z.string().trim().min(2).max(120),
  })
  .strict();

const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(200),
    password: z.string().min(1).max(128),
  })
  .strict();

authRouter.post(
  '/register',
  authLimiter,
  validate({ body: registerSchema }),
  asyncHandler(async (req, res) => {
    const { user, token } = await register(req.body);
    res.cookie(env.COOKIE_NAME, token, cookieOptions);
    res.status(201).json(ok({ user }));
  }),
);

authRouter.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    const { user, token } = await login(req.body);
    res.cookie(env.COOKIE_NAME, token, cookieOptions);
    res.json(ok({ user }));
  }),
);

authRouter.post('/logout', optionalAuth, (req, res) => {
  if (req.user) {
    void audit({ actorId: req.user.sub, action: 'AUTH_LOGOUT', entityType: 'User', entityId: req.user.sub });
  }
  res.clearCookie(env.COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
  res.json(ok({ loggedOut: true }));
});

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(ok({ user: await getMe(req.user!.sub) }));
  }),
);

// ── Password reset ───────────────────────────────────────────────────────────
// POST /auth/forgot-password → always returns success (no user enumeration).
// In production the raw token would be emailed; in dev (no SMTP) it is returned
// in the response body so the flow can be exercised end-to-end.
authRouter.post(
  '/forgot-password',
  authLimiter,
  validate({ body: z.object({ email: z.string().trim().toLowerCase().email().max(200) }).strict() }),
  asyncHandler(async (req, res) => {
    const rawToken = await requestPasswordReset(req.body.email);
    const payload: { message: string; devToken?: string } = {
      message: 'If an account exists for that email, a reset link has been generated.',
    };
    // Only expose the token outside production (no email service is wired up).
    if (!isProd && rawToken) payload.devToken = rawToken;
    res.json(ok(payload));
  }),
);

// POST /auth/reset-password → consume a single-use token and set a new password.
authRouter.post(
  '/reset-password',
  authLimiter,
  validate({ body: z.object({ token: z.string().min(10).max(200), password: strongPassword }).strict() }),
  asyncHandler(async (req, res) => {
    await resetPassword(req.body.token, req.body.password);
    res.json(ok({ message: 'Your password has been reset. You can now sign in.' }));
  }),
);
