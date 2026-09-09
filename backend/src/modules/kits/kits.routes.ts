import { Router } from 'express';
import { z } from 'zod';
import { extname } from 'node:path';
import { asyncHandler, ok, params, contentDispositionAttachment } from '../../lib/http.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import { requireSuperAdmin } from '../../lib/adminScope.js';
import { paymentProofUpload, projectFileUpload } from '../../middleware/upload.js';
import { uploadLimiter } from '../../middleware/rateLimit.js';
import { fileMatchesExtension } from '../../lib/fileSignature.js';
import {
  deletePrivateFile,
  privateFileExists,
  resolvePrivatePath,
  streamPrivateFile,
} from '../../lib/storage.js';
import { BadRequest, Forbidden, NotFound } from '../../lib/errors.js';
import { env } from '../../config/env.js';
import { audit } from '../../lib/audit.js';
import { prisma } from '../../lib/prisma.js';
import {
  approveKitOrder,
  attachKitProof,
  bumpKitDownloadCount,
  createKit,
  createKitOrder,
  deleteKit,
  getKitBySlug,
  getKitOrderForReview,
  listAllKits,
  listKitOrders,
  listMyKitOrders,
  listPublishedKits,
  rejectKitOrder,
  setKitFile,
  updateKit,
  userHasKitAccess,
} from './kits.service.js';

export const kitsRouter = Router();

// ── Public storefront ────────────────────────────────────────────────────────
// KPay payment details (placeholders unless configured via env). Shown at checkout.
kitsRouter.get('/payment-info', (_req, res) => {
  res.json(
    ok({
      kpayNumber: env.KPAY_NUMBER,
      kpayName: env.KPAY_NAME,
      instructions: env.PAYMENT_INSTRUCTIONS,
    }),
  );
});

kitsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(ok(await listPublishedKits()));
  }),
);

kitsRouter.get(
  '/slug/:slug',
  validate({ params: z.object({ slug: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    res.json(ok(await getKitBySlug(params<{ slug: string }>(req).slug)));
  }),
);

// ── Buyer flow (authenticated) ───────────────────────────────────────────────
kitsRouter.post(
  '/orders',
  requireAuth,
  validate({
    body: z.object({
      kitId: z.string().min(1),
      method: z.enum(['KPay', 'KBZPay', 'WavePay', 'AYAPay', 'CBPay', 'BankTransfer']),
      txnRef: z.string().trim().min(2).max(120),
    }),
  }),
  asyncHandler(async (req, res) => {
    res.status(201).json(ok(await createKitOrder(req.user!.sub, req.body)));
  }),
);

kitsRouter.post(
  '/orders/:id/proof',
  requireAuth,
  uploadLimiter,
  validate({ params: z.object({ id: z.string().min(1) }) }),
  paymentProofUpload.single('proof'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw BadRequest('No proof uploaded');
    const ext = extname(req.file.originalname).slice(1).toLowerCase();
    if (!fileMatchesExtension(resolvePrivatePath(req.file.filename), ext)) {
      await deletePrivateFile(req.file.filename);
      throw BadRequest(`Uploaded proof contents do not match a valid .${ext} file`);
    }
    res.status(201).json(ok(await attachKitProof(req.user!.sub, params(req).id, req.file.filename)));
  }),
);

kitsRouter.get(
  '/orders/mine',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(ok(await listMyKitOrders(req.user!.sub)));
  }),
);

