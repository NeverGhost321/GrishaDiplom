import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, verifyPassword } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json() as { email?: string; password?: string };
  if (!body.email || !body.password) return NextResponse.json({ error: 'Введите email и пароль.' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (!user || !verifyPassword(body.password, user.passwordHash)) return NextResponse.json({ error: 'Неверный email или пароль.' }, { status: 401 });
  await createSession(user.id);
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, bio: user.bio, avatarUrl: user.avatarUrl } });
}
