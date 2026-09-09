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
  getProjectDepartmentId,
  getProjectDetail,
  updateProject,
} from '../projects/projects.service.js';
import {
  assertCanWriteProjectInDept,
  manageableProjectWhere,
  requireSuperAdmin,
  resolveAdminScope,
} from '../../lib/adminScope.js';
import {
  approveOrder,
  getOrderForReview,
  getOrderProjectDepartmentId,
  listOrders,
  rejectOrder,
} from '../payments/payments.service.js';
import { privateFileExists, streamPrivateFile } from '../../lib/storage.js';
import { contentDispositionAttachment } from '../../lib/http.js';
import { extname } from 'node:path';
import { BadRequest, NotFound } from '../../lib/errors.js';
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
  asyncHandler(async (req, res) => {
    // Department admins get numbers scoped to their department; super-admins get
    // platform-wide totals.
    const scope = await resolveAdminScope(req.user!.sub);
    const dep = scope.departmentId ?? undefined;
    const projWhere = dep ? { departmentId: dep } : {};
    const orderWhere = (extra: object) =>
      dep ? { ...extra, project: { departmentId: dep } } : extra;

    const [projects, published, pendingPayments, users, purchases] = await Promise.all([
      prisma.project.count({ where: projWhere }),
      prisma.project.count({ where: { ...projWhere, status: 'PUBLISHED' } }),
      prisma.paymentOrder.count({ where: orderWhere({ status: 'PENDING' }) }),
      // User count is a platform-wide metric only meaningful to super-admins.
      dep ? Promise.resolve(0) : prisma.user.count(),
      prisma.purchaseAccess.count(dep ? { where: { project: { departmentId: dep } } } : undefined),
    ]);
    res.json(ok({ projects, published, pendingPayments, users, purchases, scoped: Boolean(dep) }));
  }),
);

