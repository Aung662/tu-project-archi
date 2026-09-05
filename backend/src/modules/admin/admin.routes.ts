import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, ok, params } from '../../lib/http.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import { prisma } from '../../lib/prisma.js';
import { audit } from '../../lib/audit.js';
import {
  browseProjects,
  createProject,
  deleteProject,
  getProjectDetail,
  updateProject,
} from '../projects/projects.service.js';
import { approveOrder, getOrderForReview, listOrders, rejectOrder } from '../payments/payments.service.js';
import { privateFileExists, streamPrivateFile } from '../../lib/storage.js';
import { contentDispositionAttachment } from '../../lib/http.js';
import { extname } from 'node:path';
import { NotFound } from '../../lib/errors.js';
import {
  createDepartment,
  createUniversity,
  deleteDepartment,
  deleteUniversity,
  updateDepartment,
  updateUniversity,
} from '../universities/universities.service.js';

export const adminRouter = Router();

// EVERY admin route requires a valid JWT AND role=ADMIN. This — not the hidden
// UI trigger — is the real protection for the admin area.
adminRouter.use(requireAuth, requireAdmin);

// ── Dashboard stats ────────────────────────────────────────────────────────
adminRouter.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [projects, published, pendingPayments, users, purchases] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'PUBLISHED' } }),
      prisma.paymentOrder.count({ where: { status: 'PENDING' } }),
      prisma.user.count(),
      prisma.purchaseAccess.count(),
    ]);
    res.json(ok({ projects, published, pendingPayments, users, purchases }));
  }),
);

// ── Projects management ──────────────────────────────────────────────────────
const upsertSchema = z.object({
  title: z.string().min(3).max(300),
  abstract: z.string().min(10),
  keywords: z.string().max(500).optional(),
  year: z.number().int().min(1990).max(2100),
  level: z.enum(['YEAR_3', 'YEAR_5', 'FINAL_YEAR', 'OTHER']),
  authorsText: z.string().max(500).optional(),
  supervisorName: z.string().max(200).optional(),
  universityId: z.string().min(1),
  departmentId: z.string().min(1),
  priceMmk: z.number().int().nonnegative().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  hasConsent: z.boolean().optional(),
});

