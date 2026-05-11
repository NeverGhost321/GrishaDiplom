import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkCompatibility } from '@/src/services/compatibility.service';
import {
  loadComponentsByIds,
  mapComponentsByRecords,
  type BuildComponentIds,
  type PrismaComponentRecords,
} from '@/src/lib/builds';
import { getCurrentUser } from '@/lib/auth';

type CreateBuildRequestBody = BuildComponentIds & {
  name: string;
  budget: number;
};

function mapBuildItemForResponse<T extends PrismaComponentRecords>(item: T) {
  const components = mapComponentsByRecords(item);

  return {
    ...item,
    ...components,
  };
}

const REQUIRED_FIELDS: Array<keyof BuildComponentIds> = [
  'cpuId',
  'motherboardId',
  'ramId',
  'gpuId',
  'psuId',
  'storageId',
  'caseId',
  'coolerId',
];

function validateBody(body: unknown): { isValid: boolean; details: string[] } {
  const details: string[] = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { isValid: false, details: ['Тело запроса должно быть JSON-объектом.'] };
  }

  const payload = body as Partial<CreateBuildRequestBody>;

  if (typeof payload.name !== 'string') {
    details.push('Поле name обязательно и должно быть строкой.');
  } else if (payload.name.trim().length < 2 || payload.name.trim().length > 100) {
    details.push('Поле name должно содержать от 2 до 100 символов.');
  }

  if (typeof payload.budget !== 'number' || !Number.isFinite(payload.budget) || payload.budget <= 0) {
    details.push('Поле budget обязательно и должно быть положительным числом.');
  }

  for (const field of REQUIRED_FIELDS) {
    const value = payload[field];
    if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
      details.push(`Поле ${field} обязательно и должно быть положительным целым числом.`);
    }
  }

  return { isValid: details.length === 0, details };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Требуется авторизация.' }, { status: 401 });
  try {
    const items = await prisma.build.findMany({
      where: { userId: user.id },
      include: { cpu: true, motherboard: true, ram: true, gpu: true, psu: true, storage: true, pcCase: true, cooler: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ items: items.map(mapBuildItemForResponse), count: items.length });
  } catch {
    return NextResponse.json({ error: 'Не удалось получить список сохранённых сборок.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Требуется авторизация.' }, { status: 401 });
  try {
    const body: unknown = await request.json();
    const validation = validateBody(body);

    if (!validation.isValid) {
      return NextResponse.json({ error: 'Некорректные данные для сохранения сборки.', details: validation.details }, { status: 400 });
    }

    const payload = body as CreateBuildRequestBody;
    const loaded = await loadComponentsByIds(payload);

    if ('details' in loaded) {
      return NextResponse.json({ error: 'Один или несколько компонентов не найдены.', details: loaded.details }, { status: 404 });
    }

    const compatibilityResult = checkCompatibility(loaded.components);

    if (compatibilityResult.errors.length > 0) {
      return NextResponse.json(
        { error: 'Сборка содержит критические ошибки совместимости и не может быть сохранена.', compatibilityResult },
        { status: 400 },
      );
    }

    const item = await prisma.build.create({
      data: {
        name: payload.name.trim(),
        userId: user.id,
        budget: payload.budget,
        totalPrice: compatibilityResult.totalPrice,
        cpuId: payload.cpuId,
        motherboardId: payload.motherboardId,
        ramId: payload.ramId,
        gpuId: payload.gpuId,
        psuId: payload.psuId,
        storageId: payload.storageId,
        caseId: payload.caseId,
        coolerId: payload.coolerId,
      },
      include: { cpu: true, motherboard: true, ram: true, gpu: true, psu: true, storage: true, pcCase: true, cooler: true },
    });

    return NextResponse.json({ item: mapBuildItemForResponse(item), compatibilityResult }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Не удалось сохранить сборку.' }, { status: 500 });
  }
}
