import prisma from '../../config/database';

export async function listMeasurements(attentionId: string) {
  return prisma.measurement.findMany({
    where: { attentionId },
    include: { measuredBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function addMeasurement(attentionId: string, measuredById: string, data: {
  systolicBP?: number; diastolicBP?: number; heartRate?: number; respiratoryRate?: number;
  temperature?: number; oxygenSaturation?: number; bloodGlucose?: number; glasgowScore?: number;
  observation?: string;
}) {
  return prisma.measurement.create({
    data: { attentionId, measuredById, ...data },
    include: { measuredBy: { select: { id: true, name: true } } },
  });
}
