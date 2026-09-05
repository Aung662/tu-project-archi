import { createReadStream, existsSync, mkdirSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';

/**
 * StorageService: an abstraction over private file storage.
 *
 * Current impl = local disk OUTSIDE any static/public directory. Paid files are
 * never reachable by URL; they are streamed only through an authorized endpoint.
 *
 * SCALING SEAM: to move to S3-compatible object storage, reimplement these
 * methods to put/get objects and return short-TTL signed URLs. The rest of the
 * app only depends on the opaque `storageKey`.
 */

const PRIVATE_DIR = resolve(process.cwd(), env.PRIVATE_STORAGE_DIR);

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}
ensureDir(PRIVATE_DIR);

/** Produce a fresh opaque storage key + absolute path for a new upload. */
export function newStorageTarget(originalName: string): { key: string; absPath: string } {
  const safeExt = (originalName.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const key = `${Date.now()}-${randomUUID()}.${safeExt}`;
  return { key, absPath: join(PRIVATE_DIR, key) };
}

/** Resolve a stored key back to an absolute path, guarding against traversal. */
export function resolvePrivatePath(key: string): string {
  const abs = resolve(PRIVATE_DIR, key);
  if (!abs.startsWith(PRIVATE_DIR + '/') && abs !== PRIVATE_DIR) {
    throw new Error('Invalid storage key (path traversal blocked)');
  }
  return abs;
}

export function privateFileExists(key: string): boolean {
  try {
    return existsSync(resolvePrivatePath(key));
  } catch {
    return false;
  }
}

export function streamPrivateFile(key: string) {
  return createReadStream(resolvePrivatePath(key));
}

export async function deletePrivateFile(key: string): Promise<void> {
  try {
    await unlink(resolvePrivatePath(key));
  } catch {
    /* already gone */
  }
}

export { PRIVATE_DIR };
