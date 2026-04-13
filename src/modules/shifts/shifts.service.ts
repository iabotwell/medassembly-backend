import prisma from '../../config/database';

export async function listShifts(eventId?: string) {
  const activeEvent = eventId
    ? { id: eventId }
    : await prisma.event.findFirst({ where: { isActive: true } });

  if (!activeEvent) return [];

  return prisma.shift.findMany({
    where: { eventId: activeEvent.id },
    include: { members: { include: { user: { select: { id: true, name: true, role: true, phone: true } } } } },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });
}

export async function createShift(data: { eventId: string; date: string; startTime: string; endTime: string }) {
  return prisma.shift.create({
    data: { eventId: data.eventId, date: new Date(data.date), startTime: data.startTime, endTime: data.endTime },
  });
}

export async function updateShift(id: string, data: any) {
  const updateData: any = { ...data };
  if (data.date) updateData.date = new Date(data.date);
  return prisma.shift.update({ where: { id }, data: updateData });
}

export async function activateShift(id: string) {
  const shift = await prisma.shift.findUnique({ where: { id } });
  if (!shift) throw new Error('Shift not found');

  await prisma.shift.updateMany({ where: { eventId: shift.eventId }, data: { isActive: false } });
  return prisma.shift.update({
    where: { id },
    data: { isActive: true },
    include: { members: { include: { user: { select: { id: true, name: true, role: true } } } } },
  });
}

export async function addMember(shiftId: string, data: { userId: string; role: string }) {
  return prisma.shiftMember.create({
    data: { shiftId, userId: data.userId, role: data.role as any },
    include: { user: { select: { id: true, name: true, role: true } } },
  });
}

export async function removeMember(memberId: string) {
  return prisma.shiftMember.delete({ where: { id: memberId } });
}

export async function getActiveShift() {
  const activeEvent = await prisma.event.findFirst({ where: { isActive: true } });
  if (!activeEvent) return null;

  return prisma.shift.findFirst({
    where: { eventId: activeEvent.id, isActive: true },
    include: { members: { include: { user: { select: { id: true, name: true, role: true, phone: true } } } } },
  });
}
