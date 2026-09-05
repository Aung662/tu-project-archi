import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { normalizeTitle } from '../src/modules/search/normalize.js';

const prisma = new PrismaClient();

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(__dirname, 'seed-assets');

/** Attach demo public images (gallery + ordered 360° frames) to a project. */
async function attachDemoImages(projectId: string) {
  // Skip if this project already has images (keeps the seed idempotent).
  const existing = await prisma.projectImage.count({ where: { projectId } });
  if (existing > 0) return;

  const galleryDir = join(ASSETS, 'gallery');
  const spinDir = join(ASSETS, 'spin');

  const addImage = async (path: string, kind: 'GALLERY' | 'SPIN', order: number) => {
    const buf = readFileSync(path);
    const mimeType = path.endsWith('.png') ? 'image/png' : 'image/jpeg';
    await prisma.projectImage.create({
      data: {
        projectId,
        data: new Uint8Array(buf),
        mimeType,
        kind,
        sortOrder: order,
        sizeBytes: buf.length,
      },
    });
  };

  if (existsSync(galleryDir)) {
    const files = readdirSync(galleryDir).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();
    for (let i = 0; i < files.length; i++) await addImage(join(galleryDir, files[i]), 'GALLERY', i);
  }
  if (existsSync(spinDir)) {
    const files = readdirSync(spinDir).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();
    for (let i = 0; i < files.length; i++) await addImage(join(spinDir, files[i]), 'SPIN', i);
  }
}

const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@tu-archive.mm';
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe_Admin#2026';
const SEED_ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'Platform Admin';
const DEFAULT_PRICE = Number(process.env.DEFAULT_PROJECT_PRICE_MMK || 5000);

const universities = [
  { name: 'Yangon Technological University', shortName: 'YTU', city: 'Yangon' },
  { name: 'Mandalay Technological University', shortName: 'MTU', city: 'Mandalay' },
  { name: 'Technological University (Thanlyin)', shortName: 'TU-Thanlyin', city: 'Thanlyin' },
];

const departmentsByUni: Record<string, { name: string; code: string }[]> = {
  YTU: [
    { name: 'Electronic Engineering', code: 'EC' },
    { name: 'Information Technology Engineering', code: 'IT' },
    { name: 'Civil Engineering', code: 'CV' },
    { name: 'Mechanical Engineering', code: 'ME' },
  ],
  MTU: [
    { name: 'Information Technology Engineering', code: 'IT' },
    { name: 'Electrical Power Engineering', code: 'EP' },
  ],
  'TU-Thanlyin': [{ name: 'Information Technology Engineering', code: 'IT' }],
};

