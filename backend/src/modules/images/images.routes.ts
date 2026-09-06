import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, ok, params } from '../../lib/http.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireAdmin, optionalAuth } from '../../middleware/auth.js';
import { projectImageUpload, projectVideoUpload } from '../../middleware/upload.js';
import { uploadLimiter } from '../../middleware/rateLimit.js';
import { prisma } from '../../lib/prisma.js';
import { BadRequest, NotFound } from '../../lib/errors.js';
import { imageBufferMatchesMime } from '../../lib/fileSignature.js';
import { audit } from '../../lib/audit.js';
import { cloudinaryConfigured } from '../../config/env.js';
import { uploadVideo, deleteVideo } from '../../lib/cloudinary.js';

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
 * GET /api/images/video-config
 * Public: tells the client whether video hosting is available on this server, so
 * the UI can show/hide the upload control gracefully. MUST be declared before the
 * `/:id` catch-all below, otherwise "video-config" is treated as an image id.
 */
imagesRouter.get(
  '/video-config',
  asyncHandler(async (_req, res) => {
    res.json(ok({ enabled: cloudinaryConfigured }));
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

// ── Videos ───────────────────────────────────────────────────────────────────
// Short demo clips are hosted on Cloudinary; we store only the URL + metadata.

/**
 * GET /api/images/project/:projectId/videos
 * Public list of a (published) project's videos.
 */
imagesRouter.get(
  '/project/:projectId/videos',
  optionalAuth,
  validate({ params: z.object({ projectId: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const { projectId } = params<{ projectId: string }>(req);
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { status: true },
    });
    const isAdmin = req.user?.role === 'ADMIN';
    if (!project || (project.status !== 'PUBLISHED' && !isAdmin)) throw NotFound('Project not found');

    const videos = await prisma.projectVideo.findMany({
      where: { projectId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        url: true,
        thumbnailUrl: true,
        title: true,
        durationSec: true,
        format: true,
      },
    });
    res.json(ok({ videos }));
  }),
);

/**
 * POST /api/images/project/:projectId/videos  (admin)
 * Upload ONE short video. Streams the buffer to Cloudinary, then stores the
 * returned URL + metadata. Returns 400 with a clear message if Cloudinary is
 * not configured on this server.
 */
imagesRouter.post(
  '/project/:projectId/videos',
  requireAuth,
  requireAdmin,
  uploadLimiter,
  validate({ params: z.object({ projectId: z.string().min(1) }) }),
  projectVideoUpload.single('video'),
  asyncHandler(async (req, res) => {
    const { projectId } = params<{ projectId: string }>(req);
    const file = req.file;
    if (!file) throw BadRequest('No video uploaded');

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project) throw NotFound('Project not found');

    // Uploads to Cloudinary (throws BadRequest if not configured).
    const uploaded = await uploadVideo(file.buffer, projectId);

    const last = await prisma.projectVideo.findFirst({
      where: { projectId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    const created = await prisma.projectVideo.create({
      data: {
        projectId,
        url: uploaded.url,
        publicId: uploaded.publicId,
        thumbnailUrl: uploaded.thumbnailUrl,
        title: (req.body?.title as string | undefined)?.slice(0, 120) ?? '',
        durationSec: uploaded.durationSec,
        sizeBytes: uploaded.sizeBytes,
        format: uploaded.format,
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
      select: {
        id: true,
        url: true,
        thumbnailUrl: true,
        title: true,
        durationSec: true,
        format: true,
      },
    });

    await audit({
      actorId: req.user!.sub,
      action: 'PROJECT_VIDEO_UPLOADED',
      entityType: 'Project',
      entityId: projectId,
      metadata: { videoId: created.id, sizeBytes: uploaded.sizeBytes, format: uploaded.format },
    });

    res.status(201).json(ok({ video: created }));
  }),
);

/**
 * DELETE /api/images/videos/:id  (admin) — remove a video (DB row + Cloudinary).
 */
imagesRouter.delete(
  '/videos/:id',
  requireAuth,
  requireAdmin,
  validate({ params: z.object({ id: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const { id } = params<{ id: string }>(req);
    const video = await prisma.projectVideo.findUnique({
      where: { id },
      select: { id: true, projectId: true, publicId: true },
    });
    if (!video) throw NotFound('Video not found');

    // Best-effort remove from Cloudinary, then drop the DB row regardless.
    try {
      await deleteVideo(video.publicId);
    } catch {
      /* asset may already be gone; still remove our record */
    }
    await prisma.projectVideo.delete({ where: { id } });

    await audit({
      actorId: req.user!.sub,
      action: 'PROJECT_VIDEO_DELETED',
      entityType: 'Project',
      entityId: video.projectId,
      metadata: { videoId: id },
    });
    res.json(ok({ deleted: id }));
  }),
);
