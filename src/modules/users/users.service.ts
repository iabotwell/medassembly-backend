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
