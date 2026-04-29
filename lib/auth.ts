import { cookies } from 'next/headers';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/prisma';

const SESSION_COOKIE = 'pc_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, original] = storedHash.split(':');
  if (!salt || !original) return false;
  const hash = scryptSync(password, salt, 64).toString('hex');
  return timingSafeEqual(Buffer.from(original, 'hex'), Buffer.from(hash, 'hex'));
}

export async function createSession(userId: number) {
  const token = randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  cookies().set(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: SESSION_MAX_AGE_SECONDS });
}

export async function clearSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  cookies().delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    cookies().delete(SESSION_COOKIE);
    if (session) await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  return session.user;
}