// ── Rich dashboard: totals + 14-day time series + top pages/projects ─────────
adminRouter.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const DAYS = 14;
    const since = new Date();
    since.setDate(since.getDate() - (DAYS - 1));
    since.setHours(0, 0, 0, 0);

    // Department admins get project/payment/purchase figures scoped to their
    // department; super-admins get platform-wide figures.
    const scope = await resolveAdminScope(req.user!.sub);
    const dep = scope.departmentId ?? undefined;
    const projWhere = dep ? { departmentId: dep } : {};
    const pendWhere = dep
      ? { status: 'PENDING' as const, project: { departmentId: dep } }
      : { status: 'PENDING' as const };

    const [
      projects,
      published,
      pendingPayments,
      users,
      purchases,
      totalPageViews,
      totalSearches,
      totalChecks,
      recentSearchLogs,
      recentPageViews,
      byUniversityRaw,
      topPathsRaw,
    ] = await Promise.all([
      prisma.project.count({ where: projWhere }),
      prisma.project.count({ where: { ...projWhere, status: 'PUBLISHED' } }),
      prisma.paymentOrder.count({ where: pendWhere }),
      dep ? Promise.resolve(0) : prisma.user.count(),
      prisma.purchaseAccess.count(dep ? { where: { project: { departmentId: dep } } } : undefined),
      prisma.pageView.count(),
      prisma.searchLog.count({ where: { kind: 'SEARCH' } }),
      prisma.searchLog.count({ where: { kind: 'CHECK' } }),
      prisma.searchLog.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true, kind: true },
      }),
      prisma.pageView.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true, ip: true },
      }),
      prisma.project.groupBy({
        by: ['universityId'],
        _count: { _all: true },
        ...(dep ? { where: { departmentId: dep } } : {}),
      }),
      prisma.pageView.groupBy({
        by: ['path'],
        _count: { _all: true },
        orderBy: { _count: { path: 'desc' } },
        take: 8,
      }),
    ]);

    // Build a dense day-by-day series (fill gaps with zeros).
    const dayKey = (d: Date) => d.toISOString().slice(0, 10);
    const days: string[] = [];
    for (let i = 0; i < DAYS; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      days.push(dayKey(d));
    }
    const zero = () => Object.fromEntries(days.map((d) => [d, 0])) as Record<string, number>;

    const viewsByDay = zero();
    const uniqueByDay: Record<string, Set<string>> = Object.fromEntries(days.map((d) => [d, new Set()]));
    for (const pv of recentPageViews) {
      const k = dayKey(pv.createdAt);
      if (k in viewsByDay) {
        viewsByDay[k]++;
        uniqueByDay[k]?.add(pv.ip ?? 'anon');
      }
    }
    const searchesByDay = zero();
    const checksByDay = zero();
    for (const s of recentSearchLogs) {
      const k = dayKey(s.createdAt);
      if (s.kind === 'SEARCH' && k in searchesByDay) searchesByDay[k]++;
      if (s.kind === 'CHECK' && k in checksByDay) checksByDay[k]++;
    }

    const series = days.map((d) => ({
      date: d,
      views: viewsByDay[d],
      uniques: uniqueByDay[d]?.size ?? 0,
      searches: searchesByDay[d],
      checks: checksByDay[d],
    }));

    // Resolve university names for the distribution chart.
    const unis = await prisma.university.findMany({ select: { id: true, shortName: true } });
    const uniName = new Map(unis.map((u) => [u.id, u.shortName]));
    const byUniversity = byUniversityRaw
      .map((r) => ({ label: uniName.get(r.universityId) ?? '—', value: r._count._all }))
      .sort((a, b) => b.value - a.value);

    const topPaths = topPathsRaw.map((r) => ({ path: r.path, count: r._count._all }));

    res.json(
      ok({
        scoped: Boolean(dep),
        totals: {
          projects,
          published,
          pendingPayments,
          users,
          purchases,
          totalPageViews,
          totalSearches,
          totalChecks,
        },
        series,
        byUniversity,
        topPaths,
      }),
    );
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
      // "mine" limits the list to the admin's own department (super-admins can
      // still opt in to filter their view). Department admins are always scoped.
      mine: z.enum(['true', 'false']).optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const q = req.query as any;
    // A "mine" flag scopes the list to the admin's manageable (editable) set:
    //   super-admin → everything; department admin → their department only.
    const scope = await resolveAdminScope(req.user!.sub);
    const onlyMine = q.mine === 'true' || q.mine === true;
    const deptFilter = onlyMine || !scope.isSuperAdmin ? manageableProjectWhere(scope) : {};
    const result = await browseProjects({
      ...q,
      includeUnpublished: true,
      ...(deptFilter.departmentId ? { departmentId: deptFilter.departmentId } : {}),
    });
    res.json(ok(result));
  }),
);

// Read access is intentionally OPEN to any admin (department admins may READ
// other departments' projects — they just cannot modify them).
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
    // A department admin may only create projects INSIDE their own department.
    const scope = await resolveAdminScope(req.user!.sub);
    assertCanWriteProjectInDept(scope, req.body.departmentId);
    const created = await createProject(req.body, req.user!.sub);
    await audit({ actorId: req.user!.sub, action: 'PROJECT_CREATED', entityType: 'Project', entityId: created.id });
    res.status(201).json(ok(created));
  }),
);

adminRouter.put(
  '/projects/:id',
  validate({ params: z.object({ id: z.string().min(1) }), body: upsertSchema.partial() }),
  asyncHandler(async (req, res) => {
    const scope = await resolveAdminScope(req.user!.sub);
    // Must be allowed to write the project's CURRENT department...
    assertCanWriteProjectInDept(scope, await getProjectDepartmentId(params(req).id));
    // ...and, if moving it to another department, that TARGET department too.
    if (req.body.departmentId) assertCanWriteProjectInDept(scope, req.body.departmentId);
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
    const scope = await resolveAdminScope(req.user!.sub);
    assertCanWriteProjectInDept(scope, await getProjectDepartmentId(params(req).id));
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
    // Department admins see only orders for their department's projects.
    const scope = await resolveAdminScope(req.user!.sub);
    res.json(ok(await listOrders((req.query as any).status, scope.departmentId ?? undefined)));
  }),
);

