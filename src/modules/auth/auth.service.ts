import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import admin from '../../config/firebase';
import { env } from '../../config/env';

function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any });
  return { accessToken, refreshToken };
}

export async function loginWithEmail(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) throw new Error('Invalid credentials');
  if (!user.isActive) throw new Error('User is disabled');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const tokens = generateTokens(user.id);
  return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, ...tokens };
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

  const tokens = generateTokens(user.id);
  return tokens;
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, phone: true, role: true, isActive: true, createdAt: true },
  });
  if (!user) throw new Error('User not found');
  return user;
}
