import { prisma } from '../../lib/prisma.js';
import { BadRequest, Conflict, NotFound } from '../../lib/errors.js';
import { audit } from '../../lib/audit.js';
import { deletePrivateFile } from '../../lib/storage.js';

export async function createOrder(
  userId: string,
  input: { projectId: string; method: string; txnRef: string },
) {
  const project = await prisma.project.findUnique({ where: { id: input.projectId } });
  if (!project || project.status !== 'PUBLISHED') throw NotFound('Project not found');
  if (project.priceMmk <= 0) throw BadRequest('This project is free; no purchase needed');

  // Already owns it?
  const owned = await prisma.purchaseAccess.findUnique({
    where: { userId_projectId: { userId, projectId: input.projectId } },
  });
  if (owned) throw Conflict('You already have access to this project');

  // A pending order already exists?
  const pending = await prisma.paymentOrder.findFirst({
    where: { userId, projectId: input.projectId, status: 'PENDING' },
  });
  if (pending) return pending;

  return prisma.paymentOrder.create({
    data: {
      userId,
      projectId: input.projectId,
      amountMmk: project.priceMmk,
      method: input.method,
      txnRef: input.txnRef,
      status: 'PENDING',
    },
  });
}

export async function attachProof(userId: string, orderId: string, proofKey: string) {
  const order = await prisma.paymentOrder.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== userId) throw NotFound('Order not found');
  if (order.status !== 'PENDING') throw BadRequest('Order is not pending');
  // Delete any previously-uploaded proof so re-uploads don't orphan files on disk.
  if (order.proofKey && order.proofKey !== proofKey) {
    await deletePrivateFile(order.proofKey);
  }
  return prisma.paymentOrder.update({ where: { id: orderId }, data: { proofKey } });
}

/**
 * Admin: fetch a single order WITH its private proof key, for reviewing the
 * uploaded payment screenshot. Never exposed to non-admins (route is admin-gated).
 */
export async function getOrderForReview(orderId: string) {
  const order = await prisma.paymentOrder.findUnique({
    where: { id: orderId },
    include: {
      project: { select: { id: true, title: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
  if (!order) throw NotFound('Order not found');
  return order;
}

export async function listMyOrders(userId: string) {
  return prisma.paymentOrder.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { project: { select: { id: true, title: true, priceMmk: true } } },
  });
}

export async function listMyPurchases(userId: string) {
  const rows = await prisma.purchaseAccess.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      // Select fileStorageKey only to derive a boolean; never leak the internal
      // private-storage key to the client.
      project: { select: { id: true, title: true, year: true, fileStorageKey: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    createdAt: r.createdAt,
    project: {
      id: r.project.id,
      title: r.project.title,
      year: r.project.year,
      hasFile: Boolean(r.project.fileStorageKey),
    },
  }));
}

/** Admin: list orders with optional status filter. */
export async function listOrders(status?: string) {
  const rows = await prisma.paymentOrder.findMany({
    where: status ? { status: status as any } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      project: { select: { id: true, title: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
  // Expose whether a proof exists (boolean) without ever leaking the private
  // storage key. The admin fetches the actual image via the proof endpoint.
  return rows.map(({ proofKey, ...rest }) => ({ ...rest, hasProof: Boolean(proofKey) }));
}

/** Admin approve → grants PurchaseAccess (idempotent) + audit. */
export async function approveOrder(adminId: string, orderId: string, note?: string) {
  const order = await prisma.paymentOrder.findUnique({ where: { id: orderId } });
  if (!order) throw NotFound('Order not found');
  if (order.status === 'APPROVED') return order;
  if (order.status === 'REJECTED') throw BadRequest('Order was already rejected');

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.paymentOrder.update({
      where: { id: orderId },
      data: { status: 'APPROVED', reviewNote: note, reviewedById: adminId, reviewedAt: new Date() },
    });
    await tx.purchaseAccess.upsert({
      where: { userId_projectId: { userId: order.userId, projectId: order.projectId } },
      update: {},
      create: { userId: order.userId, projectId: order.projectId, grantedByOrder: orderId },
    });
    return updated;
  });

  await audit({
    actorId: adminId,
    action: 'PAYMENT_APPROVED',
    entityType: 'PaymentOrder',
    entityId: orderId,
    metadata: { userId: order.userId, projectId: order.projectId, amountMmk: order.amountMmk },
  });
  return result;
}

export async function rejectOrder(adminId: string, orderId: string, note?: string) {
  const order = await prisma.paymentOrder.findUnique({ where: { id: orderId } });
  if (!order) throw NotFound('Order not found');
  if (order.status !== 'PENDING') throw BadRequest('Only pending orders can be rejected');

  const updated = await prisma.paymentOrder.update({
    where: { id: orderId },
    data: { status: 'REJECTED', reviewNote: note, reviewedById: adminId, reviewedAt: new Date() },
  });
  await audit({
    actorId: adminId,
    action: 'PAYMENT_REJECTED',
    entityType: 'PaymentOrder',
    entityId: orderId,
    metadata: { note },
  });
  return updated;
}
