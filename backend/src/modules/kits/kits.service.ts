/**
 * Website Kits — paid, downloadable "build-a-website" guide bundles.
 *
 * Trust model is identical to paid project files:
 *   1. Buyer creates a KitOrder (KPay method + txn ref).
 *   2. Buyer uploads a payment-proof screenshot.
 *   3. A (super-)admin verifies the proof and APPROVES → access is granted.
 *   4. The buyer can now download the private zip (never a public URL).
 */
import { prisma } from '../../lib/prisma.js';
import { BadRequest, Conflict, NotFound } from '../../lib/errors.js';
import { deletePrivateFile } from '../../lib/storage.js';
import { audit } from '../../lib/audit.js';
import { sendMailAsync } from '../../lib/mailer.js';
import { env } from '../../config/env.js';

/** Shape a kit for public listing (never leaks the private storage key). */
function toPublicKit(k: {
  id: string;
  slug: string;
  title: string;
  titleMy: string;
  summary: string;
  summaryMy: string;
  priceMmk: number;
  fileName: string | null;
  fileSizeBytes: number | null;
  fileStorageKey: string | null;
  published: boolean;
  sortOrder: number;
  downloadCount: number;
}) {
  return {
    id: k.id,
    slug: k.slug,
    title: k.title,
    titleMy: k.titleMy,
    summary: k.summary,
    summaryMy: k.summaryMy,
    priceMmk: k.priceMmk,
    fileName: k.fileName,
    fileSizeBytes: k.fileSizeBytes,
    hasFile: Boolean(k.fileStorageKey),
    published: k.published,
    sortOrder: k.sortOrder,
    downloadCount: k.downloadCount,
  };
}

/** Public: list published kits (storefront). */
export async function listPublishedKits() {
  const kits = await prisma.websiteKit.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  return kits.map(toPublicKit);
}

/** Admin: list ALL kits (including unpublished). */
export async function listAllKits() {
  const kits = await prisma.websiteKit.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  return kits.map(toPublicKit);
}

export async function getKitBySlug(slug: string) {
  const kit = await prisma.websiteKit.findUnique({ where: { slug } });
  if (!kit || !kit.published) throw NotFound('Kit not found');
  return toPublicKit(kit);
}

/** Whether a user already has approved access to a kit. */
export async function userHasKitAccess(userId: string, kitId: string): Promise<boolean> {
  const approved = await prisma.kitOrder.findFirst({
    where: { userId, kitId, status: 'APPROVED' },
    select: { id: true },
  });
  return Boolean(approved);
}

/** Buyer: create (or reuse a pending) order for a kit. */
export async function createKitOrder(
  userId: string,
  input: { kitId: string; method: string; txnRef: string },
) {
  const kit = await prisma.websiteKit.findUnique({ where: { id: input.kitId } });
  if (!kit || !kit.published) throw NotFound('Kit not found');

  if (await userHasKitAccess(userId, kit.id)) {
    throw Conflict('You already have access to this kit');
  }

  const pending = await prisma.kitOrder.findFirst({
    where: { userId, kitId: kit.id, status: 'PENDING' },
  });
  if (pending) return pending;

  return prisma.kitOrder.create({
    data: {
      userId,
      kitId: kit.id,
      amountMmk: kit.priceMmk,
      method: input.method,
      txnRef: input.txnRef,
      status: 'PENDING',
    },
  });
}

export async function attachKitProof(userId: string, orderId: string, proofKey: string) {
  const order = await prisma.kitOrder.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== userId) throw NotFound('Order not found');
  if (order.status !== 'PENDING') throw BadRequest('Order is not pending');
  if (order.proofKey && order.proofKey !== proofKey) {
    await deletePrivateFile(order.proofKey);
  }
  return prisma.kitOrder.update({ where: { id: orderId }, data: { proofKey } });
}

export async function listMyKitOrders(userId: string) {
  return prisma.kitOrder.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { kit: { select: { id: true, slug: true, title: true, titleMy: true, priceMmk: true } } },
  });
}

// ── Admin review ─────────────────────────────────────────────────────────────
export async function listKitOrders(status?: string) {
  const rows = await prisma.kitOrder.findMany({
    where: status ? { status: status as any } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      kit: { select: { id: true, slug: true, title: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
  return rows.map(({ proofKey, ...rest }) => ({ ...rest, hasProof: Boolean(proofKey) }));
}

export async function getKitOrderForReview(orderId: string) {
  const order = await prisma.kitOrder.findUnique({ where: { id: orderId } });
  if (!order) throw NotFound('Order not found');
  return order;
}

export async function approveKitOrder(adminId: string, orderId: string, note?: string) {
  const order = await prisma.kitOrder.findUnique({ where: { id: orderId } });
  if (!order) throw NotFound('Order not found');
  if (order.status === 'APPROVED') return order;
  if (order.status === 'REJECTED') throw BadRequest('Order was already rejected');

  const updated = await prisma.kitOrder.update({
    where: { id: orderId },
    data: { status: 'APPROVED', reviewNote: note, reviewedById: adminId, reviewedAt: new Date() },
  });
  await audit({
    actorId: adminId,
    action: 'KIT_PAYMENT_APPROVED',
    entityType: 'KitOrder',
    entityId: orderId,
    metadata: { userId: order.userId, kitId: order.kitId, amountMmk: order.amountMmk },
  });
  void notifyKitDecision(order.userId, order.kitId, 'APPROVED', note);
  return updated;
}

/** Best-effort buyer email for a website-kit order decision. */
async function notifyKitDecision(
  userId: string,
  kitId: string,
  decision: 'APPROVED' | 'REJECTED',
  note?: string,
) {
  try {
    const [user, kit] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } }),
      prisma.websiteKit.findUnique({ where: { id: kitId }, select: { title: true, slug: true } }),
    ]);
    if (!user?.email) return;
    const title = kit?.title ?? 'your website kit';
    const link = `${env.FRONTEND_ORIGIN}/kits`;
    if (decision === 'APPROVED') {
      sendMailAsync({
        to: user.email,
        subject: `✅ Kit unlocked — ${title}`,
        text:
          `Hi ${user.name || 'there'},\n\n` +
          `Your payment for the "${title}" website kit has been approved. You can download it from your kits page:\n${link}\n\n` +
          (note ? `Note from the reviewer: ${note}\n\n` : '') +
          `Happy building!\nTU Project Archive`,
      });
    } else {
      sendMailAsync({
        to: user.email,
        subject: `⚠ Kit payment could not be verified — ${title}`,
        text:
          `Hi ${user.name || 'there'},\n\n` +
          `We couldn't verify your payment for the "${title}" website kit, so it was not approved.\n\n` +
          (note ? `Reason: ${note}\n\n` : '') +
          `You can re-submit your payment proof here:\n${link}\n\n` +
          `TU Project Archive`,
      });
    }
  } catch {
    /* best-effort */
  }
}

