import { createHash } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, ok, params } from '../../lib/http.js';
import { BadRequest, Conflict, NotFound } from '../../lib/errors.js';
import { audit } from '../../lib/audit.js';
import { imageBufferMatchesMime } from '../../lib/fileSignature.js';
import { optimizeImage } from '../../lib/imageOptimize.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import { requireSuperAdmin } from '../../lib/adminScope.js';
import { validate } from '../../middleware/validate.js';
import { wiringImageUpload } from '../../middleware/upload.js';
import { wiringUploadLimiter } from '../../middleware/rateLimit.js';
import { prisma } from '../../lib/prisma.js';

export const wiringImagesRouter = Router();

const MAX_PAGE_SIZE = 60;
const MAX_UPLOADS_PER_REQUEST = 8;
const BOARD_IDS = [
  'arduino-uno', 'arduino-nano', 'arduino-mega', 'arduino-pro-mini',
  'esp32', 'esp32-cam', 'esp8266', 'nodemcu', 'raspberry-pi-pico',
  'raspberry-pi', 'stm32', 'teensy', 'attiny85', 'micro-bit',
  'jetson-nano', 'orange-pi', 'other',
] as const;
const boardIdSchema = z.enum(BOARD_IDS);

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function searchTerms(value: string | undefined): string[] {
  if (!value) return [];
  return [...new Set(normalizeSearchText(value).split(' ').filter(Boolean))]
    .slice(0, 8)
    .map((term) => term.slice(0, 48));
}

function cleanTags(raw: string): string {
  const parts = raw
    .split(/[;,]/)
    .map((tag) => tag.replace(/[<>\u0000-\u001f]/g, '').trim())
    .filter(Boolean)
    .slice(0, 12);
  const unique = [...new Set(parts.map((tag) => normalizeSearchText(tag)).filter(Boolean))];
  return unique.map((tag) => tag.slice(0, 40)).join('; ');
}

function publicUrl(id: string): string {
  return `/api/images/wiring/${encodeURIComponent(id)}`;
}

function adminPreviewUrl(id: string): string {
  return `/api/images/wiring/admin/${encodeURIComponent(id)}/file`;
}

const publicListQuery = z.object({
  q: z.string().max(120).optional(),
  boardId: boardIdSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(24),
});

/** Public searchable library: only manually approved reference images are listed. */
wiringImagesRouter.get(
  '/',
  validate({ query: publicListQuery }),
  asyncHandler(async (req, res) => {
    const { q, boardId, page, pageSize } = req.query as unknown as z.infer<typeof publicListQuery>;
    const terms = searchTerms(q);
    const where: Prisma.WiringImageWhereInput = {
      status: 'APPROVED',
      ...(boardId ? { boardId } : {}),
      ...(terms.length
        ? { AND: terms.map((term) => ({ searchText: { contains: term } })) }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.wiringImage.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: { id: true, boardId: true, tags: true, createdAt: true },
      }),
      prisma.wiringImage.count({ where }),
    ]);

    res.json(
      ok({
        items: items.map((item) => ({
          id: item.id,
          title: 'Wiring',
          boardId: item.boardId,
          tags: item.tags ? item.tags.split(';').map((tag) => tag.trim()).filter(Boolean) : [],
          url: publicUrl(item.id),
          createdAt: item.createdAt,
          referenceOnly: true as const,
        })),
        page,
        pageSize,
        total,
        hasMore: page * pageSize < total,
      }),
    );
  }),
);

/** Admin queue with no image bytes or raw filename/path in the JSON response. */
wiringImagesRouter.get(
  '/admin',
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  validate({
    query: z.object({
      status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING'),
      q: z.string().max(120).optional(),
      page: z.coerce.number().int().min(1).default(1),
      pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(24),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { status, q, page, pageSize } = req.query as unknown as {
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
      q?: string;
      page: number;
      pageSize: number;
    };
    const terms = searchTerms(q);
    const where: Prisma.WiringImageWhereInput = {
      status,
      ...(terms.length
        ? { AND: terms.map((term) => ({ searchText: { contains: term } })) }
        : {}),
    };

    const [rows, total, pending, approved, rejected, storage] = await Promise.all([
      prisma.wiringImage.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          boardId: true,
          tags: true,
          sizeBytes: true,
          status: true,
          contentChecked: true,
          rightsConfirmed: true,
          reviewNote: true,
          uploadBatchId: true,
          createdAt: true,
        },
      }),
      prisma.wiringImage.count({ where }),
      prisma.wiringImage.count({ where: { status: 'PENDING' } }),
      prisma.wiringImage.count({ where: { status: 'APPROVED' } }),
      prisma.wiringImage.count({ where: { status: 'REJECTED' } }),
      prisma.wiringImage.aggregate({ _sum: { sizeBytes: true } }),
    ]);

    res.json(
      ok({
        items: rows.map((item) => ({ ...item, previewUrl: adminPreviewUrl(item.id) })),
        page,
        pageSize,
        total,
        hasMore: page * pageSize < total,
        counts: { pending, approved, rejected, storageBytes: storage._sum.sizeBytes ?? 0 },
      }),
    );
  }),
);

