import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional(),
  name: z.string().min(1),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'ENCARGADO', 'DOCTOR', 'ASISTENTE', 'CAMILLERO', 'CONSULTA']),
});

export const updateUserSchema = createUserSchema.partial();
