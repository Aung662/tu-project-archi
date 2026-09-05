import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

/**
 * Integration tests against the real app + seeded SQLite DB.
 * Run `npm run seed` before these tests (CI does this in the test script).
 */
const app = createApp();
const agentAdmin = request.agent(app);
const agentStudent = request.agent(app);

describe('Public endpoints', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
  });

  it('GET /api/projects browses published projects without auth', async () => {
    const res = await request(app).get('/api/projects?pageSize=5');
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  it('GET /api/search ranks similar titles', async () => {
    const res = await request(app).get('/api/search?q=smart agriculture monitoring');
    expect(res.status).toBe(200);
    expect(res.body.data.results.length).toBeGreaterThan(0);
    // results are sorted descending by score
    const scores = res.body.data.results.map((r: any) => r.breakdown.score);
    const sorted = [...scores].sort((a, b) => b - a);
    expect(scores).toEqual(sorted);
  });

  it('GET /api/search/check flags duplicate risk for a known title', async () => {
    const res = await request(app).get(
      '/api/search/check?title=' +
        encodeURIComponent('Web Based Student Attendance Management System'),
    );
    expect(res.status).toBe(200);
    expect(['DUPLICATE_RISK', 'SIMILAR_EXISTS']).toContain(res.body.data.verdict);
  });
});

describe('Auth + RBAC', () => {
  it('rejects invalid login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@x.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  it('logs in admin and student', async () => {
    const a = await agentAdmin
      .post('/api/auth/login')
      .send({ email: 'admin@tu-archive.mm', password: 'ChangeMe_Admin#2026' });
    expect(a.status).toBe(200);
    expect(a.body.data.user.role).toBe('ADMIN');

    const s = await agentStudent
      .post('/api/auth/login')
      .send({ email: 'student@tu-archive.mm', password: 'Student#2026' });
    expect(s.status).toBe(200);
    expect(s.body.data.user.role).toBe('STUDENT');
  });

  it('blocks non-admin from admin routes', async () => {
    const res = await agentStudent.get('/api/admin/stats');
    expect(res.status).toBe(403);
  });

  it('blocks anonymous from admin routes', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  it('allows admin to read stats', async () => {
    const res = await agentAdmin.get('/api/admin/stats');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('projects');
  });
});

describe('Consent gate', () => {
  it('prevents publishing without consent, allows with consent', async () => {
    const unis = await request(app).get('/api/universities');
    const uni = unis.body.data[0];
    const base = {
      title: 'Vitest Consent Gate ' + Date.now(),
      abstract: 'integration test abstract content here',
      year: 2025,
      level: 'FINAL_YEAR',
      universityId: uni.id,
      departmentId: uni.departments[0].id,
    };

    const blocked = await agentAdmin
      .post('/api/admin/projects')
      .send({ ...base, status: 'PUBLISHED', hasConsent: false });
    expect(blocked.status).toBe(400);

    const okRes = await agentAdmin
      .post('/api/admin/projects')
      .send({ ...base, status: 'PUBLISHED', hasConsent: true });
    expect(okRes.status).toBe(201);
    expect(okRes.body.data.status).toBe('PUBLISHED');

    // cleanup
    await agentAdmin.delete(`/api/admin/projects/${okRes.body.data.id}`);
  });
});

describe('Paid file protection', () => {
  // Create a fresh, self-contained paid project so the test never depends on
  // ambient DB state (e.g. purchases left over from manual testing).
  let projectId: string;

  beforeAll(async () => {
    const unis = await request(app).get('/api/universities');
    const uni = unis.body.data[0];
    const created = await agentAdmin.post('/api/admin/projects').send({
      title: 'Vitest Paid Protection ' + Date.now(),
      abstract: 'a paid project used only to test download gating',
      year: 2025,
      level: 'FINAL_YEAR',
      universityId: uni.id,
      departmentId: uni.departments[0].id,
      priceMmk: 5000,
      status: 'PUBLISHED',
      hasConsent: true,
    });
    projectId = created.body.data.id;
  });

  it('blocks download when anonymous (401)', async () => {
    const res = await request(app).get(`/api/files/${projectId}/download`);
    expect(res.status).toBe(401);
  });

  it('blocks download without purchase (403/404, never 200)', async () => {
    const res = await agentStudent.get(`/api/files/${projectId}/download`);
    expect([403, 404]).toContain(res.status);
    expect(res.status).not.toBe(200);
  });

  afterAll(async () => {
    if (projectId) await agentAdmin.delete(`/api/admin/projects/${projectId}`);
  });
});

