import prisma from '../../config/database';
import bcrypt from 'bcryptjs';

export async function listUsers(filters: { role?: string; isActive?: boolean }) {
  const where: any = {};
  if (filters.role) where.role = filters.role;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;
  return prisma.user.findMany({
    where,
    select: { id: true, email: true, name: true, phone: true, role: true, isActive: true, createdAt: true },
    orderBy: { name: 'asc' },
  });
}

export async function createUser(data: { email: string; password?: string; name: string; phone?: string; role: string }) {
  if (data.role === 'ADMIN') {
    const existingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (existingAdmin) {
      throw new Error('Ya existe un Super Administrador. Solo puede haber uno en el sistema.');
    }
  }
  const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : null;
  return prisma.user.create({
    data: { email: data.email, passwordHash, name: data.name, phone: data.phone, role: data.role as any },
    select: { id: true, email: true, name: true, phone: true, role: true, isActive: true, createdAt: true },
  });
}

export async function updateUser(id: string, data: any) {
  if (data.role && data.role === 'ADMIN') {
    const existingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN', NOT: { id } } });
    if (existingAdmin) {
      throw new Error('Ya existe un Super Administrador. Solo puede haber uno en el sistema.');
    }
  }
  const updateData: any = { ...data };
  if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password, 10);
  }
  delete updateData.password;
  return prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, email: true, name: true, phone: true, role: true, isActive: true },
  });
}

export async function toggleUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');
  if (user.role === 'ADMIN' && user.isActive) {
    throw new Error('No se puede desactivar al Super Administrador.');
  }
  return prisma.user.update({ where: { id }, data: { isActive: !user.isActive } });
}

export async function deleteUser(id: string, requesterId: string, force = false) {
  if (id === requesterId) {
    throw new Error('No puedes eliminar tu propia cuenta.');
  }
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('Usuario no encontrado.');
  if (user.role === 'ADMIN') {
    throw new Error('No se puede eliminar al Super Administrador.');
  }

  const [attentions, measurements, emergencies, shiftMembers] = await prisma.$transaction([
    prisma.attention.count({ where: { attendedById: id } }),
    prisma.measurement.count({ where: { measuredById: id } }),
    prisma.emergency.count({ where: { authorizedById: id } }),
    prisma.shiftMember.count({ where: { userId: id } }),
  ]);

  const total = attentions + measurements + emergencies + shiftMembers;

  if (total > 0 && !force) {
    throw new Error(
      `El usuario tiene ${total} registros asociados (${attentions} atenciones, ${measurements} mediciones, ${emergencies} emergencias, ${shiftMembers} turnos). Use eliminar con cascada para reasignarlos al administrador.`
    );
  }

  if (force && total > 0) {
    // Fully delete all related records (cascade)
    const userAttentions = await prisma.attention.findMany({ where: { attendedById: id }, select: { id: true } });
    const attentionIds = userAttentions.map(a => a.id);

    await prisma.measurement.deleteMany({ where: { measuredById: id } });
    if (attentionIds.length > 0) {
      await prisma.measurement.deleteMany({ where: { attentionId: { in: attentionIds } } });
      await prisma.attentionSupply.deleteMany({ where: { attentionId: { in: attentionIds } } });
    }
    await prisma.attention.deleteMany({ where: { attendedById: id } });
    await prisma.emergency.deleteMany({ where: { authorizedById: id } });
    await prisma.shiftMember.deleteMany({ where: { userId: id } });
  }

  await prisma.auditLog.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });
  // requesterId kept for future audit attribution (unused in current delete flow)
  void requesterId;
  return { message: force && total > 0 ? `Usuario y todos sus registros eliminados (${total} registros).` : 'Usuario eliminado.' };
}
