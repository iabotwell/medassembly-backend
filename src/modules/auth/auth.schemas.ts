import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const requestOtpSchema = z.object({
  email: z.string().email(),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export const firebaseAuthSchema = z.object({
  idToken: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
