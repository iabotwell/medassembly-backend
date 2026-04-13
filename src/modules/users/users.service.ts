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

export async function deleteUser(id: string, requesterId: string) {
  if (id === requesterId) {
    throw new Error('No puedes eliminar tu propia cuenta.');
  }
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('Usuario no encontrado.');
  if (user.role === 'ADMIN') {
    throw new Error('No se puede eliminar al Super Administrador.');
  }

  // Check if user has related records that would prevent deletion
  const relatedCounts = await prisma.$transaction([
    prisma.attention.count({ where: { attendedById: id } }),
    prisma.measurement.count({ where: { measuredById: id } }),
    prisma.emergency.count({ where: { authorizedById: id } }),
    prisma.shiftMember.count({ where: { userId: id } }),
  ]);

  const total = relatedCounts.reduce((a, b) => a + b, 0);
  if (total > 0) {
    throw new Error(
      `No se puede eliminar: el usuario tiene ${total} registros asociados (atenciones, mediciones, emergencias o turnos). Desactivelo en su lugar.`
    );
  }

  await prisma.auditLog.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });
  return { message: 'Usuario eliminado' };
}
