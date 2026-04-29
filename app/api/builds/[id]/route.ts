import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { checkCompatibility } from '@/src/services/compatibility.service';
import { parsePositiveId } from '@/src/lib/builds';
import type { Cooler, Cpu, Gpu, Motherboard, PcCase, Psu, Ram, Storage } from '@/src/types/components';

type BuildWithRelations = Prisma.BuildGetPayload<{
  include: { cpu: true; motherboard: true; ram: true; gpu: true; psu: true; storage: true; pcCase: true; cooler: true };
}>;

function mapBuildComponents(item: BuildWithRelations) {
  return {
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
  };
}

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

    const components = mapBuildComponents(item);
    const compatibilityResult = checkCompatibility(components);

    return NextResponse.json({
      item: {
        ...item,
        cpu: components.cpu,
        motherboard: components.motherboard,
        ram: components.ram,
        gpu: components.gpu,
        psu: components.psu,
        storage: components.storage,
        pcCase: components.pcCase,
        cooler: components.cooler,
      },
      compatibilityResult,
    });
  } catch {
    return NextResponse.json({ error: 'Не удалось получить сборку.' }, { status: 500 });
  }
}

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