export async function rejectKitOrder(adminId: string, orderId: string, note?: string) {
  const order = await prisma.kitOrder.findUnique({ where: { id: orderId } });
  if (!order) throw NotFound('Order not found');
  if (order.status !== 'PENDING') throw BadRequest('Only pending orders can be rejected');

  const updated = await prisma.kitOrder.update({
    where: { id: orderId },
    data: { status: 'REJECTED', reviewNote: note, reviewedById: adminId, reviewedAt: new Date() },
  });
  await audit({
    actorId: adminId,
    action: 'KIT_PAYMENT_REJECTED',
    entityType: 'KitOrder',
    entityId: orderId,
    metadata: { note },
  });
  void notifyKitDecision(order.userId, order.kitId, 'REJECTED', note);
  return updated;
}

// ── Admin CRUD ───────────────────────────────────────────────────────────────
export interface UpsertKitInput {
  slug?: string;
  title: string;
  titleMy?: string;
  summary?: string;
  summaryMy?: string;
  priceMmk?: number;
  published?: boolean;
  sortOrder?: number;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export async function createKit(input: UpsertKitInput) {
  const slug = (input.slug && slugify(input.slug)) || slugify(input.title) || `kit-${Date.now()}`;
  const existing = await prisma.websiteKit.findUnique({ where: { slug } });
  if (existing) throw Conflict('A kit with this slug already exists');
  const kit = await prisma.websiteKit.create({
    data: {
      slug,
      title: input.title.trim(),
      titleMy: input.titleMy ?? '',
      summary: input.summary ?? '',
      summaryMy: input.summaryMy ?? '',
      priceMmk: input.priceMmk ?? 0,
      published: input.published ?? true,
      sortOrder: input.sortOrder ?? 0,
    },
  });
  return toPublicKit(kit);
}

export async function updateKit(id: string, input: Partial<UpsertKitInput>) {
  const existing = await prisma.websiteKit.findUnique({ where: { id } });
  if (!existing) throw NotFound('Kit not found');
  const kit = await prisma.websiteKit.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.titleMy !== undefined ? { titleMy: input.titleMy } : {}),
      ...(input.summary !== undefined ? { summary: input.summary } : {}),
      ...(input.summaryMy !== undefined ? { summaryMy: input.summaryMy } : {}),
      ...(input.priceMmk !== undefined ? { priceMmk: input.priceMmk } : {}),
      ...(input.published !== undefined ? { published: input.published } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    },
  });
  return toPublicKit(kit);
}

export async function deleteKit(id: string) {
  const existing = await prisma.websiteKit.findUnique({ where: { id } });
  if (!existing) throw NotFound('Kit not found');

  // Collect private files to remove after DB delete (kit zip + all proof images).
  const orders = await prisma.kitOrder.findMany({
    where: { kitId: id, proofKey: { not: null } },
    select: { proofKey: true },
  });
  const files = [
    ...(existing.fileStorageKey ? [existing.fileStorageKey] : []),
    ...orders.map((o) => o.proofKey!).filter(Boolean),
  ];

  await prisma.websiteKit.delete({ where: { id } });
  await Promise.all(files.map((k) => deletePrivateFile(k)));
  return { id };
}

/** Attach/replace the downloadable zip for a kit (admin). */
export async function setKitFile(
  id: string,
  file: { fileName: string; fileStorageKey: string; fileSizeBytes: number },
) {
  const existing = await prisma.websiteKit.findUnique({ where: { id } });
  if (!existing) throw NotFound('Kit not found');
  if (existing.fileStorageKey && existing.fileStorageKey !== file.fileStorageKey) {
    await deletePrivateFile(existing.fileStorageKey);
  }
  const kit = await prisma.websiteKit.update({
    where: { id },
    data: {
      fileName: file.fileName,
      fileStorageKey: file.fileStorageKey,
      fileSizeBytes: file.fileSizeBytes,
    },
  });
  return toPublicKit(kit);
}

/** Increment the download counter (best-effort). */
export function bumpKitDownloadCount(id: string) {
  void prisma.websiteKit.update({ where: { id }, data: { downloadCount: { increment: 1 } } }).catch(() => {});
}
