import prisma from '../../config/database';

export async function listEvents() {
  return prisma.event.findMany({ orderBy: { startDate: 'desc' } });
}

export async function createEvent(data: { name: string; startDate: string; endDate: string; location?: string; notes?: string }) {
  return prisma.event.create({
    data: { name: data.name, startDate: new Date(data.startDate), endDate: new Date(data.endDate), location: data.location, notes: data.notes },
  });
}

export async function updateEvent(id: string, data: any) {
  const updateData: any = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);
  return prisma.event.update({ where: { id }, data: updateData });
}

export async function activateEvent(id: string) {
  await prisma.event.updateMany({ data: { isActive: false } });
  return prisma.event.update({ where: { id }, data: { isActive: true } });
}

export async function getActiveEvent() {
  return prisma.event.findFirst({ where: { isActive: true } });
}
