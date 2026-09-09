/**
 * Admin scope resolution & authorization helpers.
 *
 * The platform has TWO kinds of admin, both with role=ADMIN:
 *
 *   • SUPER-ADMIN      — role=ADMIN and adminDepartmentId = null.
 *                        Full platform access: manage every department's
 *                        projects, payments, users, universities and settings.
 *
 *   • DEPARTMENT ADMIN — role=ADMIN and adminDepartmentId set.
 *                        May CREATE / EDIT / DELETE only projects belonging to
 *                        their own department. May READ everything (read-only
 *                        for other departments). Only ever sees their own
 *                        department's dashboard, payments and reports.
 *
 * SECURITY: scope is ALWAYS re-read from the database here (never trusted from
 * the JWT), so demoting/rescoping an admin takes effect immediately even while
 * an old token is still valid. This mirrors the stale-role defense in
 * middleware/auth.ts.
 */
import type { RequestHandler } from 'express';
import { prisma } from './prisma.js';
import { Forbidden, Unauthorized } from './errors.js';

export interface AdminScope {
  userId: string;
  isSuperAdmin: boolean;
  /** The department this admin is bound to, or null for a super-admin. */
  departmentId: string | null;
  /** Convenience: the university of the bound department (null for super). */
  universityId: string | null;
}

/**
 * Resolve the authoritative admin scope for a user id. Throws if the account
 * no longer exists or is not an admin. Reads fresh from the DB every call.
 */
export async function resolveAdminScope(userId: string | undefined): Promise<AdminScope> {
  if (!userId) throw Unauthorized();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      adminDepartmentId: true,
      adminDepartment: { select: { universityId: true } },
    },
  });
  if (!user) throw Unauthorized('Account no longer exists');
  if (user.role !== 'ADMIN') throw Forbidden();

  const departmentId = user.adminDepartmentId ?? null;
  return {
    userId: user.id,
    isSuperAdmin: departmentId === null,
    departmentId,
    universityId: user.adminDepartment?.universityId ?? null,
  };
}

/**
 * Express middleware: allow only SUPER-ADMINS (platform-wide admins). Use this
 * to gate cross-department management surfaces — universities/departments CRUD,
 * user & role management, platform-wide audit log, and settings. Department
 * admins hitting these get 403.
 */
export const requireSuperAdmin: RequestHandler = async (req, _res, next) => {
  try {
    const scope = await resolveAdminScope(req.user?.sub);
    if (!scope.isSuperAdmin) {
      return next(Forbidden('This area is restricted to platform (super) admins'));
    }
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Throw Forbidden unless the scope may WRITE (create/edit/delete) a project in
 * the given department. Super-admins may write anywhere; department admins only
 * within their own department.
 */
export function assertCanWriteProjectInDept(scope: AdminScope, departmentId: string): void {
  if (scope.isSuperAdmin) return;
  if (scope.departmentId && scope.departmentId === departmentId) return;
  throw Forbidden('You can only manage projects in your own department');
}

/**
 * A Prisma `where` fragment that limits project queries to what the scope may
 * MANAGE (write). Super-admins get an empty filter (everything); department
 * admins get their own department only. Use for admin management lists so a
 * department admin's "Projects" tab shows only their editable projects.
 */
export function manageableProjectWhere(scope: AdminScope): { departmentId?: string } {
  return scope.isSuperAdmin ? {} : { departmentId: scope.departmentId ?? '__none__' };
}
