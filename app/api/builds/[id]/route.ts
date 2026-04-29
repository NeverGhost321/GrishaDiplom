import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parsePositiveId } from '@/src/lib/builds';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const buildId = parsePositiveId(params.id);

  if (!buildId) {
    return NextResponse.json({ error: 'Некорректный идентификатор сборки.' }, { status: 400 });
  }

  try {
    const existing = await prisma.build.findUnique({ where: { id: buildId } });

    if (!existing) {
      return NextResponse.json({ error: 'Сборка не найдена.' }, { status: 404 });
    }

    await prisma.build.delete({ where: { id: buildId } });

    return NextResponse.json({ message: 'Сборка успешно удалена.' });
  } catch {
    return NextResponse.json({ error: 'Не удалось удалить сборку.' }, { status: 500 });
  }
}
