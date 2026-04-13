import prisma from '../../config/database';

export async function listQuestions(includeInactive = false) {
  const where = includeInactive ? {} : { isActive: true };
  return prisma.triageQuestion.findMany({ where, orderBy: { order: 'asc' } });
}

export async function createQuestion(data: { question: string; type: string; options?: any; order: number }) {
  return prisma.triageQuestion.create({ data });
}

export async function updateQuestion(id: string, data: any) {
  return prisma.triageQuestion.update({ where: { id }, data });
}

export async function toggleQuestion(id: string) {
  const q = await prisma.triageQuestion.findUnique({ where: { id } });
  if (!q) throw new Error('Question not found');
  return prisma.triageQuestion.update({ where: { id }, data: { isActive: !q.isActive } });
}

export async function deleteQuestion(id: string) {
  const answersCount = await prisma.triageAnswer.count({ where: { questionId: id } });
  if (answersCount > 0) {
    throw new Error('No se puede eliminar: la pregunta tiene respuestas asociadas. Desactivela en su lugar.');
  }
  return prisma.triageQuestion.delete({ where: { id } });
}

export async function listAllQuestions() {
  return prisma.triageQuestion.findMany({ orderBy: { order: 'asc' } });
}

export async function performTriage(patientId: string, data: { color: string; notes?: string; performedBy: string; answers: { questionId: string; answer: string }[] }) {
  const triage = await prisma.triage.create({
    data: {
      patientId,
      color: data.color as any,
      notes: data.notes,
      performedBy: data.performedBy,
      answers: {
        create: data.answers.map(a => ({ questionId: a.questionId, answer: a.answer })),
      },
    },
    include: { answers: { include: { question: true } } },
  });

  await prisma.patient.update({
    where: { id: patientId },
    data: { status: 'WAITING_ATTENTION', triageColor: data.color as any },
  });

  return triage;
}

export async function updateTriage(patientId: string, data: { color?: string; notes?: string; answers?: { questionId: string; answer: string }[] }) {
  const updateData: any = {};
  if (data.color) updateData.color = data.color;
  if (data.notes !== undefined) updateData.notes = data.notes;

  const triage = await prisma.triage.update({
    where: { patientId },
    data: updateData,
  });

  if (data.color) {
    await prisma.patient.update({
      where: { id: patientId },
      data: { triageColor: data.color as any },
    });
  }

  if (data.answers) {
    await prisma.triageAnswer.deleteMany({ where: { triageId: triage.id } });
    for (const a of data.answers) {
      await prisma.triageAnswer.create({ data: { triageId: triage.id, questionId: a.questionId, answer: a.answer } });
    }
  }

  return prisma.triage.findUnique({ where: { id: triage.id }, include: { answers: { include: { question: true } } } });
}
