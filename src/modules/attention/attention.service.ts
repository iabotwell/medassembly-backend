import prisma from '../../config/database';

export async function startAttention(patientId: string, attendedById: string) {
  const attention = await prisma.attention.create({
    data: { patientId, attendedById },
    include: { attendedBy: { select: { id: true, name: true, role: true } } },
  });

  await prisma.patient.update({ where: { id: patientId }, data: { status: 'IN_ATTENTION' } });
  return attention;
}

export async function updateAttention(id: string, data: { presumptiveDiagnosis?: string; treatment?: string; medicationsGiven?: string }) {
  return prisma.attention.update({
    where: { id },
    data,
    include: { attendedBy: { select: { id: true, name: true, role: true } } },
  });
}

export async function addDoctorNotes(id: string, notes: string) {
  return prisma.attention.update({
    where: { id },
    data: { doctorNotes: notes },
  });
}

export async function dischargePatient(attentionId: string, data: { dischargeNotes: string; dischargedBy: string }) {
  const attention = await prisma.attention.update({
    where: { id: attentionId },
    data: { dischargeNotes: data.dischargeNotes, dischargedBy: data.dischargedBy, dischargedAt: new Date() },
  });

  await prisma.patient.update({ where: { id: attention.patientId }, data: { status: 'DISCHARGED' } });
  return attention;
}

export async function addSupplyUsage(attentionId: string, data: { supplyId: string; quantity: number; notes?: string }) {
  return prisma.attentionSupply.create({ data: { attentionId, ...data } });
}

export async function deleteAttention(id: string) {
  const attention = await prisma.attention.findUnique({
    where: { id },
    select: { id: true, patientId: true },
  });
  if (!attention) throw new Error('Atencion no encontrada');

  await prisma.measurement.deleteMany({ where: { attentionId: id } });
  await prisma.attentionSupply.deleteMany({ where: { attentionId: id } });
  await prisma.attention.delete({ where: { id } });

  const remaining = await prisma.attention.count({ where: { patientId: attention.patientId, dischargedAt: null } });
  if (remaining === 0) {
    await prisma.patient.update({
      where: { id: attention.patientId },
      data: { status: 'WAITING_ATTENTION' },
    });
  }
  return { message: 'Atencion eliminada' };
}

export async function deleteMeasurement(id: string) {
  await prisma.measurement.delete({ where: { id } });
  return { message: 'Medicion eliminada' };
}