adminRouter.post(
  '/payments/:id/approve',
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({ note: z.string().max(500).optional() }).default({}),
  }),
  asyncHandler(async (req, res) => {
    const scope = await resolveAdminScope(req.user!.sub);
    assertCanWriteProjectInDept(scope, await getOrderProjectDepartmentId(params(req).id));
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
    const scope = await resolveAdminScope(req.user!.sub);
    assertCanWriteProjectInDept(scope, await getOrderProjectDepartmentId(params(req).id));
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
    const scope = await resolveAdminScope(req.user!.sub);
    assertCanWriteProjectInDept(scope, await getOrderProjectDepartmentId(params(req).id));
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
  requireSuperAdmin,
  validate({ body: universityBody }),
  asyncHandler(async (req, res) => {
    const created = await createUniversity(req.body);
    await audit({ actorId: req.user!.sub, action: 'UNIVERSITY_CREATED', entityType: 'University', entityId: created.id });
    res.status(201).json(ok(created));
  }),
);

adminRouter.put(
  '/universities/:id',
  requireSuperAdmin,
  validate({ params: z.object({ id: z.string().min(1) }), body: universityBody.partial() }),
  asyncHandler(async (req, res) => {
    const updated = await updateUniversity(params(req).id, req.body);
    await audit({ actorId: req.user!.sub, action: 'UNIVERSITY_UPDATED', entityType: 'University', entityId: params(req).id });
    res.json(ok(updated));
  }),
);

adminRouter.delete(
  '/universities/:id',
  requireSuperAdmin,
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
  requireSuperAdmin,
  validate({ body: departmentBody }),
  asyncHandler(async (req, res) => {
    const created = await createDepartment(req.body);
    await audit({ actorId: req.user!.sub, action: 'DEPARTMENT_CREATED', entityType: 'Department', entityId: created.id });
    res.status(201).json(ok(created));
  }),
);

adminRouter.put(
  '/departments/:id',
  requireSuperAdmin,
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
  requireSuperAdmin,
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
  requireSuperAdmin,
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        adminScope: true,
        adminDepartmentId: true,
        adminDepartment: {
          select: { id: true, name: true, code: true, university: { select: { shortName: true } } },
        },
        createdAt: true,
      },
    });
    res.json(ok(users));
  }),
);

adminRouter.put(
  '/users/:id/role',
  requireSuperAdmin,
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({
      role: z.enum(['STUDENT', 'STAFF', 'ADMIN']),
      // Optional: bind an ADMIN to a department (department-scoped admin).
      //   null / omitted with role=ADMIN → SUPER-ADMIN (platform-wide)
      //   a department id with role=ADMIN → DEPARTMENT ADMIN
      // Ignored (forced null) for non-ADMIN roles.
      adminDepartmentId: z.string().min(1).nullable().optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const targetId = params(req).id;
    const { role, adminDepartmentId } = req.body as {
      role: 'STUDENT' | 'STAFF' | 'ADMIN';
      adminDepartmentId?: string | null;
    };

    // Only ADMINs may carry a department binding; clear it for other roles.
    let deptId: string | null = role === 'ADMIN' ? adminDepartmentId ?? null : null;

    if (deptId) {
      const dept = await prisma.department.findUnique({ where: { id: deptId } });
      if (!dept) throw NotFound('Department not found');
    }

    // Safety valve: never allow removing the LAST super-admin (an ADMIN with no
    // department). Otherwise nobody could manage the platform. This covers both
    // demotion (role change) and scoping the last super-admin to a department.
    const willBeSuperAdmin = role === 'ADMIN' && deptId === null;
    if (!willBeSuperAdmin) {
      const target = await prisma.user.findUnique({
        where: { id: targetId },
        select: { role: true, adminDepartmentId: true },
      });
      const targetIsSuperNow = target?.role === 'ADMIN' && target.adminDepartmentId === null;
      if (targetIsSuperNow) {
        const superAdmins = await prisma.user.count({
          where: { role: 'ADMIN', adminDepartmentId: null },
        });
        if (superAdmins <= 1) {
          throw BadRequest('Cannot remove the last super-admin; promote another super-admin first');
        }
      }
    }

    const updated = await prisma.user.update({
      where: { id: targetId },
      data: { role, adminDepartmentId: deptId },
      select: { id: true, email: true, role: true, adminDepartmentId: true },
    });
    await audit({
      actorId: req.user!.sub,
      action: 'USER_ROLE_CHANGED',
      entityType: 'User',
      entityId: targetId,
      metadata: { role, adminDepartmentId: deptId },
    });
    res.json(ok(updated));
  }),
);

