import { z } from 'zod';

export const createPatientSchema = z.object({
  fullName: z.string().min(1),
  documentId: z.string().optional(),
  phone: z.string().optional(),
  age: z.number().int().min(0).max(150),
  sex: z.enum(['M', 'F']),
  congregationId: z.string().uuid(),
  companionName: z.string().min(1),
  companionPhone: z.string().min(1),
  elderName: z.string().optional(),
  elderPhone: z.string().optional(),
  reasonForVisit: z.string().min(1),
  knownAllergies: z.string().optional(),
  currentMedications: z.string().optional(),
  chronicConditions: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['WAITING_TRIAGE', 'WAITING_ATTENTION', 'IN_ATTENTION', 'IN_OBSERVATION', 'IN_EMERGENCY', 'DISCHARGED', 'REFERRED']),
});
