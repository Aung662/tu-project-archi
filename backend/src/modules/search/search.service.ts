import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { normalizeTitle } from './normalize.js';
import { scoreNormalized, type ScoreBreakdown } from './similarity.js';

/** Context about the requester, for best-effort search analytics. */
export interface SearchContext {
  actorId?: string;
  ip?: string;
}

/**
 * Best-effort SearchLog write. Never blocks or fails the search — analytics must
 * not degrade the core feature.
 */
async function logSearch(entry: {
  kind: 'SEARCH' | 'CHECK';
  rawQuery: string;
  normalizedQuery: string;
  resultCount: number;
  topScore?: number;
  verdict?: string;
  ctx?: SearchContext;
}) {
  try {
    await prisma.searchLog.create({
      data: {
        kind: entry.kind,
        rawQuery: entry.rawQuery.slice(0, 300),
        normalizedQuery: entry.normalizedQuery.slice(0, 300),
        resultCount: entry.resultCount,
        topScore: entry.topScore ?? null,
        verdict: entry.verdict ?? null,
        actorId: entry.ctx?.actorId ?? null,
        ip: entry.ctx?.ip ?? null,
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('search log failed:', e);
  }
}

export type MatchKind = 'EXACT' | 'SIMILAR';

export interface SimilarityHit {
  kind: MatchKind;
  percent: number; // 0..100
  breakdown: ScoreBreakdown;
  project: {
    id: string;
    title: string;
    year: number;
    level: string;
    abstract: string;
    university: { id: string; name: string; shortName: string };
    department: { id: string; name: string; code: string };
    priceMmk: number;
    hasFile: boolean;
    status: string;
  };
}

export interface SearchFilters {
  year?: number;
  universityId?: string;
  departmentId?: string;
  level?: string;
}

const projectSelect = {
  id: true,
  title: true,
  normalizedTitle: true,
  year: true,
  level: true,
  abstract: true,
  priceMmk: true,
  fileStorageKey: true,
  status: true,
  university: { select: { id: true, name: true, shortName: true } },
  department: { select: { id: true, name: true, code: true } },
} satisfies Prisma.ProjectSelect;

function toHit(p: any, breakdown: ScoreBreakdown): SimilarityHit {
  const kind: MatchKind = breakdown.score >= env.SIMILARITY_EXACT_THRESHOLD ? 'EXACT' : 'SIMILAR';
  return {
    kind,
    percent: Math.round(breakdown.score * 100),
    breakdown,
    project: {
      id: p.id,
      title: p.title,
      year: p.year,
      level: p.level,
      abstract: p.abstract,
      university: p.university,
      department: p.department,
      priceMmk: p.priceMmk,
      hasFile: Boolean(p.fileStorageKey),
      status: p.status,
    },
  };
}

/**
 * Unified similarity search over PUBLISHED projects.
 * - PostgreSQL: uses pg_trgm to pre-filter candidates for scalability.
 * - SQLite/other: loads published candidates and scores in-app.
 * Both paths then apply the SAME blended scorer for consistent ranking.
 */
export async function searchSimilar(
  rawQuery: string,
  filters: SearchFilters = {},
  limit = 20,
  opts: { ctx?: SearchContext; log?: boolean } = {},
): Promise<{ query: string; normalizedQuery: string; total: number; results: SimilarityHit[] }> {
  const normalizedQuery = normalizeTitle(rawQuery);

  const where: Prisma.ProjectWhereInput = {
    status: 'PUBLISHED',
    ...(filters.year ? { year: filters.year } : {}),
    ...(filters.universityId ? { universityId: filters.universityId } : {}),
    ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
    ...(filters.level ? { level: filters.level as any } : {}),
  };

  let candidates: any[];

  if (env.DB_PROVIDER === 'postgresql' && normalizedQuery.length > 0) {
    // pg_trgm candidate pre-filter. We set a low trigram threshold, then rerank
    // with the blended scorer. Parameterized to avoid SQL injection.
    // NOTE: requires `CREATE EXTENSION pg_trgm;` + GIN index (see migration doc).
    const ids = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Project"
      WHERE status = 'PUBLISHED'
        AND similarity("normalizedTitle", ${normalizedQuery}) > ${env.SIMILARITY_SIMILAR_THRESHOLD / 2}
      ORDER BY similarity("normalizedTitle", ${normalizedQuery}) DESC
      LIMIT 200;`;
    const idList = ids.map((r) => r.id);
    candidates = idList.length
      ? await prisma.project.findMany({ where: { AND: [where, { id: { in: idList } }] }, select: projectSelect })
      : [];
  } else {
    // Portable path: bounded scan of published projects (fine for thesis scale).
    candidates = await prisma.project.findMany({ where, select: projectSelect, take: 2000 });
  }

  const hits = candidates
    .map((p) => toHit(p, scoreNormalized(normalizedQuery, p.normalizedTitle)))
    .filter((h) => h.breakdown.score >= env.SIMILARITY_SIMILAR_THRESHOLD)
    .sort((a, b) => b.breakdown.score - a.breakdown.score);

  // Log SEARCH rows here. checkDuplicate reuses this function with log:false and
  // writes its own CHECK row (with verdict) to avoid double-counting.
  if (opts.log !== false) {
    void logSearch({
      kind: 'SEARCH',
      rawQuery,
      normalizedQuery,
      resultCount: hits.length,
      topScore: hits[0]?.breakdown.score,
      ctx: opts.ctx,
    });
  }

  return {
    query: rawQuery,
    normalizedQuery,
    total: hits.length,
    results: hits.slice(0, limit),
  };
}

/** Quick duplicate check used before a student proposes a title. */
export async function checkDuplicate(rawTitle: string, ctx?: SearchContext) {
  const { results, normalizedQuery } = await searchSimilar(rawTitle, {}, 10, { log: false });
  const exact = results.filter((r) => r.kind === 'EXACT');
  const similar = results.filter((r) => r.kind === 'SIMILAR');
  const verdict =
    exact.length > 0 ? 'DUPLICATE_RISK' : similar.length > 0 ? 'SIMILAR_EXISTS' : 'LIKELY_UNIQUE';

  void logSearch({
    kind: 'CHECK',
    rawQuery: rawTitle,
    normalizedQuery,
    resultCount: results.length,
    topScore: results[0]?.breakdown.score,
    verdict,
    ctx,
  });

  return {
    normalizedQuery,
    hasExactOrNearDuplicate: exact.length > 0,
    verdict,
    exact,
    similar,
  };
}