/** Admin-only image preview. Pending/rejected bytes never use the public route. */
wiringImagesRouter.get(
  '/admin/:id/file',
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  validate({ params: z.object({ id: z.string().min(1).max(80) }) }),
  asyncHandler(async (req, res) => {
    const { id } = params<{ id: string }>(req);
    const image = await prisma.wiringImage.findUnique({ where: { id } });
    if (!image) throw NotFound('Wiring image not found');
    res.setHeader('Content-Type', image.mimeType);
    res.setHeader('Content-Length', String(image.data.length));
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(image.data);
  }),
);

const uploadBodySchema = z.object({
  batchId: z.string().uuid(),
  boardId: boardIdSchema.default('other'),
  boardName: z.string().max(100).optional(),
  tags: z.string().max(300).default(''),
  searchHints: z.union([z.string().max(240), z.array(z.string().max(240)).max(MAX_UPLOADS_PER_REQUEST)]).optional(),
});

/**
 * One idempotent chunk of a folder import. All images stay PENDING until an
 * administrator inspects them and confirms publication rights.
 */
wiringImagesRouter.post(
  '/bulk',
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  wiringUploadLimiter,
  wiringImageUpload.array('images', MAX_UPLOADS_PER_REQUEST),
  validate({ body: uploadBodySchema }),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof uploadBodySchema>;
    const files = (req.files as Express.Multer.File[]) ?? [];
    if (files.length === 0) throw BadRequest('Choose at least one image');

    const hints = Array.isArray(body.searchHints)
      ? body.searchHints
      : files.map(() => body.searchHints ?? '');
    const entries = files.map((file, index) => ({
      file,
      hint: hints[index] || file.originalname,
      sha256: createHash('sha256').update(file.buffer).digest('hex'),
    }));

    // Fail the whole chunk before writing if any MIME claim disagrees with bytes.
    for (const { file } of entries) {
      if (!imageBufferMatchesMime(file.buffer, file.mimetype)) {
        throw BadRequest('One or more files are not valid JPEG, PNG or WebP images');
      }
    }

    const seen = new Set<string>();
    const chunkUnique: typeof entries = [];
    let duplicateCount = 0;
    for (const entry of entries) {
      if (seen.has(entry.sha256)) {
        duplicateCount++;
        continue;
      }
      seen.add(entry.sha256);
      chunkUnique.push(entry);
    }

    const existing = await prisma.wiringImage.findMany({
      where: { sha256: { in: chunkUnique.map((entry) => entry.sha256) } },
      select: { sha256: true },
    });
    const existingHashes = new Set(existing.map((row) => row.sha256));
    const fresh = chunkUnique.filter((entry) => !existingHashes.has(entry.sha256));
    duplicateCount += chunkUnique.length - fresh.length;

    const optimized: Awaited<ReturnType<typeof optimizeImage>>[] = [];
    try {
      // Decode serially to keep memory bounded on smaller production instances.
      for (const { file } of fresh) optimized.push(await optimizeImage(file.buffer, 'GALLERY'));
    } catch {
      throw BadRequest('One or more images could not be decoded. Re-save them as JPEG, PNG or WebP and retry.');
    }

    const tags = cleanTags(body.tags);
    const created = await prisma.$transaction(
      fresh.map((entry, index) => {
        const searchText = normalizeSearchText(
          ['wiring', entry.hint, body.boardId, body.boardName ?? '', tags].join(' '),
        ).slice(0, 1000);
        const image = optimized[index];
        return prisma.wiringImage.upsert({
          where: { sha256: entry.sha256 },
          update: {},
          create: {
            data: new Uint8Array(image.data),
            mimeType: image.mimeType,
            sizeBytes: image.sizeBytes,
            sha256: entry.sha256,
            boardId: body.boardId,
            tags,
            searchText,
            uploadBatchId: body.batchId,
            uploadedById: req.user!.sub,
          },
          select: { id: true },
        });
      }),
    );

    await audit({
      actorId: req.user!.sub,
      action: 'WIRING_IMAGES_BULK_UPLOADED',
      entityType: 'WiringImageBatch',
      entityId: body.batchId,
      metadata: { received: files.length, uploaded: created.length, duplicates: duplicateCount },
    });

    res.status(201).json(
      ok({ batchId: body.batchId, received: files.length, uploaded: created.length, duplicates: duplicateCount }),
    );
  }),
);

