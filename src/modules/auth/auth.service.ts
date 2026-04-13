import jwt from 'jsonwebtoken';
import prisma from '../../config/database';
import admin from '../../config/firebase';
import { env } from '../../config/env';
import { sendOtpEmail } from './email.service';

function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any });
  return { accessToken, refreshToken };
}

function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function requestOtp(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) throw new Error('Usuario no registrado. Contacte al administrador.');
  if (!user.isActive) throw new Error('Usuario desactivado.');

  // Invalidate previous active codes
  await prisma.otpCode.updateMany({
    where: { email: normalizedEmail, used: false },
    data: { used: true },
  });

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRATION_MINUTES * 60 * 1000);

  await prisma.otpCode.create({
    data: { email: normalizedEmail, code, expiresAt },
  });

  await sendOtpEmail(normalizedEmail, code, user.name);

  return { message: 'Codigo enviado al correo', expiresInMinutes: env.OTP_EXPIRATION_MINUTES };
}

export async function verifyOtp(email: string, code: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const otpRecord = await prisma.otpCode.findFirst({
    where: {
      email: normalizedEmail,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpRecord) throw new Error('Codigo invalido o expirado. Solicite uno nuevo.');

  if (otpRecord.attempts >= 5) {
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });
    throw new Error('Demasiados intentos fallidos. Solicite un nuevo codigo.');
  }

  if (otpRecord.code !== code.trim()) {
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { attempts: otpRecord.attempts + 1 },
    });
    throw new Error('Codigo incorrecto.');
  }

  // Mark used
  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: { used: true },
  });

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user || !user.isActive) throw new Error('Usuario no encontrado o desactivado.');

  const tokens = generateTokens(user.id);
  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    ...tokens,
  };
}

export async function loginWithFirebase(idToken: string) {
  const decoded = await admin.auth().verifyIdToken(idToken);
  let user = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });

  if (!user) {
    user = await prisma.user.findUnique({ where: { email: decoded.email! } });
    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { firebaseUid: decoded.uid },
      });
    } else {
      throw new Error('User not registered. Contact administrator.');
    }
  }

  if (!user.isActive) throw new Error('User is disabled');
  const tokens = generateTokens(user.id);
  return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, ...tokens };
}

export async function refreshAccessToken(refreshToken: string) {
  const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.isActive) throw new Error('Unauthorized');
  return generateTokens(user.id);
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, phone: true, role: true, isActive: true, createdAt: true },
  });
  if (!user) throw new Error('User not found');
  return user;
}
