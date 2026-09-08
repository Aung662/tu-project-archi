import { Router } from 'express';
import { asyncHandler, ok } from '../../lib/http.js';
import { prisma } from '../../lib/prisma.js';

/**
 * Public archive statistics — a transparent, read-only snapshot of what's in the
 * archive. Everything here aggregates PUBLISHED projects only, so the numbers a
 * visitor sees match what they can actually browse. No auth, no writes.
 *
 * Cached in-process for a short window so a burst of visitors to the stats page
 * doesn't hammer the (free-tier) database.
 */
export const statsRouter = Router();

interface Bucket {
  label: string;
  value: number;
}
interface StatsPayload {
  totals: { projects: number; universities: number; departments: number; withFile: number };
  byYear: Bucket[];
  byLevel: Bucket[];
  byUniversity: Bucket[];
  byDepartment: Bucket[];
  topViewed: { id: string; title: string; year: number; viewCount: number; deptCode: string }[];
  generatedAt: string;
}

let cache: { at: number; data: StatsPayload } | null = null;
const TTL_MS = 60_000; // 1 minute

async function computeStats(): Promise<StatsPayload> {
  const where = { status: 'PUBLISHED' as const };

  const [projects, withFile, universities, departments, byYearRaw, byLevelRaw, byUniRaw, byDeptRaw, topViewed] =
    await Promise.all([
      prisma.project.count({ where }),
      prisma.project.count({ where: { ...where, fileStorageKey: { not: null } } }),
      prisma.university.count(),
      prisma.department.count(),
      prisma.project.groupBy({ by: ['year'], where, _count: { _all: true } }),
      prisma.project.groupBy({ by: ['level'], where, _count: { _all: true } }),
      prisma.project.groupBy({ by: ['universityId'], where, _count: { _all: true } }),
      prisma.project.groupBy({ by: ['departmentId'], where, _count: { _all: true } }),
      prisma.project.findMany({
        where,
        orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
        take: 8,
        select: { id: true, title: true, year: true, viewCount: true, department: { select: { code: true } } },
      }),
    ]);

  // Resolve university / department ids to human labels.
  const uniIds = byUniRaw.map((r) => r.universityId);
  const deptIds = byDeptRaw.map((r) => r.departmentId);
  const [unis, depts] = await Promise.all([
    prisma.university.findMany({ where: { id: { in: uniIds } }, select: { id: true, shortName: true } }),
    prisma.department.findMany({ where: { id: { in: deptIds } }, select: { id: true, code: true, name: true } }),
  ]);
  const uniName = new Map(unis.map((u) => [u.id, u.shortName]));
  const deptName = new Map(depts.map((d) => [d.id, `${d.code}`]));

  const byYear: Bucket[] = byYearRaw
    .map((r) => ({ label: String(r.year), value: r._count._all }))
    .sort((a, b) => Number(b.label) - Number(a.label));

  const levelLabels: Record<string, string> = {
    YEAR_3: '3rd Year',
    YEAR_5: '5th Year',
    FINAL_YEAR: 'Final Year',
    OTHER: 'Other',
  };
  const byLevel: Bucket[] = byLevelRaw
    .map((r) => ({ label: levelLabels[r.level] ?? r.level, value: r._count._all }))
    .sort((a, b) => b.value - a.value);

  const byUniversity: Bucket[] = byUniRaw
    .map((r) => ({ label: uniName.get(r.universityId) ?? '—', value: r._count._all }))
    .sort((a, b) => b.value - a.value);

  const byDepartment: Bucket[] = byDeptRaw
    .map((r) => ({ label: deptName.get(r.departmentId) ?? '—', value: r._count._all }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return {
    totals: { projects, universities, departments, withFile },
    byYear,
    byLevel,
    byUniversity,
    byDepartment,
    topViewed: topViewed.map((p) => ({
      id: p.id,
      title: p.title,
      year: p.year,
      viewCount: p.viewCount,
      deptCode: p.department.code,
    })),
    generatedAt: new Date().toISOString(),
  };
}

// GET /api/stats — public archive statistics (cached ~1 min).
statsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    if (!cache || Date.now() - cache.at > TTL_MS) {
      cache = { at: Date.now(), data: await computeStats() };
    }
    res.json(ok(cache.data));
  }),
);

// ── Topic cloud (aggregate keywords across published projects) ────────────────
// Stop-words filter out generic filler so the cloud surfaces real topics.
const STOP = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'for', 'to', 'in', 'on', 'with', 'using',
  'based', 'system', 'systems', 'project', 'application', 'app', 'management',
  'online', 'web', 'mobile', 'smart', 'model', 'analysis', 'design',
]);

let topicsCache: { at: number; data: Bucket[] } | null = null;

statsRouter.get(
  '/topics',
  asyncHandler(async (_req, res) => {
    if (!topicsCache || Date.now() - topicsCache.at > TTL_MS) {
      const rows = await prisma.project.findMany({
        where: { status: 'PUBLISHED' },
        select: { keywords: true },
      });
      const counts = new Map<string, number>();
      for (const r of rows) {
        const seen = new Set<string>(); // count a keyword once per project
        for (const raw of (r.keywords || '').split(',')) {
          const k = raw.trim();
          const key = k.toLowerCase();
          if (k.length < 3 || STOP.has(key) || seen.has(key)) continue;
          seen.add(key);
          counts.set(k, (counts.get(k) ?? 0) + 1);
        }
      }
      const data: Bucket[] = [...counts.entries()]
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
        .slice(0, 40);
      topicsCache = { at: Date.now(), data };
    }
    res.json(ok(topicsCache.data));
  }),
);
