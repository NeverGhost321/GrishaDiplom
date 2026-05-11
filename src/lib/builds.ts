import type {
  Cooler as PrismaCooler,
  Cpu as PrismaCpu,
  Gpu as PrismaGpu,
  Motherboard as PrismaMotherboard,
  PcCase as PrismaPcCase,
  Psu as PrismaPsu,
  Ram as PrismaRam,
  Storage as PrismaStorage,
} from '@prisma/client';
import type { Cooler, Cpu, Gpu, Motherboard, PcCase, Psu, Ram, Storage } from '@/src/types/components';
import type { SelectedBuildComponents } from '@/src/types/build';
import { prisma } from '@/lib/prisma';

export type BuildComponentIds = {
  cpuId: number;
  motherboardId: number;
  ramId: number;
  gpuId: number;
  psuId: number;
  storageId: number;
  caseId: number;
  coolerId: number;
};

export function parsePositiveId(value: string): number | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function mapCpu(cpu: PrismaCpu): Cpu {
  return {
    id: cpu.id,
    name: cpu.model,
    brand: cpu.brand,
    socket: cpu.socket,
    cores: cpu.cores,
    threads: cpu.threads,
    baseClockGhz: cpu.baseClockGhz,
    boostClockGhz: cpu.boostClockGhz,
    tdp: cpu.tdpWatts,
    integratedGraphics: cpu.integratedGraphics,
    generation: cpu.generation,
    price: cpu.price,
  };
}

export function mapMotherboard(motherboard: PrismaMotherboard): Motherboard {
  return { ...motherboard, name: motherboard.model };
}

export function mapRam(ram: PrismaRam): Ram {
  return { ...ram, name: ram.model };
}

export function mapGpu(gpu: PrismaGpu): Gpu {
  return {
    id: gpu.id,
    name: gpu.model,
    brand: gpu.brand,
    chipset: gpu.chipset,
    vramGb: gpu.vramGb,
    lengthMm: gpu.lengthMm,
    powerConsumption: gpu.powerDrawWatts,
    recommendedPsuWattage: gpu.recommendedPsuWatts,
    pcieInterface: gpu.pcieInterface,
    price: gpu.price,
  };
}

export function mapPsu(psu: PrismaPsu): Psu {
  return { ...psu, name: psu.model };
}

export function mapStorage(storage: PrismaStorage): Storage {
  return { ...storage, name: storage.model };
}

export function mapPcCase(pcCase: PrismaPcCase): PcCase {
  return { ...pcCase, name: pcCase.model };
}

export function mapCooler(cooler: PrismaCooler): Cooler {
  return { ...cooler, name: cooler.model };
}

export type PrismaComponentRecords = {
  cpu: PrismaCpu;
  motherboard: PrismaMotherboard;
  ram: PrismaRam;
  gpu: PrismaGpu;
  psu: PrismaPsu;
  storage: PrismaStorage;
  pcCase: PrismaPcCase;
  cooler: PrismaCooler;
};

export function mapComponentsByRecords(records: PrismaComponentRecords): SelectedBuildComponents {
  return {
    cpu: mapCpu(records.cpu),
    motherboard: mapMotherboard(records.motherboard),
    ram: mapRam(records.ram),
    gpu: mapGpu(records.gpu),
    psu: mapPsu(records.psu),
    storage: mapStorage(records.storage),
    pcCase: mapPcCase(records.pcCase),
    cooler: mapCooler(records.cooler),
  };
}

export async function loadComponentsByIds(ids: BuildComponentIds) {
  const [cpu, motherboard, ram, gpu, psu, storage, pcCase, cooler] = await Promise.all([
    prisma.cpu.findUnique({ where: { id: ids.cpuId } }),
    prisma.motherboard.findUnique({ where: { id: ids.motherboardId } }),
    prisma.ram.findUnique({ where: { id: ids.ramId } }),
    prisma.gpu.findUnique({ where: { id: ids.gpuId } }),
    prisma.psu.findUnique({ where: { id: ids.psuId } }),
    prisma.storage.findUnique({ where: { id: ids.storageId } }),
    prisma.pcCase.findUnique({ where: { id: ids.caseId } }),
    prisma.cooler.findUnique({ where: { id: ids.coolerId } }),
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

  if (details.length > 0 || !cpu || !motherboard || !ram || !gpu || !psu || !storage || !pcCase || !cooler) {
    return { details };
  }

  return {
    components: mapComponentsByRecords({
      cpu,
      motherboard,
      ram,
      gpu,
      psu,
      storage,
      pcCase,
      cooler,
    }),
  };
}
