import { NextResponse } from 'next/server';
import type {
  Cooler,
  Cpu,
  Gpu,
  Motherboard,
  PcCase,
  Psu,
  Ram,
  Storage,
} from '@/src/types/components';
import { prisma } from '@/lib/prisma';
import { checkCompatibility } from '@/src/services/compatibility.service';
import type { SelectedBuildComponents } from '@/src/types/build';

type CompatibilityCheckRequestBody = {
  cpuId: number;
  motherboardId: number;
  ramId: number;
  gpuId: number;
  psuId: number;
  storageId: number;
  caseId: number;
  coolerId: number;
};

const REQUIRED_FIELDS: Array<keyof CompatibilityCheckRequestBody> = [
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

  const payload = body as Partial<CompatibilityCheckRequestBody>;

  for (const field of REQUIRED_FIELDS) {
    const value = payload[field];

    if (typeof value === 'undefined') {
      details.push(`Отсутствует обязательное поле ${field}.`);
      continue;
    }

    if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value) || value <= 0) {
      details.push(`Поле ${field} должно быть положительным целым числом.`);
    }
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
          error: 'Некорректные данные для проверки совместимости.',
          details: validation.details,
        },
        { status: 400 },
      );
    }

    const payload = body as CompatibilityCheckRequestBody;

    const [cpu, motherboard, ram, gpu, psu, storage, pcCase, cooler] = await Promise.all([
      prisma.cpu.findUnique({ where: { id: payload.cpuId } }),
      prisma.motherboard.findUnique({ where: { id: payload.motherboardId } }),
      prisma.ram.findUnique({ where: { id: payload.ramId } }),
      prisma.gpu.findUnique({ where: { id: payload.gpuId } }),
      prisma.psu.findUnique({ where: { id: payload.psuId } }),
      prisma.storage.findUnique({ where: { id: payload.storageId } }),
      prisma.pcCase.findUnique({ where: { id: payload.caseId } }),
      prisma.cooler.findUnique({ where: { id: payload.coolerId } }),
    ]);

    const details: string[] = [];
    if (!cpu) details.push('Процессор с указанным id не найден.');
    if (!motherboard) details.push('Материнская плата с указанным id не найдена.');
    if (!ram) details.push('Оперативная память с указанным id не найдена.');
    if (!gpu) details.push('Видеокарта с указанным id не найдена.');
    if (!psu) details.push('Блок питания с указанным id не найден.');
    if (!storage) details.push('Накопитель с указанным id не найден.');
    if (!pcCase) details.push('Корпус с указанным id не найден.');
    if (!cooler) details.push('Кулер с указанным id не найден.');

    if (details.length > 0) {
      return NextResponse.json(
        {
          error: 'Один или несколько компонентов не найдены.',
          details,
        },
        { status: 404 },
      );
    }

    const components: SelectedBuildComponents = {
      cpu: cpu as Cpu,
      motherboard: motherboard as Motherboard,
      ram: ram as Ram,
      gpu: gpu as Gpu,
      psu: psu as Psu,
      storage: storage as Storage,
      pcCase: pcCase as PcCase,
      cooler: cooler as Cooler,
    };

    const result = checkCompatibility(components);

    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({ error: 'Не удалось выполнить проверку совместимости.' }, { status: 500 });
  }
}
