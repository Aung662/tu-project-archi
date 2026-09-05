import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { BadRequest, NotFound } from '../../lib/errors.js';
import { normalizeTitle } from '../search/normalize.js';
import { deletePrivateFile } from '../../lib/storage.js';

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
  createdAt: true,
  university: { select: { id: true, name: true, shortName: true } },
  department: { select: { id: true, name: true, code: true } },
} satisfies Prisma.ProjectSelect;

function toPublicCard(p: any) {
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
    university: p.university,
    department: p.department,
    createdAt: p.createdAt,
  };
}

export interface BrowseParams {
  year?: number;
  universityId?: string;
  departmentId?: string;
  level?: string;
  q?: string; // simple keyword contains (browse box); similarity uses /search
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
    ...(params.universityId ? { universityId: params.universityId } : {}),
    ...(params.departmentId ? { departmentId: params.departmentId } : {}),
    ...(params.level ? { level: params.level as any } : {}),
    ...(params.q
      ? {
          OR: [
            { title: { contains: params.q } },
            { keywords: { contains: params.q } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      select: listSelect,
      orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
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
  return toPublicCard(p);
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
