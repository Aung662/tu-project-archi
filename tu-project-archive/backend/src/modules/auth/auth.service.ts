import { randomBytes, createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { BadRequest, Conflict, Unauthorized } from '../../lib/errors.js';
import { audit } from '../../lib/audit.js';

export interface JwtPayload {
  sub: string;
  role: 'STUDENT' | 'STAFF' | 'ADMIN';
  email: string;
}

// Pin the signing algorithm on BOTH sign and verify. Without an `algorithms`
// allowlist, a token could be presented with a different `alg` header (e.g. the
// classic "alg: none" / algorithm-confusion class of attacks). We only ever use
// HS256, so we reject anything else.
const JWT_ALG = 'HS256' as const;

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: JWT_ALG,
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: [JWT_ALG] }) as JwtPayload;
}

/**
 * A VALID (well-formed) bcrypt hash of a random secret, computed once at module
 * load. When a login is attempted for a non-existent user we compare against
 * this so the failure path does the SAME real bcrypt work as a wrong-password
 * path. Comparing against a malformed hash (e.g. all zeros) returns almost
 * instantly, which reintroduces the timing side-channel we are defending
 * against — so this must be a genuine hash.
 */
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(randomBytes(24).toString('hex'), 12);

const publicUser = (u: {
  id: string;
  email: string;
  name: string;
  role: string;
  adminScope: string | null;
  createdAt: Date;
}) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
  adminScope: u.adminScope,
  createdAt: u.createdAt,
});

export async function register(input: { email: string; password: string; name: string }) {
  const email = input.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw Conflict('An account with this email already exists');

  const passwordHash = await bcrypt.hash(input.password, 12);
  // Self-registration is always STUDENT. Elevated roles are assigned by an admin.
  const user = await prisma.user.create({
    data: { email, passwordHash, name: input.name.trim(), role: 'STUDENT' },
  });
  await audit({ actorId: user.id, action: 'AUTH_REGISTERED', entityType: 'User', entityId: user.id });
  return { user: publicUser(user), token: signToken({ sub: user.id, role: 'STUDENT', email }) };
}

export async function login(input: { email: string; password: string }) {
  const email = input.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });
  // Constant-ish response to avoid user enumeration: run a real bcrypt compare
  // against a valid dummy hash so this path takes the same time as a wrong
  // password (a malformed hash would return instantly and leak the difference).
  if (!user) {
    await bcrypt.compare(input.password, DUMMY_PASSWORD_HASH);
    // Log the attempt (no such user) with the attempted email for abuse triage.
    await audit({ action: 'AUTH_LOGIN_FAILED', entityType: 'User', entityId: 'unknown', metadata: { email } });
    throw Unauthorized('Invalid email or password');
  }
  const okPw = await bcrypt.compare(input.password, user.passwordHash);
  if (!okPw) {
    await audit({ actorId: user.id, action: 'AUTH_LOGIN_FAILED', entityType: 'User', entityId: user.id });
    throw Unauthorized('Invalid email or password');
  }

  await audit({ actorId: user.id, action: 'AUTH_LOGIN', entityType: 'User', entityId: user.id });
  return {
    user: publicUser(user),
    token: signToken({ sub: user.id, role: user.role as JwtPayload['role'], email: user.email }),
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw BadRequest('User no longer exists');
  return publicUser(user);
}

// ── Password reset ───────────────────────────────────────────────────────────

const RESET_TTL_MS = 1000 * 60 * 30; // 30 minutes
const hashToken = (raw: string) => createHash('sha256').update(raw).digest('hex');

/**
 * Begin a password reset. ALWAYS resolves the same way regardless of whether the
 * email exists (no user enumeration). Returns the raw token ONLY so the caller
 * can decide how to deliver it: in production email it; in dev (no SMTP) the API
 * surfaces it so the flow is testable. Any existing unused tokens are cleared.
 */
export async function requestPasswordReset(emailInput: string): Promise<string | null> {
  const email = emailInput.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null; // silently succeed to avoid leaking which emails exist

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });

  const rawToken = randomBytes(32).toString('hex');
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + RESET_TTL_MS),
    },
  });
  await audit({ actorId: user.id, action: 'PASSWORD_RESET_REQUESTED', entityType: 'User', entityId: user.id });
  return rawToken;
}

/** Complete a reset: validate the single-use, unexpired token and set the new password. */
export async function resetPassword(rawToken: string, newPassword: string): Promise<void> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { user: true },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw BadRequest('This reset link is invalid or has expired. Please request a new one.');
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    // Invalidate any other outstanding tokens for this user.
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId, usedAt: null } }),
  ]);
  await audit({ actorId: record.userId, action: 'PASSWORD_RESET_COMPLETED', entityType: 'User', entityId: record.userId });
}
