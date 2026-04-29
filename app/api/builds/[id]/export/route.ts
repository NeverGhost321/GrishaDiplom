import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkCompatibility } from '@/src/services/compatibility.service';
import { parsePositiveId } from '@/src/lib/builds';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const buildId = parsePositiveId(params.id);

  if (!buildId) {
    return NextResponse.json({ error: 'Некорректный идентификатор сборки.' }, { status: 400 });
  }

  try {
    const item = await prisma.build.findUnique({
      where: { id: buildId },
      include: { cpu: true, motherboard: true, ram: true, gpu: true, psu: true, storage: true, pcCase: true, cooler: true },
    });

    if (!item) {
      return NextResponse.json({ error: 'Сборка не найдена.' }, { status: 404 });
    }

    const compatibilityResult = checkCompatibility({
      cpu: item.cpu,
      motherboard: item.motherboard,
      ram: item.ram,
      gpu: item.gpu,
      psu: item.psu,
      storage: item.storage,
      pcCase: item.pcCase,
      cooler: item.cooler,
    });

    const payload = {
      project: 'Конфигуратор игровых ПК',
      exportedAt: new Date().toISOString(),
      build: {
        name: item.name,
        budget: item.budget,
        totalPrice: item.totalPrice,
        createdAt: item.createdAt.toISOString(),
        components: {
          cpu: item.cpu,
          motherboard: item.motherboard,
          ram: item.ram,
          gpu: item.gpu,
          psu: item.psu,
          storage: item.storage,
          pcCase: item.pcCase,
          cooler: item.cooler,
        },
        compatibilityResult,
      },
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="pc-build-${buildId}.json"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Не удалось экспортировать сборку.' }, { status: 500 });
  }
}
