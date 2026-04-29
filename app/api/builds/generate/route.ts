import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateBuild } from '@/src/services/build-generator.service';
import type { BuildGenerationParams } from '@/src/types/build';

type BuildGenerationRequestBody = BuildGenerationParams;

const MIN_BUDGET = 30000;
const ALLOWED_RESOLUTIONS: BuildGenerationParams['targetResolution'][] = ['fullhd', 'qhd', 'uhd'];
const ALLOWED_PRIORITIES: BuildGenerationParams['priority'][] = [
  'performance',
  'balanced',
  'budget',
  'reliability',
  'upgrade',
];

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function validateBody(body: unknown): { isValid: boolean; details: string[] } {
  const details: string[] = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { isValid: false, details: ['Тело запроса должно быть JSON-объектом.'] };
  }

  const payload = body as Partial<BuildGenerationRequestBody>;

  if (typeof payload.budget === 'undefined') {
    details.push('Отсутствует обязательное поле budget.');
  } else if (typeof payload.budget !== 'number' || !Number.isFinite(payload.budget)) {
    details.push('Поле budget должно быть числом.');
  } else {
    if (payload.budget <= 0) {
      details.push('Поле budget должно быть больше 0.');
    }
    if (payload.budget < MIN_BUDGET) {
      details.push(`Минимальный бюджет для автоподбора — ${MIN_BUDGET} ₽.`);
    }
  }

  if (typeof payload.targetResolution === 'undefined') {
    details.push('Отсутствует обязательное поле targetResolution.');
  } else if (!ALLOWED_RESOLUTIONS.includes(payload.targetResolution)) {
    details.push('Поле targetResolution должно быть одним из: fullhd, qhd, uhd.');
  }

  if (typeof payload.priority === 'undefined') {
    details.push('Отсутствует обязательное поле priority.');
  } else if (!ALLOWED_PRIORITIES.includes(payload.priority)) {
    details.push('Поле priority должно быть одним из: performance, balanced, budget, reliability, upgrade.');
  }

  if (typeof payload.preferredBrands !== 'undefined' && !isStringArray(payload.preferredBrands)) {
    details.push('Поле preferredBrands должно быть массивом строк.');
  }

  if (typeof payload.excludedBrands !== 'undefined' && !isStringArray(payload.excludedBrands)) {
    details.push('Поле excludedBrands должно быть массивом строк.');
  }

  return { isValid: details.length === 0, details };
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const validation = validateBody(body);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Некорректные параметры автоподбора.',
          details: validation.details,
        },
        { status: 400 },
      );
    }

    const params = body as BuildGenerationRequestBody;

    const [cpus, motherboards, rams, gpus, psus, storages, cases, coolers] = await Promise.all([
      prisma.cpu.findMany(),
      prisma.motherboard.findMany(),
      prisma.ram.findMany(),
      prisma.gpu.findMany(),
      prisma.psu.findMany(),
      prisma.storage.findMany(),
      prisma.pcCase.findMany(),
      prisma.cooler.findMany(),
    ]);

    const result = generateBuild(params, {
      cpus,
      motherboards,
      rams,
      gpus,
      psus,
      storages,
      cases,
      coolers,
    });

    if (!result) {
      return NextResponse.json(
        {
          error: 'Не удалось подобрать совместимую сборку под заданные параметры.',
          recommendations: [
            'Увеличьте бюджет.',
            'Измените приоритет сборки.',
            'Уберите часть ограничений по брендам.',
          ],
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({ error: 'Не удалось выполнить автоматический подбор сборки.' }, { status: 500 });
  }
}
