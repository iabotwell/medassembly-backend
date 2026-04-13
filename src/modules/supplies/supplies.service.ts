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

export async function deleteSupply(id: string) {
  const usages = await prisma.attentionSupply.count({ where: { supplyId: id } });
  if (usages > 0) {
    throw new Error(`No se puede eliminar: este insumo tiene ${usages} usos registrados. Desactivelo en su lugar.`);
  }
  await prisma.supply.delete({ where: { id } });
  return { message: 'Insumo eliminado' };
}
