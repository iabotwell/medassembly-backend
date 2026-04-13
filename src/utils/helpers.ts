import prisma from '../config/database';

export async function createAuditLog(
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  details?: any
) {
  await prisma.auditLog.create({
    data: { userId, action, entity, entityId, details },
  });
}
