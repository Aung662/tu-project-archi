import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, ok, params } from '../../lib/http.js';
import { validate } from '../../middleware/validate.js';
import { optionalAuth, requireAuth } from '../../middleware/auth.js';
import { prisma } from '../../lib/prisma.js';
import { NotFound } from '../../lib/errors.js';

/**
 * Ratings & reviews for published projects.
 *
 *  - GET  /api/reviews/project/:projectId — public: summary (avg, count,
 *    distribution) + recent reviews, plus the caller's own review if signed in.
 *  - POST /api/reviews/project/:projectId — auth: create/update the caller's
 *    review (one per user per project; rating 1..5, optional short comment).
 *  - DELETE /api/reviews/project/:projectId — auth: remove the caller's review.
 */
export const reviewsRouter = Router();

const projectIdParam = z.object({ projectId: z.string().min(1) });

/** Public summary + recent reviews for a project. */
reviewsRouter.get(
  '/project/:projectId',
  optionalAuth,
  validate({ params: projectIdParam }),
  asyncHandler(async (req, res) => {
    const { projectId } = params<{ projectId: string }>(req);

    const [rows, mine] = await Promise.all([
      prisma.review.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      }),
      req.user
        ? prisma.review.findUnique({
            where: { userId_projectId: { userId: req.user.sub, projectId } },
            select: { id: true, rating: true, comment: true, createdAt: true },
          })
        : Promise.resolve(null),
    ]);

    const count = rows.length;
    const average = count ? rows.reduce((s, r) => s + r.rating, 0) / count : 0;
    const distribution = [1, 2, 3, 4, 5].map(
      (star) => rows.filter((r) => r.rating === star).length,
    ); // index 0 => 1 star

    res.json(
      ok({
        average: Math.round(average * 10) / 10,
        count,
        distribution,
        mine,
        // Cap the public list; names only (no emails).
        reviews: rows.slice(0, 20).map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          authorName: r.user?.name ?? 'Student',
        })),
      }),
    );
  }),
);

/** Create or update the caller's review for a project. */
reviewsRouter.post(
  '/project/:projectId',
  requireAuth,
  validate({
    params: projectIdParam,
    body: z.object({
      rating: z.coerce.number().int().min(1).max(5),
      comment: z.string().max(1000).optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { projectId } = params<{ projectId: string }>(req);
    const { rating, comment } = req.body as { rating: number; comment?: string };

    // Only allow reviews on projects that actually exist and are published.
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, status: true },
    });
    if (!project || project.status !== 'PUBLISHED') throw NotFound('Project not found');

    const review = await prisma.review.upsert({
      where: { userId_projectId: { userId: req.user!.sub, projectId } },
      create: { userId: req.user!.sub, projectId, rating, comment: comment?.trim() ?? '' },
      update: { rating, comment: comment?.trim() ?? '' },
      select: { id: true, rating: true, comment: true, createdAt: true },
    });
    res.status(201).json(ok(review));
  }),
);

/** Remove the caller's review. */
reviewsRouter.delete(
  '/project/:projectId',
  requireAuth,
  validate({ params: projectIdParam }),
  asyncHandler(async (req, res) => {
    const { projectId } = params<{ projectId: string }>(req);
    await prisma.review
      .delete({ where: { userId_projectId: { userId: req.user!.sub, projectId } } })
      .catch(() => {}); // already gone → still success
    res.json(ok({ removed: true, projectId }));
  }),
);
