import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';

/**
 * Website Kit storefront + KPay-gated download.
 *
 * Verifies the user's requirement: after downloading, the buyer must first pay
 * (KPay), and the private zip is only served once an admin approves the order.
 */
const app = createApp();
const buyer = request.agent(app);
const superAdmin = request.agent(app);

let kitId = '';
let orderId = '';

beforeAll(async () => {
  const kit = await prisma.websiteKit.findFirst({ where: { published: true, fileStorageKey: { not: null } } });
  if (!kit) throw new Error('Seed website kits (npm run seed:kits) before tests');
  kitId = kit.id;

  await buyer.post('/api/auth/login').send({ email: 'student@tu-archive.mm', password: 'Student#2026' });
  await superAdmin.post('/api/auth/login').send({ email: 'admin@tu-archive.mm', password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe_Admin#2026' });
});

afterAll(async () => {
  if (orderId) await prisma.kitOrder.deleteMany({ where: { id: orderId } });
});

describe('Kit storefront (public)', () => {
  it('lists published kits without auth', async () => {
    const res = await request(app).get('/api/kits');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    // never leaks the private storage key
    expect(res.body.data[0].fileStorageKey).toBeUndefined();
    expect(res.body.data[0].hasFile).toBe(true);
  });

  it('exposes KPay payment info', async () => {
    const res = await request(app).get('/api/kits/payment-info');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('kpayNumber');
    expect(res.body.data).toHaveProperty('kpayName');
  });
});

describe('Download is KPay-gated', () => {
  it('blocks download without auth (401)', async () => {
    const res = await request(app).get(`/api/kits/${kitId}/download`);
    expect(res.status).toBe(401);
  });

  it('blocks download before purchase (403)', async () => {
    const res = await buyer.get(`/api/kits/${kitId}/download`);
    expect(res.status).toBe(403);
  });

  it('reports no access before purchase', async () => {
    const res = await buyer.get(`/api/kits/${kitId}/access`);
    expect(res.body.data.hasAccess).toBe(false);
  });
});

describe('Buy → approve → download', () => {
  it('buyer creates an order', async () => {
    const res = await buyer.post('/api/kits/orders').send({ kitId, method: 'KPay', txnRef: 'VITEST-KIT-001' });
    expect(res.status).toBe(201);
    orderId = res.body.data.id;
    expect(res.body.data.status).toBe('PENDING');
  });

  it('admin sees the pending order and approves it', async () => {
    const list = await superAdmin.get('/api/kits/admin/orders?status=PENDING');
    expect(list.status).toBe(200);
    const approve = await superAdmin.post(`/api/kits/admin/orders/${orderId}/approve`).send({ note: 'ok' });
    expect(approve.status).toBe(200);
    expect(approve.body.data.status).toBe('APPROVED');
  });

  it('buyer now has access and can download the zip', async () => {
    const access = await buyer.get(`/api/kits/${kitId}/access`);
    expect(access.body.data.hasAccess).toBe(true);

    const dl = await buyer.get(`/api/kits/${kitId}/download`);
    expect(dl.status).toBe(200);
    expect(dl.headers['content-type']).toContain('zip');
    expect(Number(dl.headers['content-length'])).toBeGreaterThan(0);
  });
});

describe('Kit admin CRUD is super-admin only', () => {
  it('a normal buyer cannot list all kits (403)', async () => {
    expect((await buyer.get('/api/kits/admin/all')).status).toBe(403);
  });
  it('super-admin can list all kits (200)', async () => {
    expect((await superAdmin.get('/api/kits/admin/all')).status).toBe(200);
  });
});
