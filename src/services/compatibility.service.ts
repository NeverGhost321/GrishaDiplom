import {
  calculateCompatibilityScore,
  calculateCpuGpuBalance,
  calculateRequiredPsuWattage,
  calculateTotalPowerConsumption,
  calculateTotalPrice,
} from '../lib/scoring';
import type { SelectedBuildComponents } from '../types/build';
import type { CompatibilityResult } from '../types/compatibility';

export function splitCsv(value: string): string[] {
  return value.split(',').map((part) => part.trim()).filter(Boolean);
}

export function includesNormalized(list: string, item: string): boolean {
  const normalizedItem = item.trim().toLowerCase();
  return splitCsv(list).some((entry) => entry.toLowerCase() === normalizedItem);
}

export function parsePcieVersion(value: string | null | undefined): number {
  if (!value) return 0;
  const match = value.toLowerCase().match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

export function isPcieNewer(
  first: string | null | undefined,
  second: string | null | undefined,
): boolean {
  return parsePcieVersion(first) > parsePcieVersion(second);
}

export function containsIgnoreCase(value: string, keywords: string[]): boolean {
  const normalized = value.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

const getRecord = (value: unknown): Record<string, unknown> => value as Record<string, unknown>;

const getCpuMemoryType = (components: SelectedBuildComponents): string => {
  const explicit = getRecord(components.cpu).memoryType;
  return typeof explicit === 'string' ? explicit : components.ram.memoryType;
};

const getCpuMaxMemoryFrequency = (components: SelectedBuildComponents): number => {
  const explicit = getRecord(components.cpu).maxMemoryFrequency;
  return typeof explicit === 'number' ? explicit : components.ram.frequencyMhz;
};

const getCpuScore = (components: SelectedBuildComponents): number => {
  const explicit = getRecord(components.cpu).performanceScore;
  return typeof explicit === 'number' ? explicit : components.cpu.cores * 8 + components.cpu.threads * 2;
};

const getGpuScore = (components: SelectedBuildComponents): number => {
  const explicit = getRecord(components.gpu).performanceScore;
  return typeof explicit === 'number' ? explicit : components.gpu.vramGb * 10 + components.gpu.powerConsumption / 8;
};

const getStorageInterfaceType = (components: SelectedBuildComponents): string => {
  const explicit = getRecord(components.storage).interfaceType;
  return typeof explicit === 'string' ? explicit : components.storage.interface;
};

const getStoragePcieVersion = (components: SelectedBuildComponents): string | null => {
  const explicit = getRecord(components.storage).pcieVersion;
  return typeof explicit === 'string' ? explicit : null;
};

const getPsuFormFactor = (components: SelectedBuildComponents): string => {
  const explicit = getRecord(components.psu).formFactor;
  return typeof explicit === 'string' ? explicit : 'ATX';
};

const getSupportedPsuFormFactor = (components: SelectedBuildComponents): string => {
  const explicit = getRecord(components.pcCase).supportedPsuFormFactor;
  return typeof explicit === 'string' ? explicit : 'ATX';
};

const getPsuReliabilityScore = (components: SelectedBuildComponents): number => {
  const explicit = getRecord(components.psu).reliabilityScore;
  return typeof explicit === 'number' ? explicit : 70;
};

const getGpuPcieVersion = (components: SelectedBuildComponents): string => {
  const explicit = getRecord(components.gpu).pcieVersion;
  return typeof explicit === 'string' ? explicit : components.gpu.pcieInterface;
};

export function checkCompatibility(components: SelectedBuildComponents): CompatibilityResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  const { cpu, motherboard, ram, gpu, psu, storage, pcCase, cooler } = components;

  // CPU + Motherboard
  if (cpu.socket !== motherboard.socket) {
    errors.push(`Процессор несовместим с материнской платой: сокет CPU ${cpu.socket} не совпадает с сокетом платы ${motherboard.socket}`);
  }
  if (!includesNormalized(motherboard.supportedCpuGenerations, cpu.generation)) {
    errors.push('Материнская плата не поддерживает поколение выбранного процессора.');
  }
  if (cpu.tdp >= 125 && motherboard.vrmQualityScore < 70) {
    warnings.push('Высокопроизводительный процессор может перегружать подсистему питания этой материнской платы.');
  }
  if (containsIgnoreCase(motherboard.biosVersion, ['update', 'required', 'требуется', 'нужно обновить', 'bios update'])) {
    warnings.push('Для выбранного процессора может потребоваться обновление BIOS материнской платы.');
  }

  // Motherboard + RAM
  if (motherboard.memoryType !== ram.memoryType) {
    errors.push(`Оперативная память несовместима с материнской платой: тип памяти ${ram.memoryType} не поддерживается.`);
  }
  if (ram.frequencyMhz > motherboard.maxRamFrequency) {
    warnings.push('Частота оперативной памяти выше официально поддерживаемой материнской платой. Возможна работа на пониженной частоте.');
  }
  const ramTotalSizeGb = ram.capacityGb;
  const ramModulesCount = ram.sticks;
  if (ramTotalSizeGb > motherboard.maxRamGb) {
    errors.push('Объём оперативной памяти превышает максимально поддерживаемый объём материнской платы.');
  }
  if (ramModulesCount > motherboard.ramSlots) {
    errors.push('Количество модулей RAM превышает количество слотов на материнской плате.');
  }

  // CPU + RAM
  if (getCpuMemoryType(components) !== ram.memoryType) {
    errors.push('Процессор не поддерживает выбранный тип оперативной памяти.');
  }
  if (ram.frequencyMhz > getCpuMaxMemoryFrequency(components)) {
    warnings.push('Частота RAM выше официально поддерживаемой процессором. Возможна необходимость ручной настройки XMP/EXPO.');
  }

  // GPU + Motherboard
  if (isPcieNewer(getGpuPcieVersion(components), motherboard.pcieVersion)) {
    warnings.push('Видеокарта использует более новую версию PCIe, чем материнская плата. Возможна работа с ограниченной пропускной способностью.');
  }

  // GPU + PSU
  const totalPowerConsumption = calculateTotalPowerConsumption(components);
  const requiredPsuWattage = calculateRequiredPsuWattage(totalPowerConsumption);
  if (psu.wattage < gpu.recommendedPsuWattage) {
    errors.push('Мощность блока питания ниже рекомендованной для выбранной видеокарты.');
  }
  if (psu.wattage < requiredPsuWattage) {
    errors.push('Блок питания не обеспечивает рекомендуемый запас мощности 20%.');
  }
  if ((gpu.name.includes('4090') || gpu.powerConsumption >= 400) && !psu.has12Vhpwr) {
    warnings.push('Для мощной видеокарты рекомендуется блок питания с разъёмом 12VHPWR.');
  }
  if (getPsuReliabilityScore(components) < 60 && gpu.powerConsumption >= 300) {
    warnings.push('Для энергоёмкой видеокарты рекомендуется использовать более надёжный блок питания.');
  }

  // GPU + Case
  if (gpu.lengthMm > pcCase.maxGpuLengthMm) {
    errors.push('Видеокарта не помещается в выбранный корпус по длине.');
  }

  // Motherboard + Case
  if (!includesNormalized(pcCase.supportedMotherboardFormFactors, motherboard.formFactor)) {
    errors.push('Форм-фактор материнской платы не поддерживается выбранным корпусом.');
  }

  // PSU + Case
  if (getPsuFormFactor(components) !== getSupportedPsuFormFactor(components)) {
    errors.push('Форм-фактор блока питания не поддерживается выбранным корпусом.');
  }

  // Storage + Motherboard
  if (containsIgnoreCase(getStorageInterfaceType(components), ['SATA']) && motherboard.sataPorts <= 0) {
    errors.push('Для SATA-накопителя на материнской плате нет доступных SATA-портов.');
  }
  if ((containsIgnoreCase(getStorageInterfaceType(components), ['NVMe']) || containsIgnoreCase(storage.formFactor, ['M.2'])) && motherboard.m2Slots <= 0) {
    errors.push('Для NVMe/M.2 накопителя на материнской плате нет доступных M.2 слотов.');
  }
  if (isPcieNewer(getStoragePcieVersion(components), motherboard.pcieVersion)) {
    warnings.push('Накопитель поддерживает более новую версию PCIe, чем материнская плата. Скорость накопителя может быть ограничена.');
  }

  // Cooler + CPU
  if (cooler.tdpRatingWatts < cpu.tdp) {
    errors.push('Система охлаждения не рассчитана на тепловыделение выбранного процессора.');
  } else if (cooler.tdpRatingWatts < cpu.tdp * 1.2) {
    warnings.push('Запас охлаждения процессора меньше рекомендуемых 20%.');
  }
  if (!includesNormalized(cooler.supportedSockets, cpu.socket)) {
    errors.push('Кулер не поддерживает сокет выбранного процессора.');
  }

  // Cooler + Case
  if (cooler.heightMm > pcCase.maxCpuCoolerHeightMm) {
    errors.push('Кулер не помещается в выбранный корпус по высоте.');
  }

  // CPU + GPU bottleneck
  const cpuGpuBalance = calculateCpuGpuBalance(getCpuScore(components), getGpuScore(components));
  if (cpuGpuBalance.status === 'cpu_bottleneck' || cpuGpuBalance.status === 'critical_cpu_bottleneck') {
    warnings.push('Возможное узкое место: видеокарта значительно мощнее процессора.');
  }
  if (cpuGpuBalance.status === 'gpu_bottleneck' || cpuGpuBalance.status === 'critical_gpu_bottleneck') {
    recommendations.push('Видеокарта заметно слабее процессора. Возможно, стоит перераспределить бюджет в пользу GPU.');
  }
  if (cpuGpuBalance.status !== 'balanced' && !recommendations.includes(cpuGpuBalance.message)) {
    recommendations.push(cpuGpuBalance.message);
  }

  // Итоговые рекомендации
  if (totalPowerConsumption > 500) {
    recommendations.push('Для мощной игровой сборки рекомендуется обеспечить качественную вентиляцию корпуса.');
  }
  if (ramTotalSizeGb < 16) {
    recommendations.push('Для современных игр рекомендуется не менее 16 ГБ оперативной памяти.');
  }
  if (gpu.vramGb < 8) {
    recommendations.push('Для современных игр рекомендуется видеокарта минимум с 8 ГБ видеопамяти.');
  }
  if (errors.length === 0 && warnings.length === 0) {
    recommendations.push('Конфигурация совместима и не содержит заметных аппаратных рисков.');
  }

  return {
    isCompatible: errors.length === 0,
    errors,
    warnings,
    recommendations,
    totalPowerConsumption,
    requiredPsuWattage,
    totalPrice: calculateTotalPrice(components),
    compatibilityScore: calculateCompatibilityScore(errors, warnings),
  };
}
