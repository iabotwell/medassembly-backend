import prisma from '../../config/database';

export async function listSupplies() {
  return prisma.supply.findMany({ orderBy: { name: 'asc' } });
}

export async function createSupply(data: { name: string; category?: string; unit?: string }) {
  return prisma.supply.create({ data });
}

export async function updateSupply(id: string, data: any) {
  return prisma.supply.update({ where: { id }, data });
}
