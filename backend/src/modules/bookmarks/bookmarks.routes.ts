import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, ok, params } from '../../lib/http.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { prisma } from '../../lib/prisma.js';
import { NotFound } from '../../lib/errors.js';

/**
 * Bookmarks (saved projects) for the signed-in user. All routes require auth;
 * a user can only ever see or mutate their own bookmarks.
 */
export const bookmarksRouter = Router();

bookmarksRouter.use(requireAuth);

/** GET /api/bookmarks — the current user's saved projects (newest first). */
bookmarksRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const rows = await prisma.bookmark.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            year: true,
            level: true,
            priceMmk: true,
            status: true,
            fileStorageKey: true,
            university: { select: { id: true, name: true, shortName: true } },
            department: { select: { id: true, name: true, code: true } },
            images: { where: { kind: 'GALLERY' }, orderBy: { sortOrder: 'asc' }, take: 1, select: { id: true } },
          },
        },
      },
    });

    res.json(
      ok(
        rows
          // A published-only view (a project could have been unpublished later).
          .filter((b) => b.project.status === 'PUBLISHED')
          .map((b) => ({
            id: b.id,
            createdAt: b.createdAt,
            project: {
              id: b.project.id,
              title: b.project.title,
              year: b.project.year,
              level: b.project.level,
              priceMmk: b.project.priceMmk,
              hasFile: Boolean(b.project.fileStorageKey),
              university: b.project.university,
              department: b.project.department,
              coverImageUrl: b.project.images[0] ? `/api/images/${b.project.images[0].id}` : null,
            },
          })),
      ),
    );
  }),
);

/** GET /api/bookmarks/ids — just the bookmarked project ids (for UI state). */
bookmarksRouter.get(
  '/ids',
  asyncHandler(async (req, res) => {
    const rows = await prisma.bookmark.findMany({
      where: { userId: req.user!.sub },
      select: { projectId: true },
    });
    res.json(ok(rows.map((r) => r.projectId)));
  }),
);

/** POST /api/bookmarks/:projectId — save (idempotent). */
bookmarksRouter.post(
  '/:projectId',
  validate({ params: z.object({ projectId: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const { projectId } = params<{ projectId: string }>(req);
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
    if (!project) throw NotFound('Project not found');

    await prisma.bookmark.upsert({
      where: { userId_projectId: { userId: req.user!.sub, projectId } },
      create: { userId: req.user!.sub, projectId },
      update: {},
    });
    res.status(201).json(ok({ bookmarked: true, projectId }));
  }),
);

/** DELETE /api/bookmarks/:projectId — remove (idempotent). */
bookmarksRouter.delete(
  '/:projectId',
  validate({ params: z.object({ projectId: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const { projectId } = params<{ projectId: string }>(req);
    await prisma.bookmark
      .delete({ where: { userId_projectId: { userId: req.user!.sub, projectId } } })
      .catch(() => {}); // already gone → still success
    res.json(ok({ bookmarked: false, projectId }));
  }),
);
