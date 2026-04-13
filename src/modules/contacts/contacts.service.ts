import prisma from '../../config/database';

export async function listContacts(type?: string) {
  const where = type ? { type: type as any } : {};
  return prisma.emergencyContact.findMany({ where, orderBy: { name: 'asc' } });
}

export async function createContact(data: { type: string; name: string; phone: string; details?: string }) {
  return prisma.emergencyContact.create({ data: data as any });
}

export async function updateContact(id: string, data: any) {
  return prisma.emergencyContact.update({ where: { id }, data });
}

export async function deleteContact(id: string) {
  return prisma.emergencyContact.delete({ where: { id } });
}
