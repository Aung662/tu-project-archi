import { prisma } from '../../lib/prisma.js';
import { Conflict, NotFound } from '../../lib/errors.js';

/**
 * University & Department CRUD (admin-only).
 *
 * Guard rails:
 * - Unique name/shortName on University; unique (universityId, code) on Department.
 * - Deleting a University or Department that still has Projects is BLOCKED (the
 *   Project→University/Department relation is Restrict/no-cascade), so we check
 *   first and return a clear 409 instead of a raw FK error.
 * - Deleting a University cascades to its Departments (schema onDelete: Cascade)
 *   — but only allowed once no Projects reference the university.
 */

// ── Universities ─────────────────────────────────────────────────────────────

export async function createUniversity(input: { name: string; shortName: string; city?: string }) {
  const dupe = await prisma.university.findFirst({
    where: { OR: [{ name: input.name }, { shortName: input.shortName }] },
  });
  if (dupe) throw Conflict('A university with that name or short name already exists');

  return prisma.university.create({
    data: { name: input.name.trim(), shortName: input.shortName.trim(), city: input.city?.trim() || null },
  });
}

export async function updateUniversity(
  id: string,
  input: { name?: string; shortName?: string; city?: string },
) {
  const existing = await prisma.university.findUnique({ where: { id } });
  if (!existing) throw NotFound('University not found');

  if (input.name || input.shortName) {
    const dupe = await prisma.university.findFirst({
      where: {
        id: { not: id },
        OR: [
          ...(input.name ? [{ name: input.name }] : []),
          ...(input.shortName ? [{ shortName: input.shortName }] : []),
        ],
      },
    });
    if (dupe) throw Conflict('Another university already uses that name or short name');
  }

  return prisma.university.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.shortName !== undefined ? { shortName: input.shortName.trim() } : {}),
      ...(input.city !== undefined ? { city: input.city.trim() || null } : {}),
    },
  });
}

export async function deleteUniversity(id: string) {
  const existing = await prisma.university.findUnique({ where: { id } });
  if (!existing) throw NotFound('University not found');

  const projectCount = await prisma.project.count({ where: { universityId: id } });
  if (projectCount > 0) {
    throw Conflict(
      `Cannot delete: ${projectCount} project(s) still reference this university. Reassign or delete them first.`,
    );
  }
  // No projects → safe to delete (departments cascade away).
  await prisma.university.delete({ where: { id } });
  return { id };
}

// ── Departments ──────────────────────────────────────────────────────────────

export async function createDepartment(input: { universityId: string; name: string; code: string }) {
  const uni = await prisma.university.findUnique({ where: { id: input.universityId } });
  if (!uni) throw NotFound('University not found');

  const dupe = await prisma.department.findFirst({
    where: { universityId: input.universityId, code: input.code },
  });
  if (dupe) throw Conflict('A department with that code already exists in this university');

  return prisma.department.create({
    data: { universityId: input.universityId, name: input.name.trim(), code: input.code.trim() },
  });
}

export async function updateDepartment(
  id: string,
  input: { name?: string; code?: string },
) {
  const existing = await prisma.department.findUnique({ where: { id } });
  if (!existing) throw NotFound('Department not found');

  if (input.code && input.code !== existing.code) {
    const dupe = await prisma.department.findFirst({
      where: { universityId: existing.universityId, code: input.code, id: { not: id } },
    });
    if (dupe) throw Conflict('Another department in this university already uses that code');
  }

  return prisma.department.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.code !== undefined ? { code: input.code.trim() } : {}),
    },
  });
}

export async function deleteDepartment(id: string) {
  const existing = await prisma.department.findUnique({ where: { id } });
  if (!existing) throw NotFound('Department not found');

  const projectCount = await prisma.project.count({ where: { departmentId: id } });
  if (projectCount > 0) {
    throw Conflict(
      `Cannot delete: ${projectCount} project(s) still reference this department. Reassign or delete them first.`,
    );
  }
  await prisma.department.delete({ where: { id } });
  return { id };
}
