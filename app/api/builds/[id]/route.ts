import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkCompatibility } from '@/src/services/compatibility.service';
import {
  mapComponentsByRecords,
  parsePositiveId,
  type PrismaComponentRecords,
} from '@/src/lib/builds';
import { getCurrentUser } from '@/lib/auth';

function mapBuildItemForResponse<T extends PrismaComponentRecords>(item: T) {
  const components = mapComponentsByRecords(item);

  return {
    ...item,
    ...components,
  };
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Требуется авторизация.' }, { status: 401 });
  const buildId = parsePositiveId(params.id);

  if (!buildId) {
    return NextResponse.json({ error: 'Некорректный идентификатор сборки.' }, { status: 400 });
  }

  try {
    const item = await prisma.build.findUnique({
      where: { id: buildId, userId: user.id },
      include: { cpu: true, motherboard: true, ram: true, gpu: true, psu: true, storage: true, pcCase: true, cooler: true },
    });

    if (!item) {
      return NextResponse.json({ error: 'Сборка не найдена.' }, { status: 404 });
    }

    const components = mapComponentsByRecords(item);
    const compatibilityResult = checkCompatibility(components);

    return NextResponse.json({
      item: mapBuildItemForResponse(item),
      compatibilityResult,
    });
  } catch {
    return NextResponse.json({ error: 'Не удалось получить сборку.' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Требуется авторизация.' }, { status: 401 });
  const buildId = parsePositiveId(params.id);

  if (!buildId) {
    return NextResponse.json({ error: 'Некорректный идентификатор сборки.' }, { status: 400 });
  }

  try {
    const existing = await prisma.build.findFirst({ where: { id: buildId, userId: user.id } });

    if (!existing) {
      return NextResponse.json({ error: 'Сборка не найдена.' }, { status: 404 });
    }

    await prisma.build.delete({ where: { id: buildId } });

    return NextResponse.json({ message: 'Сборка успешно удалена.' });
  } catch {
    return NextResponse.json({ error: 'Не удалось удалить сборку.' }, { status: 500 });
  }
}
