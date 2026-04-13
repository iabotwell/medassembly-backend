import prisma from '../../config/database';

export async function getShiftReport(shiftId: string) {
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    include: { members: { include: { user: { select: { id: true, name: true, role: true } } } }, event: true },
  });
  if (!shift) throw new Error('Shift not found');

  const dateStr = shift.date.toISOString().split('T')[0];
  const patients = await prisma.patient.findMany({
    where: {
      eventId: shift.eventId,
      createdAt: {
        gte: new Date(`${dateStr}T${shift.startTime}:00`),
        lte: new Date(`${dateStr}T${shift.endTime}:00`),
      },
    },
    include: { triage: true, attentions: { include: { attendedBy: { select: { name: true } } } } },
  });

  const emergencies = await prisma.emergency.findMany({
    where: {
      patient: { eventId: shift.eventId },
      createdAt: {
        gte: new Date(`${dateStr}T${shift.startTime}:00`),
        lte: new Date(`${dateStr}T${shift.endTime}:00`),
      },
    },
    include: { patient: { select: { fullName: true } }, authorizedBy: { select: { name: true } } },
  });

  return {
    shift,
    totalPatients: patients.length,
    byColor: {
      BLUE: patients.filter(p => p.triageColor === 'BLUE').length,
      YELLOW: patients.filter(p => p.triageColor === 'YELLOW').length,
      RED: patients.filter(p => p.triageColor === 'RED').length,
    },
    patients,
    emergencies,
  };
}

export async function getEventReport(eventId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('Event not found');

  const patients = await prisma.patient.findMany({
    where: { eventId },
    include: { congregation: true, triage: true, attentions: true },
  });

  const emergencies = await prisma.emergency.findMany({
    where: { patient: { eventId } },
    include: { patient: { select: { fullName: true } } },
  });

  const byCongregation: Record<string, number> = {};
  patients.forEach(p => {
    const name = p.congregation.name;
    byCongregation[name] = (byCongregation[name] || 0) + 1;
  });

  const attentionTimes = patients
    .filter(p => p.status === 'DISCHARGED' && p.attentions.length > 0)
    .map(p => {
      const lastAttention = p.attentions[p.attentions.length - 1];
      if (lastAttention.dischargedAt) {
        return (new Date(lastAttention.dischargedAt).getTime() - new Date(lastAttention.createdAt).getTime()) / 60000;
      }
      return null;
    })
    .filter(Boolean) as number[];

  const avgAttentionMinutes = attentionTimes.length > 0
    ? Math.round(attentionTimes.reduce((a, b) => a + b, 0) / attentionTimes.length)
    : 0;

  return {
    event,
    totalPatients: patients.length,
    byColor: {
      BLUE: patients.filter(p => p.triageColor === 'BLUE').length,
      YELLOW: patients.filter(p => p.triageColor === 'YELLOW').length,
      RED: patients.filter(p => p.triageColor === 'RED').length,
    },
    byStatus: {
      DISCHARGED: patients.filter(p => p.status === 'DISCHARGED').length,
      REFERRED: patients.filter(p => p.status === 'REFERRED').length,
      IN_ATTENTION: patients.filter(p => p.status === 'IN_ATTENTION').length,
      WAITING: patients.filter(p => ['WAITING_TRIAGE', 'WAITING_ATTENTION'].includes(p.status)).length,
    },
    byCongregation,
    avgAttentionMinutes,
    totalEmergencies: emergencies.length,
    emergencies,
  };
}

export async function getPatientReport(patientId: string) {
  return prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      congregation: true,
      event: true,
      triage: { include: { answers: { include: { question: true } } } },
      attentions: {
        include: {
          attendedBy: { select: { name: true, role: true } },
          measurements: { include: { measuredBy: { select: { name: true } } }, orderBy: { createdAt: 'asc' } },
          suppliesUsed: { include: { supply: true } },
        },
      },
      emergencies: { include: { authorizedBy: { select: { name: true } } } },
    },
  });
}

export async function getSuppliesReport(eventId: string) {
  const usages = await prisma.attentionSupply.findMany({
    where: { attention: { patient: { eventId } } },
    include: { supply: true, attention: { select: { patient: { select: { fullName: true } } } } },
  });

  const bySupply: Record<string, { name: string; totalQuantity: number; unit: string | null }> = {};
  usages.forEach(u => {
    if (!bySupply[u.supplyId]) {
      bySupply[u.supplyId] = { name: u.supply.name, totalQuantity: 0, unit: u.supply.unit };
    }
    bySupply[u.supplyId].totalQuantity += u.quantity;
  });

  return { usages, summary: Object.values(bySupply) };
}

export async function getTeamReport(eventId: string) {
  const attentions = await prisma.attention.findMany({
    where: { patient: { eventId } },
    include: { attendedBy: { select: { id: true, name: true, role: true } } },
  });

  const byMember: Record<string, { name: string; role: string; attentions: number }> = {};
  attentions.forEach(a => {
    if (!byMember[a.attendedById]) {
      byMember[a.attendedById] = { name: a.attendedBy.name, role: a.attendedBy.role, attentions: 0 };
    }
    byMember[a.attendedById].attentions++;
  });

  const shifts = await prisma.shift.findMany({
    where: { eventId },
    include: { members: { include: { user: { select: { id: true, name: true } } } } },
  });

  return { memberStats: Object.values(byMember), shifts };
}

export async function getDashboardData() {
  const activeEvent = await prisma.event.findFirst({ where: { isActive: true } });
  if (!activeEvent) return null;

  const patients = await prisma.patient.findMany({
    where: { eventId: activeEvent.id, status: { notIn: ['DISCHARGED', 'REFERRED'] } },
    include: {
      congregation: true,
      triage: true,
      attentions: {
        where: { dischargedAt: null },
        include: { attendedBy: { select: { id: true, name: true } } },
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const activeEmergencies = await prisma.emergency.findMany({
    where: { resolved: false, patient: { eventId: activeEvent.id } },
    include: { patient: { select: { fullName: true, triageColor: true } } },
  });

  const activeShift = await prisma.shift.findFirst({
    where: { eventId: activeEvent.id, isActive: true },
    include: { members: { include: { user: { select: { id: true, name: true, role: true } } } } },
  });

  const queue = patients
    .filter(p => p.status === 'WAITING_ATTENTION')
    .sort((a, b) => {
      const colorOrder: Record<string, number> = { RED: 0, YELLOW: 1, BLUE: 2 };
      const ca = colorOrder[a.triageColor || 'BLUE'];
      const cb = colorOrder[b.triageColor || 'BLUE'];
      return ca !== cb ? ca - cb : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  return {
    event: activeEvent,
    activeCounts: {
      blue: patients.filter(p => p.triageColor === 'BLUE').length,
      yellow: patients.filter(p => p.triageColor === 'YELLOW').length,
      red: patients.filter(p => p.triageColor === 'RED').length,
    },
    queue,
    activeAttentions: patients.filter(p => p.status === 'IN_ATTENTION'),
    activeEmergencies,
    activeShift,
    waitingTriage: patients.filter(p => p.status === 'WAITING_TRIAGE').length,
  };
}
