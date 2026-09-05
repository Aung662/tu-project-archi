import { Router } from 'express';
import { z } from 'zod';
import { extname } from 'node:path';
import { asyncHandler, ok, params } from '../../lib/http.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { paymentProofUpload } from '../../middleware/upload.js';
import { uploadLimiter } from '../../middleware/rateLimit.js';
import { fileMatchesExtension } from '../../lib/fileSignature.js';
import { deletePrivateFile, resolvePrivatePath } from '../../lib/storage.js';
import { BadRequest } from '../../lib/errors.js';
import { env } from '../../config/env.js';
import {
  attachProof,
  createOrder,
  listMyOrders,
  listMyPurchases,
} from './payments.service.js';

export const paymentsRouter = Router();

// Public: how to pay (manual MMK instructions)
paymentsRouter.get('/instructions', (_req, res) => {
  res.json(ok({ instructions: env.PAYMENT_INSTRUCTIONS }));
});

paymentsRouter.use(requireAuth);

// POST /api/payments/orders — create a purchase order for a project
paymentsRouter.post(
  '/orders',
  validate({
    body: z.object({
      projectId: z.string().min(1),
      // Constrain to the manual MMK methods we actually support, instead of any
      // free-text string (prevents junk data feeding the admin review queue).
      method: z.enum(['KBZPay', 'WavePay', 'AYAPay', 'CBPay', 'BankTransfer']),
      txnRef: z.string().trim().min(2).max(120),
    }),
  }),
  asyncHandler(async (req, res) => {
    res.status(201).json(ok(await createOrder(req.user!.sub, req.body)));
  }),
);

// POST /api/payments/orders/:id/proof — upload payment screenshot
paymentsRouter.post(
  '/orders/:id/proof',
  uploadLimiter,
  validate({ params: z.object({ id: z.string().min(1) }) }),
  paymentProofUpload.single('proof'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw BadRequest('No proof uploaded');

    // HARDENING (S5): confirm the proof's real bytes match its extension.
    const ext = extname(req.file.originalname).slice(1).toLowerCase();
    if (!fileMatchesExtension(resolvePrivatePath(req.file.filename), ext)) {
      await deletePrivateFile(req.file.filename);
      throw BadRequest(`Uploaded proof contents do not match a valid .${ext} file`);
    }

    res.status(201).json(ok(await attachProof(req.user!.sub, params(req).id, req.file.filename)));
  }),
);

// GET /api/payments/orders/mine — my orders
paymentsRouter.get(
  '/orders/mine',
  asyncHandler(async (req, res) => {
    res.json(ok(await listMyOrders(req.user!.sub)));
  }),
);

// GET /api/payments/purchases/mine — my granted access (library)
paymentsRouter.get(
  '/purchases/mine',
  asyncHandler(async (req, res) => {
    res.json(ok(await listMyPurchases(req.user!.sub)));
  }),
);
