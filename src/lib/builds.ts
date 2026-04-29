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

  if (details.length > 0) {
    return { details };
  }

  const components: SelectedBuildComponents = {
    cpu: cpu as unknown as Cpu,
    motherboard: motherboard as unknown as Motherboard,
    ram: ram as unknown as Ram,
    gpu: gpu as unknown as Gpu,
    psu: psu as unknown as Psu,
    storage: storage as unknown as Storage,
    pcCase: pcCase as unknown as PcCase,
    cooler: cooler as unknown as Cooler,
  };

  return { components };
}
