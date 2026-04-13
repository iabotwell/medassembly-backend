import axios from 'axios';
import prisma from '../../config/database';
import { env } from '../../config/env';

const evoApi = axios.create({
  baseURL: env.EVOLUTION_API_URL,
  headers: { 'apikey': env.EVOLUTION_API_KEY },
});

export async function sendWhatsApp(phone: string, message: string) {
  const instance = env.EVOLUTION_INSTANCE_NAME;
  await evoApi.post(`/message/sendText/${instance}`, {
    number: phone,
    text: message,
  });
}

export async function sendTemplateMessage(
  templateKey: string,
  phone: string,
  variables: Record<string, string>
) {
  const template = await prisma.whatsAppTemplate.findUnique({ where: { eventType: templateKey } });
  if (!template || !template.isActive) return;

  let message = template.template;
  Object.entries(variables).forEach(([key, value]) => {
    message = message.replace(`{${key}}`, value);
  });

  await sendWhatsApp(phone, message);
}

export async function getActiveContactsByType(type: string) {
  return prisma.emergencyContact.findMany({ where: { type: type as any, isActive: true } });
}

export async function getConnectionStatus() {
  try {
    const instance = env.EVOLUTION_INSTANCE_NAME;
    const response = await evoApi.get(`/instance/connectionState/${instance}`);
    return response.data;
  } catch {
    return { state: 'disconnected' };
  }
}

export async function listTemplates() {
  return prisma.whatsAppTemplate.findMany({ orderBy: { eventType: 'asc' } });
}

export async function updateTemplate(id: string, data: { template?: string; isActive?: boolean }) {
  return prisma.whatsAppTemplate.update({ where: { id }, data });
}