adminRouter.get(
  '/projects',
  validate({
    query: z.object({
      page: z.coerce.number().int().min(1).default(1),
      pageSize: z.coerce.number().int().min(1).max(50).default(20),
      q: z.string().max(200).optional(),
      status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const q = req.query as any;
    const result = await browseProjects({ ...q, includeUnpublished: true });
    res.json(ok(result));
  }),
);

adminRouter.get(
  '/projects/:id',
  validate({ params: z.object({ id: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    res.json(ok(await getProjectDetail(params(req).id, { isAdmin: true })));
  }),
);

adminRouter.post(
  '/projects',
  validate({ body: upsertSchema }),
  asyncHandler(async (req, res) => {
    const created = await createProject(req.body, req.user!.sub);
    await audit({ actorId: req.user!.sub, action: 'PROJECT_CREATED', entityType: 'Project', entityId: created.id });
    res.status(201).json(ok(created));
  }),
);

adminRouter.put(
  '/projects/:id',
  validate({ params: z.object({ id: z.string().min(1) }), body: upsertSchema.partial() }),
  asyncHandler(async (req, res) => {
    const updated = await updateProject(params(req).id, req.body);
    await audit({
      actorId: req.user!.sub,
      action: req.body.status === 'PUBLISHED' ? 'PROJECT_PUBLISHED' : 'PROJECT_UPDATED',
      entityType: 'Project',
      entityId: params(req).id,
    });
    res.json(ok(updated));
  }),
);

adminRouter.delete(
  '/projects/:id',
  validate({ params: z.object({ id: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const result = await deleteProject(params(req).id);
    await audit({ actorId: req.user!.sub, action: 'PROJECT_DELETED', entityType: 'Project', entityId: params(req).id });
    res.json(ok(result));
  }),
);

// ── Payments management ──────────────────────────────────────────────────────
adminRouter.get(
  '/payments',
  validate({ query: z.object({ status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional() }) }),
  asyncHandler(async (req, res) => {
    res.json(ok(await listOrders((req.query as any).status)));
  }),
);

adminRouter.post(
  '/payments/:id/approve',
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({ note: z.string().max(500).optional() }).default({}),
  }),
  asyncHandler(async (req, res) => {
    res.json(ok(await approveOrder(req.user!.sub, params(req).id, req.body?.note)));
  }),
);

adminRouter.post(
  '/payments/:id/reject',
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({ note: z.string().max(500).optional() }).default({}),
  }),
  asyncHandler(async (req, res) => {
    res.json(ok(await rejectOrder(req.user!.sub, params(req).id, req.body?.note)));
  }),
);

// GET /api/admin/payments/:id/proof — stream the uploaded payment screenshot so
// the admin can actually VERIFY the manual payment before approving. This closes
// the core flow gap: previously proofs were stored but never viewable.
adminRouter.get(
  '/payments/:id/proof',
  validate({ params: z.object({ id: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const order = await getOrderForReview(params(req).id);
    if (!order.proofKey) throw NotFound('No payment proof uploaded for this order');
    if (!privateFileExists(order.proofKey)) throw NotFound('Stored proof file is missing');

    const ext = extname(order.proofKey).toLowerCase();
    const mime =
      ext === '.png' ? 'image/png' : ext === '.pdf' ? 'application/pdf' : 'image/jpeg';
    res.setHeader('Content-Type', mime);
    // Inline so the admin can preview the image directly in the browser tab.
    res.setHeader('Content-Disposition', contentDispositionAttachment(`proof-${order.id}${ext}`, 'inline'));
    streamPrivateFile(order.proofKey).pipe(res);
  }),
);

// ── Universities & Departments management (CRUD) ─────────────────────────────
const universityBody = z.object({
  name: z.string().min(2).max(200),
  shortName: z.string().min(1).max(30),
  city: z.string().max(120).optional(),
});

adminRouter.post(
  '/universities',
  validate({ body: universityBody }),
  asyncHandler(async (req, res) => {
    const created = await createUniversity(req.body);
    await audit({ actorId: req.user!.sub, action: 'UNIVERSITY_CREATED', entityType: 'University', entityId: created.id });
    res.status(201).json(ok(created));
  }),
);

adminRouter.put(
  '/universities/:id',
  validate({ params: z.object({ id: z.string().min(1) }), body: universityBody.partial() }),
  asyncHandler(async (req, res) => {
    const updated = await updateUniversity(params(req).id, req.body);
    await audit({ actorId: req.user!.sub, action: 'UNIVERSITY_UPDATED', entityType: 'University', entityId: params(req).id });
    res.json(ok(updated));
  }),
);

adminRouter.delete(
  '/universities/:id',
  validate({ params: z.object({ id: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const result = await deleteUniversity(params(req).id);
    await audit({ actorId: req.user!.sub, action: 'UNIVERSITY_DELETED', entityType: 'University', entityId: params(req).id });
    res.json(ok(result));
  }),
);

const departmentBody = z.object({
  universityId: z.string().min(1),
  name: z.string().min(2).max(200),
  code: z.string().min(1).max(20),
});

adminRouter.post(
  '/departments',
  validate({ body: departmentBody }),
  asyncHandler(async (req, res) => {
    const created = await createDepartment(req.body);
    await audit({ actorId: req.user!.sub, action: 'DEPARTMENT_CREATED', entityType: 'Department', entityId: created.id });
    res.status(201).json(ok(created));
  }),
);

adminRouter.put(
  '/departments/:id',
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({ name: z.string().min(2).max(200).optional(), code: z.string().min(1).max(20).optional() }),
  }),
  asyncHandler(async (req, res) => {
    const updated = await updateDepartment(params(req).id, req.body);
    await audit({ actorId: req.user!.sub, action: 'DEPARTMENT_UPDATED', entityType: 'Department', entityId: params(req).id });
    res.json(ok(updated));
  }),
);

adminRouter.delete(
  '/departments/:id',
  validate({ params: z.object({ id: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const result = await deleteDepartment(params(req).id);
    await audit({ actorId: req.user!.sub, action: 'DEPARTMENT_DELETED', entityType: 'Department', entityId: params(req).id });
    res.json(ok(result));
  }),
);

// ── Users management ─────────────────────────────────────────────────────────
adminRouter.get(
  '/users',
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, role: true, adminScope: true, createdAt: true },
    });
    res.json(ok(users));
  }),
);

adminRouter.put(
  '/users/:id/role',
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({ role: z.enum(['STUDENT', 'STAFF', 'ADMIN']) }),
  }),
  asyncHandler(async (req, res) => {
    const updated = await prisma.user.update({
      where: { id: params(req).id },
      data: { role: req.body.role },
      select: { id: true, email: true, role: true },
    });
    await audit({ actorId: req.user!.sub, action: 'USER_ROLE_CHANGED', entityType: 'User', entityId: params(req).id, metadata: { role: req.body.role } });
    res.json(ok(updated));
  }),
);

// ── Audit log ────────────────────────────────────────────────────────────────
adminRouter.get(
  '/audit',
  asyncHandler(async (_req, res) => {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { actor: { select: { name: true, email: true } } },
    });
    res.json(ok(logs));
  }),
);

// ── Search analytics ─────────────────────────────────────────────────────────
adminRouter.get(
  '/search-logs',
  validate({
    query: z.object({
      kind: z.enum(['SEARCH', 'CHECK']).optional(),
      limit: z.coerce.number().int().min(1).max(200).default(100),
    }),
  }),
  asyncHandler(async (req, res) => {
    const q = req.query as unknown as { kind?: 'SEARCH' | 'CHECK'; limit: number };
    const [recent, totalSearches, totalChecks, duplicateRisks] = await Promise.all([
      prisma.searchLog.findMany({
        where: q.kind ? { kind: q.kind } : {},
        orderBy: { createdAt: 'desc' },
        take: q.limit,
      }),
      prisma.searchLog.count({ where: { kind: 'SEARCH' } }),
      prisma.searchLog.count({ where: { kind: 'CHECK' } }),
      prisma.searchLog.count({ where: { verdict: 'DUPLICATE_RISK' } }),
    ]);
    res.json(ok({ recent, stats: { totalSearches, totalChecks, duplicateRisks } }));
  }),
);
