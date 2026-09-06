import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { BadRequest, NotFound } from '../../lib/errors.js';
import { normalizeTitle } from '../search/normalize.js';
import { scoreNormalized } from '../search/similarity.js';
import { deletePrivateFile } from '../../lib/storage.js';
import { indexProject } from '../ai/ai.service.js';

/**
 * Fire-and-forget AI indexing: build the embedding + TLDR summary in the
 * background after a project is created/updated. Never blocks the response and
 * never throws (no-op when no Gemini key is configured).
 */
function scheduleAiIndex(projectId: string, status?: string) {
  if (status && status !== 'PUBLISHED') return;
  void indexProject(projectId).catch(() => {});
}

const listSelect = {
  id: true,
  title: true,
  year: true,
  level: true,
  abstract: true,
  keywords: true,
  // Bug fix: authorsText/supervisorName were written by the admin form but never
  // selected on read, so they were invisible on the detail page and blanked out
  // on edit. Now returned so reads round-trip the data the writer supplied.
  authorsText: true,
  supervisorName: true,
  priceMmk: true,
  status: true,
  hasConsent: true,
  fileStorageKey: true,
  aiSummary: true,
  createdAt: true,
  university: { select: { id: true, name: true, shortName: true } },
  department: { select: { id: true, name: true, code: true } },
  // Only image METADATA (id/kind/order) — never the bytes. Ordered so the first
  // GALLERY image is the natural cover and SPIN frames stay in sequence.
  images: {
    orderBy: [{ kind: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, kind: true, sortOrder: true },
  },
} satisfies Prisma.ProjectSelect;

function toPublicCard(p: any) {
  const images = (p.images ?? []) as Array<{ id: string; kind: string }>;
  const gallery = images.filter((i) => i.kind === 'GALLERY').map((i) => `/api/images/${i.id}`);
  const spin = images.filter((i) => i.kind === 'SPIN').map((i) => `/api/images/${i.id}`);
  return {
    id: p.id,
    title: p.title,
    year: p.year,
    level: p.level,
    abstract: p.abstract,
    keywords: p.keywords ? p.keywords.split(',').map((k: string) => k.trim()).filter(Boolean) : [],
    authorsText: p.authorsText ?? '',
    supervisorName: p.supervisorName ?? null,
    priceMmk: p.priceMmk,
    status: p.status,
    hasFile: Boolean(p.fileStorageKey),
    aiSummary: p.aiSummary ?? null,
    university: p.university,
    department: p.department,
    createdAt: p.createdAt,
    // Image surface for tiles + detail viewers.
    coverImageUrl: gallery[0] ?? spin[0] ?? null,
    imageCount: images.length,
    gallery,
    spin,
  };
}

export interface BrowseParams {
  year?: number;
  yearFrom?: number;
  yearTo?: number;
  universityId?: string;
  departmentId?: string;
  level?: string;
  q?: string; // simple keyword contains (browse box); similarity uses /search
  priceMin?: number;
  priceMax?: number;
  freeOnly?: boolean;
  hasFile?: boolean;
  sort?: 'newest' | 'oldest' | 'priceLow' | 'priceHigh' | 'title';
  page?: number;
  pageSize?: number;
  includeUnpublished?: boolean; // admin only
  status?: string; // admin-only explicit status filter (DRAFT/PUBLISHED/ARCHIVED)
}

export async function browseProjects(params: BrowseParams) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 12));

  const where: Prisma.ProjectWhereInput = {
    // Public browse is locked to PUBLISHED. Admin (includeUnpublished) may see all,
    // and may additionally narrow by an explicit status filter.
    ...(params.includeUnpublished
      ? params.status
        ? { status: params.status as any }
        : {}
      : { status: 'PUBLISHED' }),
    ...(params.year ? { year: params.year } : {}),
    // Year range (inclusive). Combines with an exact `year` if both are given.
    ...(params.yearFrom || params.yearTo
      ? {
          year: {
            ...(params.yearFrom ? { gte: params.yearFrom } : {}),
            ...(params.yearTo ? { lte: params.yearTo } : {}),
          },
        }
      : {}),
    ...(params.universityId ? { universityId: params.universityId } : {}),
    ...(params.departmentId ? { departmentId: params.departmentId } : {}),
    ...(params.level ? { level: params.level as any } : {}),
    // Price filters: freeOnly wins; otherwise apply min/max range if present.
    ...(params.freeOnly
      ? { priceMmk: 0 }
      : params.priceMin != null || params.priceMax != null
        ? {
            priceMmk: {
              ...(params.priceMin != null ? { gte: params.priceMin } : {}),
              ...(params.priceMax != null ? { lte: params.priceMax } : {}),
            },
          }
        : {}),
    // Only projects that have a downloadable full file attached.
    ...(params.hasFile ? { fileStorageKey: { not: null } } : {}),
    ...(params.q
      ? {
          OR: [
            { title: { contains: params.q } },
            { keywords: { contains: params.q } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ProjectOrderByWithRelationInput[] =
    params.sort === 'oldest'
      ? [{ year: 'asc' }, { createdAt: 'asc' }]
      : params.sort === 'priceLow'
        ? [{ priceMmk: 'asc' }, { year: 'desc' }]
        : params.sort === 'priceHigh'
          ? [{ priceMmk: 'desc' }, { year: 'desc' }]
          : params.sort === 'title'
            ? [{ title: 'asc' }]
            : [{ year: 'desc' }, { createdAt: 'desc' }]; // newest (default)

  const [total, rows] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      select: listSelect,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
    items: rows.map(toPublicCard),
  };
}

export async function getProjectDetail(id: string, opts: { isAdmin?: boolean } = {}) {
  const p = await prisma.project.findUnique({ where: { id }, select: listSelect });
  if (!p) throw NotFound('Project not found');
  if (p.status !== 'PUBLISHED' && !opts.isAdmin) throw NotFound('Project not found');

  // Videos are only surfaced on the detail view (kept out of list cards to keep
  // browse queries light). They carry a Cloudinary URL, not DB bytes.
  const videos = await prisma.projectVideo.findMany({
    where: { projectId: id },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, url: true, thumbnailUrl: true, title: true, durationSec: true, format: true },
  });

  return { ...toPublicCard(p), videos };
}

/**
 * "You might also like" — related published projects for a given project.
 * Reuses the blended similarity scorer against the project's own title, then
 * falls back to same-department / same-university projects if there aren't
 * enough close title matches. Always excludes the project itself.
 */
export async function getSimilarProjects(id: string, limit = 4) {
  const base = await prisma.project.findUnique({
    where: { id },
    select: { id: true, title: true, departmentId: true, universityId: true },
  });
  if (!base) throw NotFound('Project not found');

  const candidates = await prisma.project.findMany({
    where: { status: 'PUBLISHED', id: { not: id } },
    select: { ...listSelect },
    take: 2000,
  });

  const qNorm = normalizeTitle(base.title);
  const scored = candidates
    .map((p) => ({ p, score: scoreNormalized(qNorm, normalizeTitle(p.title)).score }))
    .sort((a, b) => b.score - a.score);

  // Prefer genuinely similar titles (score high), then top up with same-dept /
  // same-university projects so the row is never empty.
  const chosen: typeof candidates = [];
  const seen = new Set<string>();
  const push = (p: (typeof candidates)[number]) => {
    if (p && !seen.has(p.id)) {
      seen.add(p.id);
      chosen.push(p);
    }
  };

  for (const s of scored) {
    if (chosen.length >= limit) break;
    if (s.score >= 0.2) push(s.p);
  }
  if (chosen.length < limit) {
    for (const s of scored) {
      if (chosen.length >= limit) break;
      if (s.p.department?.id === base.departmentId) push(s.p);
    }
  }
  if (chosen.length < limit) {
    for (const s of scored) {
      if (chosen.length >= limit) break;
      if (s.p.university?.id === base.universityId) push(s.p);
    }
  }
  for (const s of scored) {
    if (chosen.length >= limit) break;
    push(s.p);
  }

  return chosen.slice(0, limit).map(toPublicCard);
}

/**
 * Lightweight title autocomplete for the search box. Returns published project
 * titles that contain the query (case-insensitive), most recent first.
 */
export async function autocompleteTitles(q: string, limit = 6) {
  const query = q.trim();
  if (query.length < 2) return [];
  const rows = await prisma.project.findMany({
    where: { status: 'PUBLISHED', title: { contains: query } },
    select: { id: true, title: true, year: true, department: { select: { code: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return rows.map((r) => ({ id: r.id, title: r.title, year: r.year, deptCode: r.department.code }));
}

export interface UpsertProjectInput {
  title: string;
  abstract: string;
  keywords?: string;
  year: number;
  level: string;
  authorsText?: string;
  supervisorName?: string;
  universityId: string;
  departmentId: string;
  priceMmk?: number;
  status?: string;
  hasConsent?: boolean;
}

async function assertDeptBelongsToUni(universityId: string, departmentId: string) {
  const dept = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!dept || dept.universityId !== universityId) {
    throw BadRequest('Department does not belong to the selected university');
  }
}

/** Consent gate enforced centrally: cannot PUBLISH without hasConsent = true. */
function enforceConsentGate(status: string | undefined, hasConsent: boolean | undefined) {
  if (status === 'PUBLISHED' && hasConsent !== true) {
    throw BadRequest('Cannot publish a project without recorded author consent (hasConsent=true)');
  }
}

export async function createProject(input: UpsertProjectInput, submittedById?: string) {
  await assertDeptBelongsToUni(input.universityId, input.departmentId);
  enforceConsentGate(input.status, input.hasConsent);
  const created = await prisma.project.create({
    data: {
      title: input.title.trim(),
      normalizedTitle: normalizeTitle(input.title),
      abstract: input.abstract,
      keywords: input.keywords ?? '',
      year: input.year,
      level: input.level as any,
      authorsText: input.authorsText ?? '',
      supervisorName: input.supervisorName,
      universityId: input.universityId,
      departmentId: input.departmentId,
      priceMmk: input.priceMmk ?? 0,
      status: (input.status as any) ?? 'DRAFT',
      hasConsent: input.hasConsent ?? false,
      submittedById,
    },
    select: listSelect,
  });
  scheduleAiIndex(created.id, created.status);
  return toPublicCard(created);
}

export async function updateProject(id: string, input: Partial<UpsertProjectInput>) {
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) throw NotFound('Project not found');

  const universityId = input.universityId ?? existing.universityId;
  const departmentId = input.departmentId ?? existing.departmentId;
  if (input.universityId || input.departmentId) {
    await assertDeptBelongsToUni(universityId, departmentId);
  }

  const nextStatus = input.status ?? existing.status;
  const nextConsent = input.hasConsent ?? existing.hasConsent;
  enforceConsentGate(nextStatus, nextConsent);

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(input.title ? { title: input.title.trim(), normalizedTitle: normalizeTitle(input.title) } : {}),
      ...(input.abstract !== undefined ? { abstract: input.abstract } : {}),
      ...(input.keywords !== undefined ? { keywords: input.keywords } : {}),
      ...(input.year !== undefined ? { year: input.year } : {}),
      ...(input.level !== undefined ? { level: input.level as any } : {}),
      ...(input.authorsText !== undefined ? { authorsText: input.authorsText } : {}),
      ...(input.supervisorName !== undefined ? { supervisorName: input.supervisorName } : {}),
      ...(input.universityId ? { universityId } : {}),
      ...(input.departmentId ? { departmentId } : {}),
      ...(input.priceMmk !== undefined ? { priceMmk: input.priceMmk } : {}),
      ...(input.status !== undefined ? { status: input.status as any } : {}),
      ...(input.hasConsent !== undefined ? { hasConsent: input.hasConsent } : {}),
    },
    select: listSelect,
  });
  scheduleAiIndex(updated.id, updated.status);
  return toPublicCard(updated);
}

export async function deleteProject(id: string) {
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) throw NotFound('Project not found');

  // Collect private files to remove AFTER the DB delete succeeds. Deleting the
  // project cascades its PaymentOrders (schema onDelete: Cascade), so their
  // uploaded proof screenshots would otherwise be orphaned on disk forever.
  const orders = await prisma.paymentOrder.findMany({
    where: { projectId: id, proofKey: { not: null } },
    select: { proofKey: true },
  });
  const filesToDelete = [
    ...(existing.fileStorageKey ? [existing.fileStorageKey] : []),
    ...orders.map((o) => o.proofKey!).filter(Boolean),
  ];

  await prisma.project.delete({ where: { id } });

  // Best-effort file cleanup (never fails the request if a file is already gone).
  await Promise.all(filesToDelete.map((key) => deletePrivateFile(key)));

  return { id };
}
