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
    data: { ...data, eventId, status: 'WAITING_ATTENTION' },
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

export async function updatePatient(id: string, data: any) {
  return prisma.patient.update({
    where: { id },
    data,
    include: { congregation: true },
  });
}

export async function deletePatient(id: string, force = false) {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      _count: { select: { attentions: true, emergencies: true } },
      triage: { select: { id: true } },
      attentions: { select: { id: true } },
    },
  });
  if (!patient) throw new Error('Paciente no encontrado');
  if (force) {
    for (const att of patient.attentions) {
      await prisma.measurement.deleteMany({ where: { attentionId: att.id } });
      await prisma.attentionSupply.deleteMany({ where: { attentionId: att.id } });
    }
    await prisma.attention.deleteMany({ where: { patientId: id } });
    await prisma.emergency.deleteMany({ where: { patientId: id } });
    if (patient.triage) {
      await prisma.triageAnswer.deleteMany({ where: { triageId: patient.triage.id } });
      await prisma.triage.delete({ where: { id: patient.triage.id } });
    }
    await prisma.patient.delete({ where: { id } });
    return { message: 'Paciente eliminado (incluyendo atenciones y mediciones)' };
  }

  // If has attentions or emergencies, block. Otherwise cascade delete triage/answers.
  if (patient._count.attentions > 0) {
    throw new Error('No se puede eliminar: el paciente tiene atenciones registradas. Si necesita quitarlo, eliminelas primero.');
  }
  if (patient._count.emergencies > 0) {
    throw new Error('No se puede eliminar: el paciente tiene emergencias registradas.');
  }

  if (patient.triage) {
    await prisma.triageAnswer.deleteMany({ where: { triageId: patient.triage.id } });
    await prisma.triage.delete({ where: { id: patient.triage.id } });
  }
  await prisma.patient.delete({ where: { id } });
  return { message: 'Paciente eliminado' };
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
