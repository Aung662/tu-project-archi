import { prisma } from './prisma.js';

/** Records a privileged action. Best-effort: never blocks the main flow. */
export async function audit(params: {
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('audit log failed:', e);
  }
}
