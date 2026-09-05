import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, ok } from '../../lib/http.js';
import { validate } from '../../middleware/validate.js';
import { optionalAuth } from '../../middleware/auth.js';
import { prisma } from '../../lib/prisma.js';

/**
 * Public analytics ingestion: a lightweight, cookie-free page-view beacon.
 *
 * The frontend calls POST /api/analytics/pageview on navigation. We store a
 * NORMALIZED path (dynamic ids collapsed to ":id") so per-route counts stay
 * meaningful, plus a coarse IP for rough unique-visitor estimates. No tracking
 * cookies, no third parties — privacy-light and self-hosted.
 */
export const analyticsRouter = Router();

/** Collapse dynamic segments so "/projects/abc123" counts as "/projects/:id". */
function normalizePath(path: string): string {
  const clean = path.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  return clean
    .replace(/\/projects\/[^/]+/, '/projects/:id')
    .replace(/\/[a-z0-9]{20,}/gi, '/:id')
    .slice(0, 200);
}

analyticsRouter.post(
  '/pageview',
  optionalAuth,
  validate({
    body: z.object({
      path: z.string().min(1).max(300),
      referrer: z.string().max(300).optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { path, referrer } = req.body as { path: string; referrer?: string };
    // Best-effort: never block navigation on a logging failure.
    void prisma.pageView
      .create({
        data: {
          path: normalizePath(path),
          referrer: referrer?.slice(0, 300),
          actorId: req.user?.sub ?? null,
          ip: (req.ip ?? '').slice(0, 64),
        },
      })
      .catch(() => {});
    res.status(202).json(ok({ recorded: true }));
  }),
);
