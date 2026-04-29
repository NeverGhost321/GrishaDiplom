import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });

  const buildsCount = await prisma.build.count({ where: { userId: user.id } });
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, bio: user.bio, avatarUrl: user.avatarUrl, role: user.role, buildsCount } });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Требуется авторизация.' }, { status: 401 });
  const body = await request.json() as { name?: string; bio?: string; avatarUrl?: string };
  const updated = await prisma.user.update({ where: { id: user.id }, data: { name: body.name?.trim(), bio: body.bio?.trim() || null, avatarUrl: body.avatarUrl?.trim() || null } });
  return NextResponse.json({ user: { id: updated.id, email: updated.email, name: updated.name, bio: updated.bio, avatarUrl: updated.avatarUrl, role: updated.role } });
}
