import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, ok, params } from '../../lib/http.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireAdmin, optionalAuth } from '../../middleware/auth.js';
import { projectImageUpload } from '../../middleware/upload.js';
import { uploadLimiter } from '../../middleware/rateLimit.js';
import { prisma } from '../../lib/prisma.js';
import { BadRequest, NotFound } from '../../lib/errors.js';
import { imageBufferMatchesMime } from '../../lib/fileSignature.js';
import { audit } from '../../lib/audit.js';

/**
 * Project images: public gallery photos + ordered 360° turntable frames.
 *
 * Storage model: image bytes live in the DB (ProjectImage.data). Unlike the paid
 * project file, these are PUBLIC — they are served by a cache-friendly streaming
 * endpoint. Admin-only endpoints manage the set (upload / delete).
 */
export const imagesRouter = Router();

const ImageKind = z.enum(['GALLERY', 'SPIN']);

/**
 * GET /api/images/project/:projectId
 * Public list of an (published) project's image metadata, split by kind and
 * ordered. Returns URLs the frontend can use in <img>/viewers — never the bytes.
 */
imagesRouter.get(
  '/project/:projectId',
  optionalAuth,
  validate({ params: z.object({ projectId: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const { projectId } = params<{ projectId: string }>(req);
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { status: true },
    });
    // Public callers only see images of PUBLISHED projects; an admin can view a
    // DRAFT/ARCHIVED project's images too (so the image manager works pre-publish).
    const isAdmin = req.user?.role === 'ADMIN';
    if (!project || (project.status !== 'PUBLISHED' && !isAdmin)) throw NotFound('Project not found');

    const images = await prisma.projectImage.findMany({
      where: { projectId },
      orderBy: [{ kind: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, kind: true, sortOrder: true, mimeType: true },
    });

    res.json(
      ok({
        gallery: images
          .filter((i) => i.kind === 'GALLERY')
          .map((i) => ({ id: i.id, url: `/api/images/${i.id}` })),
        spin: images
          .filter((i) => i.kind === 'SPIN')
          .map((i) => ({ id: i.id, url: `/api/images/${i.id}` })),
      }),
    );
  }),
);

/**
 * GET /api/images/:id
 * Public: stream a single image with long-lived immutable caching (the id is a
 * stable content handle — bytes never change for a given id).
 */
imagesRouter.get(
  '/:id',
  validate({ params: z.object({ id: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const { id } = params<{ id: string }>(req);
    const image = await prisma.projectImage.findUnique({ where: { id } });
    if (!image) throw NotFound('Image not found');

    res.setHeader('Content-Type', image.mimeType);
    res.setHeader('Content-Length', String(image.data.length));
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.end(image.data);
  }),
);

/**
 * POST /api/images/project/:projectId  (admin)
 * Upload one or more images of a given `kind`. For SPIN sets, the client should
 * send the frames IN ORDER; sortOrder continues after any existing frames.
 */
imagesRouter.post(
  '/project/:projectId',
  requireAuth,
  requireAdmin,
  uploadLimiter,
  validate({
    params: z.object({ projectId: z.string().min(1) }),
    query: z.object({ kind: ImageKind.default('GALLERY') }),
  }),
  projectImageUpload.array('images', 48),
  asyncHandler(async (req, res) => {
    const { projectId } = params<{ projectId: string }>(req);
    const kind = (req.query.kind as 'GALLERY' | 'SPIN') ?? 'GALLERY';
    const files = (req.files as Express.Multer.File[]) ?? [];
    if (files.length === 0) throw BadRequest('No images uploaded');

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project) throw NotFound('Project not found');

    // Verify real magic bytes for every file before persisting anything.
    for (const f of files) {
      if (!imageBufferMatchesMime(f.buffer, f.mimetype)) {
        throw BadRequest(`Uploaded file "${f.originalname}" is not a valid ${f.mimetype} image`);
      }
    }

    // Continue ordering after the current max for this kind.
    const last = await prisma.projectImage.findFirst({
      where: { projectId, kind },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    let nextOrder = (last?.sortOrder ?? -1) + 1;

    await prisma.$transaction(
      files.map((f) =>
        prisma.projectImage.create({
          data: {
            projectId,
            data: new Uint8Array(f.buffer),
            mimeType: f.mimetype,
            kind,
            sortOrder: nextOrder++,
            sizeBytes: f.size,
          },
        }),
      ),
    );

    await audit({
      actorId: req.user!.sub,
      action: 'PROJECT_IMAGES_UPLOADED',
      entityType: 'Project',
      entityId: projectId,
      metadata: { kind, count: files.length },
    });

    const images = await prisma.projectImage.findMany({
      where: { projectId, kind },
      orderBy: { sortOrder: 'asc' },
      select: { id: true },
    });
    res.status(201).json(
      ok({ kind, images: images.map((i) => ({ id: i.id, url: `/api/images/${i.id}` })) }),
    );
  }),
);

/**
 * DELETE /api/images/:id  (admin) — remove a single image.
 */
imagesRouter.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  validate({ params: z.object({ id: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const { id } = params<{ id: string }>(req);
    const image = await prisma.projectImage.findUnique({
      where: { id },
      select: { id: true, projectId: true, kind: true },
    });
    if (!image) throw NotFound('Image not found');

    await prisma.projectImage.delete({ where: { id } });
    await audit({
      actorId: req.user!.sub,
      action: 'PROJECT_IMAGE_DELETED',
      entityType: 'Project',
      entityId: image.projectId,
      metadata: { imageId: id, kind: image.kind },
    });
    res.json(ok({ deleted: id }));
  }),
);
