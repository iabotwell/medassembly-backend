const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

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
  const existing = await prisma.triageQuestion.count();
  if (existing === 0) {
    const triageQuestions = [
      { question: '¿Cual es el sintoma principal?', type: 'text', order: 1 },
      { question: '¿Desde cuando presenta el sintoma?', type: 'select', options: ['Minutos', 'Horas', 'Dias'], order: 2 },
      { question: '¿Ha tenido este problema antes?', type: 'boolean', order: 3 },
      { question: '¿Nivel de dolor? (1-10)', type: 'scale', order: 4 },
      { question: '¿Puede caminar por si mismo?', type: 'boolean', order: 5 },
      { question: '¿Esta consciente y orientado?', type: 'boolean', order: 6 },
      { question: '¿Presenta dificultad respiratoria?', type: 'boolean', order: 7 },
      { question: '¿Presenta sangrado activo?', type: 'select', options: ['No', 'Si', 'Controlado'], order: 8 },
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
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(0); // Don't fail startup if seed errors
  })
  .finally(() => prisma.$disconnect());
