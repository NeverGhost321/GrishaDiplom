import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json() as { email?: string; password?: string; name?: string };
  if (!body.email || !body.password || !body.name) return NextResponse.json({ error: 'Заполните все поля.' }, { status: 400 });
  if (body.password.length < 6) return NextResponse.json({ error: 'Пароль должен быть не короче 6 символов.' }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (exists) return NextResponse.json({ error: 'Пользователь с таким email уже существует.' }, { status: 409 });

  const user = await prisma.user.create({
    data: { email: body.email.toLowerCase(), name: body.name.trim(), passwordHash: hashPassword(body.password) },
  });
  await createSession(user.id);
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, bio: user.bio, avatarUrl: user.avatarUrl, role: user.role } }, { status: 201 });
}
