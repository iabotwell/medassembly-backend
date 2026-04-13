import prisma from '../../config/database';

export async function listPatients(filters: { eventId?: string; status?: string; triageColor?: string }) {
  const where: any = {};
  if (filters.eventId) where.eventId = filters.eventId;
  if (filters.status) where.status = filters.status;
  if (filters.triageColor) where.triageColor = filters.triageColor;
  return prisma.patient.findMany({
    where,
    include: { congregation: true, triage: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createPatient(eventId: string, data: any) {
  return prisma.patient.create({
    data: { ...data, eventId, status: 'WAITING_TRIAGE' },
    include: { congregation: true },
  });
}

export async function getPatientDetail(id: string) {
  return prisma.patient.findUnique({
    where: { id },
    include: {
      congregation: true,
      triage: { include: { answers: { include: { question: true } } } },
      attentions: {
        include: {
          attendedBy: { select: { id: true, name: true, role: true } },
          measurements: {
            include: { measuredBy: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
          },
          suppliesUsed: { include: { supply: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      emergencies: {
        include: { authorizedBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function updatePatientStatus(id: string, status: string, triageColor?: string) {
  const data: any = { status };
  if (triageColor) data.triageColor = triageColor;
  return prisma.patient.update({ where: { id }, data });
}

export async function getQueue(eventId: string) {
  return prisma.patient.findMany({
    where: { eventId, status: 'WAITING_ATTENTION' },
    include: { congregation: true, triage: true },
    orderBy: [
      { triageColor: 'desc' },
      { createdAt: 'asc' },
    ],
  });
}