describe('Wave 5 — security hardening', () => {
  it('rejects weak password (no number) on register', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: `weak_${Date.now()}@test.mm`, password: 'onlyletters', name: 'Weak Pw' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects unknown fields via strict schema on login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@tu-archive.mm', password: 'Student#2026', role: 'ADMIN' });
    expect(res.status).toBe(400);
  });

  it('returns 400 (not 500) for malformed JSON body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": "x@y.com", ');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('MALFORMED_JSON');
  });

  it('rejects a file whose bytes do not match its extension (magic-byte check)', async () => {
    const unis = await request(app).get('/api/universities');
    const uni = unis.body.data[0];
    const created = await agentAdmin.post('/api/admin/projects').send({
      title: 'Vitest MagicByte ' + Date.now(),
      abstract: 'project used to test magic byte validation on upload',
      year: 2025,
      level: 'FINAL_YEAR',
      universityId: uni.id,
      departmentId: uni.departments[0].id,
      priceMmk: 0,
      status: 'DRAFT',
    });
    const pid = created.body.data.id;
    // Send HTML content but claim it's a .pdf with a pdf mimetype.
    const res = await agentAdmin
      .post(`/api/files/${pid}/upload`)
      .attach('file', Buffer.from('<html>not a pdf</html>'), {
        filename: 'fake.pdf',
        contentType: 'application/pdf',
      });
    expect(res.status).toBe(400);
    await agentAdmin.delete(`/api/admin/projects/${pid}`);
  });

  it('accepts a genuine PDF (valid magic bytes)', async () => {
    const unis = await request(app).get('/api/universities');
    const uni = unis.body.data[0];
    const created = await agentAdmin.post('/api/admin/projects').send({
      title: 'Vitest RealPDF ' + Date.now(),
      abstract: 'project used to test a valid pdf upload passes',
      year: 2025,
      level: 'FINAL_YEAR',
      universityId: uni.id,
      departmentId: uni.departments[0].id,
      priceMmk: 0,
      status: 'DRAFT',
    });
    const pid = created.body.data.id;
    const pdf = Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.from('1 0 obj\n<<>>\nendobj\n')]);
    const res = await agentAdmin
      .post(`/api/files/${pid}/upload`)
      .attach('file', pdf, { filename: 'real.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(201);
    await agentAdmin.delete(`/api/admin/projects/${pid}`);
  });

  it('writes a SearchLog row and exposes it to admin', async () => {
    const uniqueTerm = 'zzq' + Date.now();
    await request(app).get('/api/search?q=' + uniqueTerm);
    const res = await agentAdmin.get('/api/admin/search-logs?kind=SEARCH&limit=50');
    expect(res.status).toBe(200);
    expect(res.body.data.stats).toHaveProperty('totalSearches');
    const found = res.body.data.recent.some((r: any) => r.rawQuery === uniqueTerm);
    expect(found).toBe(true);
  });

  it('blocks non-admin from search-logs', async () => {
    const res = await agentStudent.get('/api/admin/search-logs');
    expect(res.status).toBe(403);
  });
});

describe('Payment flow — end-to-end with proof review (QA-C1)', () => {
  let projectId: string;
  let orderId: string;

  beforeAll(async () => {
    // ensure both agents are logged in (other suites may run in any order)
    await agentAdmin
      .post('/api/auth/login')
      .send({ email: 'admin@tu-archive.mm', password: 'ChangeMe_Admin#2026' });
    await agentStudent
      .post('/api/auth/login')
      .send({ email: 'student@tu-archive.mm', password: 'Student#2026' });

    const unis = await request(app).get('/api/universities');
    const uni = unis.body.data[0];
    const created = await agentAdmin.post('/api/admin/projects').send({
      title: 'Vitest Payment Flow ' + Date.now(),
      abstract: 'a paid project used to exercise the full purchase + proof review flow',
      year: 2025,
      level: 'FINAL_YEAR',
      universityId: uni.id,
      departmentId: uni.departments[0].id,
      priceMmk: 5000,
      status: 'PUBLISHED',
      hasConsent: true,
    });
    projectId = created.body.data.id;
  });

  it('rejects an order with an unsupported payment method (enum validation)', async () => {
    const res = await agentStudent
      .post('/api/payments/orders')
      .send({ projectId, method: 'Bitcoin', txnRef: 'X123' });
    expect(res.status).toBe(400);
  });

  it('student creates an order with a valid method', async () => {
    const res = await agentStudent
      .post('/api/payments/orders')
      .send({ projectId, method: 'KBZPay', txnRef: 'TXN-123456' });
    expect(res.status).toBe(201);
    orderId = res.body.data.id;
    expect(res.body.data.status).toBe('PENDING');
  });

  it('student uploads a valid image proof', async () => {
    const png = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    ]);
    const res = await agentStudent
      .post(`/api/payments/orders/${orderId}/proof`)
      .attach('proof', png, { filename: 'receipt.png', contentType: 'image/png' });
    expect(res.status).toBe(201);
  });

  it('admin list shows hasProof=true and never leaks the storage key', async () => {
    const res = await agentAdmin.get('/api/admin/payments?status=PENDING');
    expect(res.status).toBe(200);
    const order = res.body.data.find((o: any) => o.id === orderId);
    expect(order).toBeTruthy();
    expect(order.hasProof).toBe(true);
    expect(order.proofKey).toBeUndefined();
  });

  it('admin can stream the uploaded proof (QA-C1 core fix)', async () => {
    const res = await agentAdmin.get(`/api/admin/payments/${orderId}/proof`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('image/png');
  });

  it('non-admin cannot access the proof endpoint', async () => {
    const res = await agentStudent.get(`/api/admin/payments/${orderId}/proof`);
    expect(res.status).toBe(403);
  });

  it('student cannot download before approval (403/404, never 200)', async () => {
    const res = await agentStudent.get(`/api/files/${projectId}/download`);
    expect([403, 404]).toContain(res.status);
    expect(res.status).not.toBe(200);
  });

  it('admin approves → student is granted access', async () => {
    const appr = await agentAdmin.post(`/api/admin/payments/${orderId}/approve`).send({});
    expect(appr.status).toBe(200);
    expect(appr.body.data.status).toBe('APPROVED');

    const purchases = await agentStudent.get('/api/payments/purchases/mine');
    const owns = purchases.body.data.some((p: any) => p.project.id === projectId);
    expect(owns).toBe(true);
  });

  afterAll(async () => {
    if (projectId) await agentAdmin.delete(`/api/admin/projects/${projectId}`);
  });
});