const reviewBodySchema = z.object({
  ids: z.array(z.string().min(1).max(80)).min(1).max(60).refine((ids) => new Set(ids).size === ids.length, {
    message: 'Image IDs must be unique',
  }),
  decision: z.enum(['APPROVED', 'REJECTED']),
  contentChecked: z.boolean().default(false),
  rightsConfirmed: z.boolean().default(false),
  reviewNote: z.string().trim().max(500).default(''),
});

/** Batch moderation is atomic; all selected rows must still be pending. */
wiringImagesRouter.post(
  '/review-batch',
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  validate({ body: reviewBodySchema }),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof reviewBodySchema>;
    if (body.decision === 'APPROVED') {
      if (!body.contentChecked || !body.rightsConfirmed || body.reviewNote.length < 10) {
        throw BadRequest('Approval requires content and rights checks plus a review note (at least 10 characters)');
      }
    } else if (body.reviewNote.length < 5) {
      throw BadRequest('Add a short rejection reason (at least 5 characters)');
    }

    const reviewedAt = new Date();
    await prisma.$transaction(async (tx) => {
      // Compare-and-set on PENDING avoids two reviewers racing to approve/reject
      // the same images; the whole selection succeeds or rolls back together.
      const result = await tx.wiringImage.updateMany({
        where: { id: { in: body.ids }, status: 'PENDING' },
        data: {
          status: body.decision,
          contentChecked: body.decision === 'APPROVED' && body.contentChecked,
          rightsConfirmed: body.decision === 'APPROVED' && body.rightsConfirmed,
          reviewNote: body.reviewNote,
          reviewedById: req.user!.sub,
          reviewedAt,
        },
      });
      if (result.count !== body.ids.length) {
        throw Conflict('One or more selected images are missing or no longer pending; refresh the review list');
      }
    });

    await audit({
      actorId: req.user!.sub,
      action: body.decision === 'APPROVED' ? 'WIRING_IMAGES_APPROVED' : 'WIRING_IMAGES_REJECTED',
      entityType: 'WiringImage',
      entityId: body.ids[0],
      metadata: { count: body.ids.length, ids: body.ids, decision: body.decision },
    });
    res.json(ok({ reviewed: body.ids.length, decision: body.decision }));
  }),
);

/** Approved gallery bytes only. The short cache keeps moderation effective. */
wiringImagesRouter.get(
  '/:id',
  validate({ params: z.object({ id: z.string().min(1).max(80) }) }),
  asyncHandler(async (req, res) => {
    const { id } = params<{ id: string }>(req);
    const image = await prisma.wiringImage.findFirst({
      where: { id, status: 'APPROVED' },
      select: { data: true, mimeType: true },
    });
    if (!image) throw NotFound('Wiring image not found');
    res.setHeader('Content-Type', image.mimeType);
    res.setHeader('Content-Length', String(image.data.length));
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(image.data);
  }),
);

wiringImagesRouter.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  validate({ params: z.object({ id: z.string().min(1).max(80) }) }),
  asyncHandler(async (req, res) => {
    const { id } = params<{ id: string }>(req);
    const image = await prisma.wiringImage.findUnique({
      where: { id },
      select: { id: true, status: true, uploadBatchId: true },
    });
    if (!image) throw NotFound('Wiring image not found');
    await prisma.wiringImage.delete({ where: { id } });
    await audit({
      actorId: req.user!.sub,
      action: 'WIRING_IMAGE_DELETED',
      entityType: 'WiringImage',
      entityId: id,
      metadata: { status: image.status, uploadBatchId: image.uploadBatchId },
    });
    res.json(ok({ deleted: id }));
  }),
);
