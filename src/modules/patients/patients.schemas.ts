import { z } from 'zod';

export const createPatientSchema = z.object({
  fullName: z.string().min(1),
  documentId: z.string().optional(),
  phone: z.string().optional(),
  age: z.number().int().min(0).max(150).optional(),
  sex: z.enum(['M', 'F']).optional(),
  congregationId: z.string().uuid().optional().or(z.literal('')),
  companionName: z.string().optional(),
  companionPhone: z.string().optional(),
  elderName: z.string().optional(),
  elderPhone: z.string().optional(),
  reasonForVisit: z.string().optional(),
  knownAllergies: z.string().optional(),
  currentMedications: z.string().optional(),
  chronicConditions: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['WAITING_TRIAGE', 'WAITING_ATTENTION', 'IN_ATTENTION', 'IN_OBSERVATION', 'IN_EMERGENCY', 'DISCHARGED', 'REFERRED']),
});