// GET /api/kits/:id/access — does the current user already own this kit?
kitsRouter.get(
  '/:id/access',
  requireAuth,
  validate({ params: z.object({ id: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const hasAccess = req.user!.role === 'ADMIN' || (await userHasKitAccess(req.user!.sub, params(req).id));
    res.json(ok({ hasAccess }));
  }),
);

/**
 * GET /api/kits/:id/download
 * THE protected path. Streams the private zip only for a buyer with an APPROVED
 * order (or an admin). No public URL ever exists.
 */
kitsRouter.get(
  '/:id/download',
  requireAuth,
  validate({ params: z.object({ id: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const id = params<{ id: string }>(req).id;
    const kit = await prisma.websiteKit.findUnique({ where: { id } });
    if (!kit || !kit.fileStorageKey) throw NotFound('Kit file not available');

    const isAdmin = req.user!.role === 'ADMIN';
    if (!isAdmin && !(await userHasKitAccess(req.user!.sub, id))) {
      throw Forbidden('You have not purchased this kit');
    }
    if (!privateFileExists(kit.fileStorageKey)) throw NotFound('Stored file is missing');

    const downloadName = kit.fileName || `${kit.slug}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', contentDispositionAttachment(downloadName));
    if (kit.fileSizeBytes) res.setHeader('Content-Length', String(kit.fileSizeBytes));

    bumpKitDownloadCount(id);
    void audit({
      actorId: req.user!.sub,
      action: 'KIT_DOWNLOADED',
      entityType: 'WebsiteKit',
      entityId: id,
      metadata: { asAdmin: isAdmin },
    });
    streamPrivateFile(kit.fileStorageKey).pipe(res);
  }),
);

// ── Admin: CRUD + file upload + order review (super-admin only) ───────────────
const kitBody = z.object({
  slug: z.string().max(60).optional(),
  title: z.string().min(2).max(200),
  titleMy: z.string().max(200).optional(),
  summary: z.string().max(2000).optional(),
  summaryMy: z.string().max(2000).optional(),
  priceMmk: z.number().int().nonnegative().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

kitsRouter.get(
  '/admin/all',
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  asyncHandler(async (_req, res) => {
    res.json(ok(await listAllKits()));
  }),
);

kitsRouter.post(
  '/admin',
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  validate({ body: kitBody }),
  asyncHandler(async (req, res) => {
    const created = await createKit(req.body);
    await audit({ actorId: req.user!.sub, action: 'KIT_CREATED', entityType: 'WebsiteKit', entityId: created.id });
    res.status(201).json(ok(created));
  }),
);

kitsRouter.put(
  '/admin/:id',
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  validate({ params: z.object({ id: z.string().min(1) }), body: kitBody.partial() }),
  asyncHandler(async (req, res) => {
    const updated = await updateKit(params(req).id, req.body);
    await audit({ actorId: req.user!.sub, action: 'KIT_UPDATED', entityType: 'WebsiteKit', entityId: params(req).id });
    res.json(ok(updated));
  }),
);

kitsRouter.delete(
  '/admin/:id',
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  validate({ params: z.object({ id: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const result = await deleteKit(params(req).id);
    await audit({ actorId: req.user!.sub, action: 'KIT_DELETED', entityType: 'WebsiteKit', entityId: params(req).id });
    res.json(ok(result));
  }),
);

// Upload/replace the downloadable zip (zip only).
kitsRouter.post(
  '/admin/:id/file',
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  uploadLimiter,
  validate({ params: z.object({ id: z.string().min(1) }) }),
  projectFileUpload.single('file'),
  asyncHandler(async (req, res) => {
    const file = req.file;
    if (!file) throw NotFound('No file uploaded');
    const ext = extname(file.originalname).slice(1).toLowerCase();
    if (ext !== 'zip') {
      await deletePrivateFile(file.filename);
      throw BadRequest('Kit file must be a .zip');
    }
    if (!fileMatchesExtension(resolvePrivatePath(file.filename), ext)) {
      await deletePrivateFile(file.filename);
      throw BadRequest('Uploaded file contents do not match a valid .zip file');
    }
    const updated = await setKitFile(params(req).id, {
      fileName: file.originalname,
      fileStorageKey: file.filename,
      fileSizeBytes: file.size,
    });
    await audit({
      actorId: req.user!.sub,
      action: 'KIT_FILE_UPLOADED',
      entityType: 'WebsiteKit',
      entityId: params(req).id,
      metadata: { fileName: file.originalname, size: file.size },
    });
    res.status(201).json(ok(updated));
  }),
);

// Order review queue.
kitsRouter.get(
  '/admin/orders',
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  validate({ query: z.object({ status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional() }) }),
  asyncHandler(async (req, res) => {
    res.json(ok(await listKitOrders((req.query as any).status)));
  }),
);

kitsRouter.post(
  '/admin/orders/:id/approve',
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({ note: z.string().max(500).optional() }).default({}),
  }),
  asyncHandler(async (req, res) => {
    res.json(ok(await approveKitOrder(req.user!.sub, params(req).id, req.body?.note)));
  }),
);

kitsRouter.post(
  '/admin/orders/:id/reject',
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({ note: z.string().max(500).optional() }).default({}),
  }),
  asyncHandler(async (req, res) => {
    res.json(ok(await rejectKitOrder(req.user!.sub, params(req).id, req.body?.note)));
  }),
);

kitsRouter.get(
  '/admin/orders/:id/proof',
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  validate({ params: z.object({ id: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const order = await getKitOrderForReview(params(req).id);
    if (!order.proofKey) throw NotFound('No payment proof uploaded for this order');
    if (!privateFileExists(order.proofKey)) throw NotFound('Stored proof file is missing');
    const ext = extname(order.proofKey).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : ext === '.pdf' ? 'application/pdf' : 'image/jpeg';
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', contentDispositionAttachment(`kit-proof-${order.id}${ext}`, 'inline'));
    streamPrivateFile(order.proofKey).pipe(res);
  }),
);
