import prisma from '../../config/database';
import { sendTemplateMessage, getActiveContactsByType } from '../whatsapp/whatsapp.service';

export async function activateEmergency(patientId: string, data: { level: string; authorizedById: string; notes?: string }) {
  const emergency = await prisma.emergency.create({
    data: { patientId, level: data.level as any, authorizedById: data.authorizedById, notes: data.notes },
    include: { patient: { include: { congregation: true } }, authorizedBy: { select: { id: true, name: true } } },
  });

  await prisma.patient.update({ where: { id: patientId }, data: { status: 'IN_EMERGENCY' } });

  try {
    const event = await prisma.event.findFirst({ where: { isActive: true } });
    const variables = {
      paciente: emergency.patient.fullName,
      prioridad: emergency.patient.triageColor || 'N/A',
      ubicacion: event?.location || 'N/A',
      hora: new Date().toLocaleTimeString('es-CL'),
      motivo: data.notes || 'Emergencia',
    };

    if (data.level === 'SOS_DOCTOR') {
      const doctors = await getActiveContactsByType('DOCTOR_GUARDIA');
      for (const doc of doctors) {
        await sendTemplateMessage('SOS_DOCTOR', doc.phone, variables);
      }
    } else if (data.level === 'AMBULANCE') {
      const contacts = await getActiveContactsByType('AMBULANCIA');
      for (const c of contacts) {
        await sendTemplateMessage('AMBULANCE_REQUEST', c.phone, variables);
      }
    }
  } catch (e) {
    console.error('WhatsApp notification error:', e);
  }

  return emergency;
}

export async function resolveEmergency(id: string, data: { resolvedNotes?: string }) {
  const emergency = await prisma.emergency.update({
    where: { id },
    data: { resolved: true, resolvedAt: new Date(), resolvedNotes: data.resolvedNotes },
    include: { patient: true },
  });

  const activeEmergencies = await prisma.emergency.count({
    where: { patientId: emergency.patientId, resolved: false },
  });

  if (activeEmergencies === 0) {
    await prisma.patient.update({ where: { id: emergency.patientId }, data: { status: 'IN_ATTENTION' } });
  }

  return emergency;
}

export async function listActiveEmergencies() {
  const activeEvent = await prisma.event.findFirst({ where: { isActive: true } });
  if (!activeEvent) return [];

  return prisma.emergency.findMany({
    where: { resolved: false, patient: { eventId: activeEvent.id } },
    include: {
      patient: { select: { id: true, fullName: true, triageColor: true, status: true } },
      authorizedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}