// Realistic-looking IT/EC project titles across years for meaningful similarity demos.
const sampleProjects = [
  { title: 'IoT Based Smart Agriculture Monitoring System', year: 2023, level: 'FINAL_YEAR', dept: 'IT' },
  { title: 'Smart Agriculture Monitoring System Using IoT and Machine Learning', year: 2024, level: 'FINAL_YEAR', dept: 'IT' },
  { title: 'Web Based Student Attendance Management System', year: 2022, level: 'YEAR_5', dept: 'IT' },
  { title: 'Face Recognition Based Attendance System', year: 2023, level: 'FINAL_YEAR', dept: 'EC' },
  { title: 'Online Library Management System for Technological University', year: 2021, level: 'YEAR_5', dept: 'IT' },
  { title: 'E-Commerce Website for Local Handicraft Products', year: 2024, level: 'FINAL_YEAR', dept: 'IT' },
  { title: 'Automatic Street Light Control Using Arduino', year: 2022, level: 'YEAR_3', dept: 'EC' },
  { title: 'Solar Powered Automatic Irrigation System', year: 2023, level: 'YEAR_5', dept: 'EP' },
  { title: 'Hospital Appointment Booking Mobile Application', year: 2024, level: 'FINAL_YEAR', dept: 'IT' },
  { title: 'Deep Learning Based Myanmar License Plate Recognition', year: 2024, level: 'FINAL_YEAR', dept: 'EC' },
  { title: 'Blockchain Based Academic Certificate Verification System', year: 2023, level: 'FINAL_YEAR', dept: 'IT' },
  { title: 'Sentiment Analysis of Myanmar Facebook Comments', year: 2024, level: 'FINAL_YEAR', dept: 'IT' },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Admin (idempotent)
  const passwordHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 12);
  await prisma.user.upsert({
    where: { email: SEED_ADMIN_EMAIL },
    // Keep the admin password in sync with the (env-provided) seed value.
    update: { passwordHash, name: SEED_ADMIN_NAME, role: 'ADMIN' },
    create: {
      email: SEED_ADMIN_EMAIL,
      passwordHash,
      name: SEED_ADMIN_NAME,
      role: 'ADMIN',
      adminScope: 'PLATFORM',
    },
  });
  console.log(`   ✓ Admin ensured: ${SEED_ADMIN_EMAIL}`);

  // A demo student account for testing the purchase flow.
  const studentHash = await bcrypt.hash('Student#2026', 12);
  await prisma.user.upsert({
    where: { email: 'student@tu-archive.mm' },
    update: {},
    create: {
      email: 'student@tu-archive.mm',
      passwordHash: studentHash,
      name: 'Demo Student',
      role: 'STUDENT',
    },
  });
  console.log('   ✓ Demo student ensured: student@tu-archive.mm / Student#2026');

  // Universities + departments
  const uniIdByShort: Record<string, string> = {};
  const deptIdByKey: Record<string, string> = {}; // `${short}:${code}`
  for (const u of universities) {
    const uni = await prisma.university.upsert({
      where: { shortName: u.shortName },
      update: { name: u.name, city: u.city },
      create: u,
    });
    uniIdByShort[u.shortName] = uni.id;
    for (const d of departmentsByUni[u.shortName] ?? []) {
      const dept = await prisma.department.upsert({
        where: { universityId_code: { universityId: uni.id, code: d.code } },
        update: { name: d.name },
        create: { name: d.name, code: d.code, universityId: uni.id },
      });
      deptIdByKey[`${u.shortName}:${d.code}`] = dept.id;
    }
  }
  console.log(`   ✓ ${universities.length} universities + departments ensured`);

  // Projects (assigned to YTU for demo). Idempotent-ish: skip if same title+year exists.
  let created = 0;
  for (const p of sampleProjects) {
    const universityId = uniIdByShort['YTU'];
    const departmentId = deptIdByKey[`YTU:${p.dept}`] ?? deptIdByKey['YTU:IT'];
    const exists = await prisma.project.findFirst({ where: { title: p.title, year: p.year } });
    if (exists) continue;
    const proj = await prisma.project.create({
      data: {
        title: p.title,
        normalizedTitle: normalizeTitle(p.title),
        abstract: `This project presents ${p.title.toLowerCase()}. It documents the objectives, methodology, system design, implementation and evaluation carried out by the student team.`,
        keywords: p.title.split(' ').slice(0, 4).join(', '),
        year: p.year,
        level: p.level as any,
        authorsText: 'Sample Author A, Sample Author B',
        supervisorName: 'Dr. Sample Supervisor',
        universityId,
        departmentId,
        status: 'PUBLISHED',
        hasConsent: true,
        priceMmk: DEFAULT_PRICE,
      },
    });
    // Flagship demo: give the first (IoT Smart Agriculture) project a full media
    // set — gallery photos + a 360° turntable — so reviewers see the feature.
    if (created === 0) await attachDemoImages(proj.id);
    created++;
  }
  console.log(`   ✓ ${created} sample projects created (published)`);
  console.log('   ✓ demo images attached to flagship project');

  // Demo analytics so the admin dashboard charts are populated on first run.
  const existingViews = await prisma.pageView.count();
  if (existingViews === 0) {
    const paths = ['/', '/browse', '/check', '/projects/:id', '/login', '/library'];
    const rows: { path: string; ip: string; createdAt: Date }[] = [];
    for (let d = 13; d >= 0; d--) {
      const day = new Date();
      day.setDate(day.getDate() - d);
      // A little organic variation across the 14-day window.
      const base = 6 + Math.round(Math.sin(d / 2) * 4) + Math.floor(Math.random() * 6);
      for (let i = 0; i < base; i++) {
        const when = new Date(day);
        when.setHours(9 + (i % 12), (i * 7) % 60, 0, 0);
        rows.push({
          path: paths[Math.floor(Math.random() * paths.length)],
          ip: `demo-${(i % 5) + 1}`,
          createdAt: when,
        });
      }
    }
    await prisma.pageView.createMany({ data: rows });

    const queries = ['iot smart agriculture', 'attendance system', 'blockchain certificate', 'license plate'];
    const searchRows = queries.flatMap((q, idx) => {
      const day = new Date();
      day.setDate(day.getDate() - (idx * 2));
      return [
        { kind: 'SEARCH', rawQuery: q, normalizedQuery: q, resultCount: 3, topScore: 0.7, createdAt: day },
        {
          kind: 'CHECK',
          rawQuery: q,
          normalizedQuery: q,
          resultCount: 2,
          topScore: 0.88,
          verdict: idx % 2 === 0 ? 'DUPLICATE_RISK' : 'SIMILAR_EXISTS',
          createdAt: day,
        },
      ];
    });
    await prisma.searchLog.createMany({ data: searchRows as any });
    console.log(`   ✓ demo analytics seeded (${rows.length} views, ${searchRows.length} search logs)`);
  }
  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
