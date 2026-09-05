import type { RequestHandler } from 'express';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { verifyToken, type JwtPayload } from '../modules/auth/auth.service.js';
import { Forbidden, Unauthorized } from '../lib/errors.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/** Reads the JWT from the HttpOnly cookie (or Bearer header) and attaches req.user. */
function extractToken(req: Parameters<RequestHandler>[0]): string | undefined {
  const cookieToken = req.cookies?.[env.COOKIE_NAME];
  if (cookieToken) return cookieToken;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return undefined;
}

/** Optional auth: attaches req.user if a valid token exists, never rejects. */
export const optionalAuth: RequestHandler = (req, _res, next) => {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      /* ignore invalid token for optional auth */
    }
  }
  next();
};

/** Hard auth: rejects when no valid token. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next(Unauthorized());
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(Unauthorized('Session expired or invalid'));
  }
};

/**
 * Role gate. This is the REAL admin protection (not the hidden UI trigger).
 *
 * Defense-in-depth against STALE ROLES: a JWT embeds the role at sign time, so
 * if an admin demotes a user, that user's existing token would still assert the
 * old role until it expires. For privileged routes we therefore re-read the
 * CURRENT role from the DB and authorize on that, and reject if the user was
 * deleted. (The token's role is treated as a hint, never the source of truth.)
 */
export const requireRole =
  (...roles: JwtPayload['role'][]): RequestHandler =>
  async (req, _res, next) => {
    try {
      if (!req.user) return next(Unauthorized());
      const fresh = await prisma.user.findUnique({
        where: { id: req.user.sub },
        select: { role: true },
      });
      if (!fresh) return next(Unauthorized('Account no longer exists'));
      // Keep req.user in sync with the authoritative role for downstream handlers.
      req.user.role = fresh.role as JwtPayload['role'];
      if (!roles.includes(fresh.role as JwtPayload['role'])) return next(Forbidden());
      next();
    } catch (err) {
      next(err);
    }
  };

export const requireAdmin = requireRole('ADMIN');
