import prisma from '../../config/database';

export async function listCongregations() {
  return prisma.congregation.findMany({ include: { _count: { select: { elders: true } } }, orderBy: { name: 'asc' } });
}

export async function createCongregation(data: { name: string; circuit?: string; city?: string }) {
  return prisma.congregation.create({ data });
}

export async function updateCongregation(id: string, data: any) {
  return prisma.congregation.update({ where: { id }, data });
}

export async function deleteCongregation(id: string) {
  return prisma.congregation.delete({ where: { id } });
}

export async function listElders(congregationId: string) {
  return prisma.elder.findMany({ where: { congregationId }, orderBy: { name: 'asc' } });
}

export async function createElder(congregationId: string, data: { name: string; phone: string; role?: string }) {
  return prisma.elder.create({ data: { ...data, congregationId } });
}

export async function updateElder(id: string, data: any) {
  return prisma.elder.update({ where: { id }, data });
}

export async function deleteElder(id: string) {
  return prisma.elder.delete({ where: { id } });
}