// ── Audit log ────────────────────────────────────────────────────────────────
adminRouter.get(
  '/audit',
  requireSuperAdmin,
  asyncHandler(async (_req, res) => {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { actor: { select: { name: true, email: true } } },
    });
    res.json(ok(logs));
  }),
);

// ── CSV report exports (Excel-compatible; opens directly in Excel/Sheets) ────
/** Escape a value for CSV (quote if it contains comma/quote/newline). */
function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function toCsv(headers: string[], rows: unknown[][]): string {
  // Prepend a UTF-8 BOM so Excel opens Unicode correctly.
  return '\uFEFF' + [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
}
function sendCsv(res: import('express').Response, filename: string, csv: string) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}

adminRouter.get(
  '/reports/search-logs.csv',
  requireSuperAdmin,
  validate({ query: z.object({ kind: z.enum(['SEARCH', 'CHECK']).optional() }) }),
  asyncHandler(async (req, res) => {
    const q = req.query as { kind?: 'SEARCH' | 'CHECK' };
    const logs = await prisma.searchLog.findMany({
      where: q.kind ? { kind: q.kind } : {},
      orderBy: { createdAt: 'desc' },
      take: 5000,
    });
    const csv = toCsv(
      ['Date', 'Kind', 'Query', 'Normalized', 'Results', 'Top Score', 'Verdict', 'IP'],
      logs.map((l) => [
        l.createdAt.toISOString(),
        l.kind,
        l.rawQuery,
        l.normalizedQuery,
        l.resultCount,
        l.topScore ?? '',
        l.verdict ?? '',
        l.ip ?? '',
      ]),
    );
    sendCsv(res, `search-logs-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }),
);

adminRouter.get(
  '/reports/duplicate-risks.csv',
  requireSuperAdmin,
  asyncHandler(async (_req, res) => {
    // Title checks that were flagged as duplicate/near-duplicate risks.
    const logs = await prisma.searchLog.findMany({
      where: { kind: 'CHECK', verdict: { in: ['DUPLICATE_RISK', 'SIMILAR_EXISTS'] } },
      orderBy: { createdAt: 'desc' },
      take: 5000,
    });
    const csv = toCsv(
      ['Date', 'Proposed Title', 'Normalized', 'Verdict', 'Top Similarity %', 'Matches Found'],
      logs.map((l) => [
        l.createdAt.toISOString(),
        l.rawQuery,
        l.normalizedQuery,
        l.verdict ?? '',
        l.topScore != null ? Math.round(l.topScore * 100) : '',
        l.resultCount,
      ]),
    );
    sendCsv(res, `duplicate-risks-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }),
);

adminRouter.get(
  '/reports/projects.csv',
  asyncHandler(async (req, res) => {
    const scope = await resolveAdminScope(req.user!.sub);
    const projects = await prisma.project.findMany({
      where: scope.departmentId ? { departmentId: scope.departmentId } : {},
      orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
      include: { university: true, department: true },
      take: 5000,
    });
    const csv = toCsv(
      ['Title', 'Year', 'Level', 'University', 'Department', 'Status', 'Price (MMK)', 'Authors', 'Supervisor'],
      projects.map((p) => [
        p.title,
        p.year,
        p.level,
        p.university.shortName,
        p.department.code,
        p.status,
        p.priceMmk,
        p.authorsText,
        p.supervisorName ?? '',
      ]),
    );
    sendCsv(res, `projects-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }),
);

// ── Search analytics ─────────────────────────────────────────────────────────
adminRouter.get(
  '/search-logs',
  requireSuperAdmin,
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
