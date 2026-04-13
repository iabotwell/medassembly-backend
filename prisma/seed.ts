import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Super Admin user (login via OTP)
  await prisma.user.upsert({
    where: { email: 'iabotwell@gmail.com' },
    update: { role: 'ADMIN', isActive: true },
    create: {
      email: 'iabotwell@gmail.com',
      passwordHash: await bcrypt.hash('unused-otp-only', 10),
      name: 'Francisco Villa',
      role: 'ADMIN',
    },
  });

  // 2. Triage questions
  const existingQuestions = await prisma.triageQuestion.count();
  if (existingQuestions === 0) {
    const triageQuestions = [
      { question: '¿Cuál es el síntoma principal?', type: 'text', order: 1 },
      { question: '¿Desde cuándo presenta el síntoma?', type: 'select', options: ['Minutos', 'Horas', 'Días'], order: 2 },
      { question: '¿Ha tenido este problema antes?', type: 'boolean', order: 3 },
      { question: '¿Nivel de dolor? (1-10)', type: 'scale', order: 4 },
      { question: '¿Puede caminar por sí mismo?', type: 'boolean', order: 5 },
      { question: '¿Está consciente y orientado?', type: 'boolean', order: 6 },
      { question: '¿Presenta dificultad respiratoria?', type: 'boolean', order: 7 },
      { question: '¿Presenta sangrado activo?', type: 'select', options: ['No', 'Sí', 'Controlado'], order: 8 },
      { question: '¿Tiene fiebre?', type: 'boolean', order: 9 },
      { question: 'Observaciones adicionales', type: 'text', order: 10 },
    ];
    for (const q of triageQuestions) {
      await prisma.triageQuestion.create({ data: q });
    }
  }

  // 3. WhatsApp templates
  const templates = [
    { eventType: 'SOS_DOCTOR', template: 'SOS DOCTOR: Paciente {paciente} clasificado {prioridad} requiere atencion medica urgente. Ubicacion: {ubicacion}. Hora: {hora}' },
    { eventType: 'RED_TRIAGE', template: 'ALERTA ROJA: {paciente} clasificado como GRAVE. Atendido por: {atendido_por}. Ubicacion: {ubicacion}' },
    { eventType: 'CAMILLERO_REQUEST', template: 'Se requiere camillero: Paciente {paciente} necesita traslado. Ubicacion: {ubicacion}. Prioridad: {prioridad}' },
    { eventType: 'AMBULANCE_REQUEST', template: 'AMBULANCIA SOLICITADA para {paciente}. Ubicacion: {ubicacion}. Motivo: {motivo}. Hora: {hora}' },
    { eventType: 'PATIENT_DISCHARGE', template: 'Alta medica: {paciente} de congregacion {congregacion} ha sido dado de alta. Indicaciones: {indicaciones}' },
    { eventType: 'SHIFT_START', template: 'Tu turno comienza ahora ({hora_inicio} - {hora_fin}). Evento: {evento}. Rol: {rol}' },
  ];
  for (const t of templates) {
    await prisma.whatsAppTemplate.upsert({
      where: { eventType: t.eventType },
      update: {},
      create: t,
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
