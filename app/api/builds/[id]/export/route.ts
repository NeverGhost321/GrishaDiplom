import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkCompatibility } from '@/src/services/compatibility.service';
import { parsePositiveId } from '@/src/lib/builds';
import type { Cooler, Cpu, Gpu, Motherboard, PcCase, Psu, Ram, Storage } from '@/src/types/components';

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
      cpu: {
        id: item.cpu.id,
        name: item.cpu.model,
        brand: item.cpu.brand,
        socket: item.cpu.socket,
        cores: item.cpu.cores,
        threads: item.cpu.threads,
        baseClockGhz: item.cpu.baseClockGhz,
        boostClockGhz: item.cpu.boostClockGhz,
        tdp: item.cpu.tdpWatts,
        integratedGraphics: item.cpu.integratedGraphics,
        generation: item.cpu.generation,
        price: item.cpu.price,
      } as Cpu,
      motherboard: { ...item.motherboard, name: item.motherboard.model } as Motherboard,
      ram: { ...item.ram, name: item.ram.model } as Ram,
      gpu: {
        id: item.gpu.id,
        name: item.gpu.model,
        brand: item.gpu.brand,
        chipset: item.gpu.chipset,
        vramGb: item.gpu.vramGb,
        lengthMm: item.gpu.lengthMm,
        powerConsumption: item.gpu.powerDrawWatts,
        recommendedPsuWattage: item.gpu.recommendedPsuWatts,
        pcieInterface: item.gpu.pcieInterface,
        price: item.gpu.price,
      } as Gpu,
      psu: { ...item.psu, name: item.psu.model } as Psu,
      storage: { ...item.storage, name: item.storage.model } as Storage,
      pcCase: { ...item.pcCase, name: item.pcCase.model } as PcCase,
      cooler: { ...item.cooler, name: item.cooler.model } as Cooler,
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
