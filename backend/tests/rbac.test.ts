import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';

/**
 * Department-scoped admin RBAC.
 *
 * Verifies the user's exact requirement: an admin of one department (e.g. EC)
 * can manage ONLY their own department's projects, may READ others, cannot
 * touch another department's (e.g. EP) projects, and only ever sees their own
 * department's dashboard/payments. Super-admins retain full access.
 */
const app = createApp();

const PW = 'DeptAdmin#2026';
const ecAdmin = request.agent(app);
const epAdmin = request.agent(app);
const superAdmin = request.agent(app);

let ecDeptId = '';
let epDeptId = '';
let ecProjectId = '';
let epProjectId = '';

beforeAll(async () => {
  // Two departments that already exist from the seed (YTU EC & EP).
  const ec = await prisma.department.findFirst({ where: { code: 'EC' } });
  const ep = await prisma.department.findFirst({ where: { code: 'EP' } });
  if (!ec || !ep) throw new Error('Seed must provide EC and EP departments');
  ecDeptId = ec.id;
  epDeptId = ep.id;

  const hash = await bcrypt.hash(PW, 10);
  await prisma.user.upsert({
    where: { email: 'ec-admin@tu-archive.mm' },
    update: { role: 'ADMIN', adminDepartmentId: ecDeptId, passwordHash: hash },
    create: { email: 'ec-admin@tu-archive.mm', name: 'EC Admin', passwordHash: hash, role: 'ADMIN', adminDepartmentId: ecDeptId },
  });
  await prisma.user.upsert({
    where: { email: 'ep-admin@tu-archive.mm' },
    update: { role: 'ADMIN', adminDepartmentId: epDeptId, passwordHash: hash },
    create: { email: 'ep-admin@tu-archive.mm', name: 'EP Admin', passwordHash: hash, role: 'ADMIN', adminDepartmentId: epDeptId },
  });

  // A project in each department, owned by that department.
  const ecP = await prisma.project.create({
    data: {
      title: 'RBAC Test EC Project', normalizedTitle: 'rbac test ec project',
      abstract: 'x'.repeat(20), year: 2025, level: 'YEAR_5',
      universityId: ec.universityId, departmentId: ecDeptId, status: 'DRAFT',
    },
  });
  const epP = await prisma.project.create({
    data: {
      title: 'RBAC Test EP Project', normalizedTitle: 'rbac test ep project',
      abstract: 'x'.repeat(20), year: 2025, level: 'YEAR_5',
      universityId: ep.universityId, departmentId: epDeptId, status: 'DRAFT',
    },
  });
  ecProjectId = ecP.id;
  epProjectId = epP.id;

  await ecAdmin.post('/api/auth/login').send({ email: 'ec-admin@tu-archive.mm', password: PW });
  await epAdmin.post('/api/auth/login').send({ email: 'ep-admin@tu-archive.mm', password: PW });
  await superAdmin.post('/api/auth/login').send({ email: 'admin@tu-archive.mm', password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe_Admin#2026' });
});

afterAll(async () => {
  await prisma.project.deleteMany({ where: { id: { in: [ecProjectId, epProjectId] } } });
  await prisma.user.deleteMany({ where: { email: { in: ['ec-admin@tu-archive.mm', 'ep-admin@tu-archive.mm'] } } });
});

describe('Department admin login exposes scope', () => {
  it('EC admin /me carries adminDepartmentId; super-admin has null', async () => {
    const me = await ecAdmin.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.data.user.adminDepartmentId).toBe(ecDeptId);

    const su = await superAdmin.get('/api/auth/me');
    expect(su.body.data.user.adminDepartmentId).toBeNull();
  });
});

describe('Department admin can manage own department', () => {
  it('EC admin can READ an EP project (read is open)', async () => {
    const res = await ecAdmin.get(`/api/admin/projects/${epProjectId}`);
    expect(res.status).toBe(200);
  });

  it('EC admin can EDIT their own EC project', async () => {
    const res = await ecAdmin.put(`/api/admin/projects/${ecProjectId}`).send({ supervisorName: 'Dr EC' });
    expect(res.status).toBe(200);
  });

  it('EC admin can CREATE a project in EC', async () => {
    const res = await ecAdmin.post('/api/admin/projects').send({
      title: 'EC Created Project', abstract: 'y'.repeat(20), year: 2025, level: 'YEAR_5',
      universityId: (await prisma.department.findUnique({ where: { id: ecDeptId } }))!.universityId,
      departmentId: ecDeptId,
    });
    expect(res.status).toBe(201);
    await prisma.project.delete({ where: { id: res.body.data.id } }).catch(() => {});
  });
});

describe('Department admin CANNOT touch another department', () => {
  it('EC admin CANNOT EDIT an EP project (403)', async () => {
    const res = await ecAdmin.put(`/api/admin/projects/${epProjectId}`).send({ supervisorName: 'hacker' });
    expect(res.status).toBe(403);
  });

  it('EC admin CANNOT DELETE an EP project (403)', async () => {
    const res = await ecAdmin.delete(`/api/admin/projects/${epProjectId}`);
    expect(res.status).toBe(403);
  });

  it('EC admin CANNOT CREATE a project inside EP (403)', async () => {
    const res = await ecAdmin.post('/api/admin/projects').send({
      title: 'Sneaky EP Project', abstract: 'z'.repeat(20), year: 2025, level: 'YEAR_5',
      universityId: (await prisma.department.findUnique({ where: { id: epDeptId } }))!.universityId,
      departmentId: epDeptId,
    });
    expect(res.status).toBe(403);
  });
});

describe('Department admin dashboard/list are scoped', () => {
  it('EC admin project list contains only EC projects', async () => {
    const res = await ecAdmin.get('/api/admin/projects?pageSize=50');
    expect(res.status).toBe(200);
    const deptIds = new Set<string>();
    for (const p of res.body.data.items) {
      const proj = await prisma.project.findUnique({ where: { id: p.id }, select: { departmentId: true } });
      if (proj) deptIds.add(proj.departmentId);
    }
    expect([...deptIds].every((d) => d === ecDeptId)).toBe(true);
  });

  it('EC admin stats are flagged scoped', async () => {
    const res = await ecAdmin.get('/api/admin/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.scoped).toBe(true);
  });

  it('super-admin stats are NOT scoped', async () => {
    const res = await superAdmin.get('/api/admin/stats');
    expect(res.body.data.scoped).toBe(false);
  });
});

describe('Cross-department management is super-admin only', () => {
  it('EC admin CANNOT list users (403)', async () => {
    expect((await ecAdmin.get('/api/admin/users')).status).toBe(403);
  });
  it('EC admin CANNOT create a university (403)', async () => {
    const res = await ecAdmin.post('/api/admin/universities').send({ name: 'Hacker University', shortName: 'HKU' });
    expect(res.status).toBe(403);
  });
  it('EC admin CANNOT read the audit log (403)', async () => {
    expect((await ecAdmin.get('/api/admin/audit')).status).toBe(403);
  });
  it('super-admin CAN list users (200)', async () => {
    expect((await superAdmin.get('/api/admin/users')).status).toBe(200);
  });
});

describe('Super-admin manages department admin bindings', () => {
  it('binds and clears a department admin, and blocks removing the last super-admin', async () => {
    // Make the student a department admin for EP.
    const student = await prisma.user.findUnique({ where: { email: 'student@tu-archive.mm' } });
    const bind = await superAdmin.put(`/api/admin/users/${student!.id}/role`).send({ role: 'ADMIN', adminDepartmentId: epDeptId });
    expect(bind.status).toBe(200);
    expect(bind.body.data.adminDepartmentId).toBe(epDeptId);

    // Restore the student to STUDENT (clears the binding).
    const restore = await superAdmin.put(`/api/admin/users/${student!.id}/role`).send({ role: 'STUDENT' });
    expect(restore.status).toBe(200);
    expect(restore.body.data.adminDepartmentId).toBeNull();

    // The seeded super-admin should NOT be demotable if it is the last one.
    const su = await prisma.user.findUnique({ where: { email: 'admin@tu-archive.mm' } });
    const superCount = await prisma.user.count({ where: { role: 'ADMIN', adminDepartmentId: null } });
    const demote = await superAdmin.put(`/api/admin/users/${su!.id}/role`).send({ role: 'STUDENT' });
    if (superCount <= 1) expect(demote.status).toBe(400);
  });
});
