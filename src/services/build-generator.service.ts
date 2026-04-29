import { checkCompatibility, splitCsv } from './compatibility.service';
import type {
  BuildGenerationParams,
  GeneratedBuildResult,
  SelectedBuildComponents,
} from '../types/build';
import type {
  Cooler,
  Cpu,
  Gpu,
  Motherboard,
  PcCase,
  Psu,
  Ram,
  Storage,
} from '../types/components';

type ComponentsPool = {
  cpus: Cpu[];
  motherboards: Motherboard[];
  rams: Ram[];
  gpus: Gpu[];
  psus: Psu[];
  storages: Storage[];
  cases: PcCase[];
  coolers: Cooler[];
};

type BuildCandidate = {
  components: SelectedBuildComponents;
  totalPrice: number;
  compatibilityResult: ReturnType<typeof checkCompatibility>;
  performanceScore: number;
  buildScore: number;
};

const getRecord = (value: unknown): Record<string, unknown> => value as Record<string, unknown>;
const getNumberField = (value: unknown, key: string, fallback = 0): number => {
  const raw = getRecord(value)[key];
  return typeof raw === 'number' ? raw : fallback;
};

export function getComponentBrandNames(component: unknown): string[] {
  const rawNames = ['brand', 'manufacturer', 'gpuManufacturer', 'boardManufacturer']
    .map((key) => getRecord(component)[key])
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

  return Array.from(new Set(rawNames.map((name) => name.toLowerCase())));
}

export function isPreferredBrand(component: unknown, preferredBrands: string[]): boolean {
  if (preferredBrands.length === 0) return false;
  const normalizedPreferred = preferredBrands.map((brand) => brand.toLowerCase());
  return getComponentBrandNames(component).some((name) => normalizedPreferred.includes(name));
}

export function filterExcludedBrands<T>(items: T[], excludedBrands: string[]): T[] {
  if (excludedBrands.length === 0) return items;
  const normalized = excludedBrands.map((brand) => brand.toLowerCase());

  return items.filter((item) => {
    const names = getComponentBrandNames(item);
    return !names.some((name) => normalized.includes(name));
  });
}

export function getResolutionGpuRange(targetResolution: BuildGenerationParams['targetResolution']): {
  min: number;
  max: number;
} {
  if (targetResolution === 'fullhd') return { min: 50, max: 75 };
  if (targetResolution === 'qhd') return { min: 70, max: 90 };
  return { min: 85, max: 120 };
}

export function sortByPriceDistance<T extends { price: number }>(items: T[], targetPrice: number): T[] {
  return [...items].sort((a, b) => Math.abs(a.price - targetPrice) - Math.abs(b.price - targetPrice));
}

export function getTopCandidates<T>(items: T[], limit: number): T[] {
  return items.slice(0, limit);
}

export function supportsUpgradePriority(components: SelectedBuildComponents): boolean {
  const cpuSocket = components.cpu.socket.toUpperCase();
  const ddr5 = components.ram.memoryType.toUpperCase() === 'DDR5';
  const pcie = Number((components.motherboard.pcieVersion.match(/(\d+(?:\.\d+)?)/)?.[1] ?? '0'));
  return ddr5 && (cpuSocket === 'AM5' || cpuSocket === 'LGA1700') && pcie >= 4;
}

export function calculateBuildScore(
  candidate: Omit<BuildCandidate, 'buildScore'>,
  params: BuildGenerationParams,
): number {
  const { compatibilityResult, totalPrice, components, performanceScore } = candidate;
  const budgetRatio = Math.max(0, Math.min(1, totalPrice / params.budget));
  const underBudgetScore = 100 - (1 - budgetRatio) * 100;
  const budgetSaverScore = 100 - budgetRatio * 100;
  const reliabilityScore = getNumberField(components.psu, 'reliabilityScore', 70) * 0.5 + components.motherboard.vrmQualityScore * 0.5;
  const preferredBonus = [
    components.cpu,
    components.gpu,
    components.motherboard,
    components.psu,
    components.ram,
  ].reduce((acc, component) => acc + (isPreferredBrand(component, params.preferredBrands ?? []) ? 1.5 : 0), 0);
  const warningPenalty = compatibilityResult.warnings.length * 2;

  const weights = {
    performance: { perf: 0.45, compat: 0.25, budget: 0.2, reliability: 0.1 },
    balanced: { perf: 0.35, compat: 0.3, budget: 0.2, reliability: 0.15 },
    budget: { perf: 0.25, compat: 0.25, budget: 0.35, reliability: 0.15 },
    reliability: { perf: 0.2, compat: 0.3, budget: 0.1, reliability: 0.4 },
    upgrade: { perf: 0.3, compat: 0.25, budget: 0.15, reliability: 0.2 },
  }[params.priority];

  const budgetComponent = params.priority === 'budget' ? budgetSaverScore : underBudgetScore;
  const upgradeBonus = params.priority === 'upgrade' && supportsUpgradePriority(components) ? 8 : 0;

  return (
    performanceScore * weights.perf +
    compatibilityResult.compatibilityScore * weights.compat +
    budgetComponent * weights.budget +
    reliabilityScore * weights.reliability +
    preferredBonus +
    upgradeBonus -
    warningPenalty
  );
}

export function createExplanation(result: BuildCandidate, params: BuildGenerationParams): string {
  const resolutionMap = { fullhd: 'Full HD', qhd: '2K (QHD)', uhd: '4K (UHD)' };
  const base = `Сборка выбрана под ${resolutionMap[params.targetResolution]} с приоритетом «${params.priority}». Основной упор сделан на связку ${result.components.gpu.name} + ${result.components.cpu.name}.`;
  const budgetText = ` Итоговая стоимость: ${result.totalPrice} ₽ при бюджете ${params.budget} ₽.`;
  const compatText = ` Совместимость подтверждена, score: ${result.compatibilityResult.compatibilityScore}.`;
  const warningText = result.compatibilityResult.warnings.length > 0
    ? ` Есть предупреждения: ${result.compatibilityResult.warnings.join(' ')}`
    : ' Критичных предупреждений по конфигурации нет.';
  return `${base}${budgetText}${compatText}${warningText}`;
}

export function generateBuild(
  params: BuildGenerationParams,
  componentsPool: ComponentsPool,
): GeneratedBuildResult | null {
  const excluded = params.excludedBrands ?? [];
  const cpus = filterExcludedBrands(componentsPool.cpus, excluded);
  const motherboards = filterExcludedBrands(componentsPool.motherboards, excluded);
  const rams = filterExcludedBrands(componentsPool.rams, excluded);
  const gpus = filterExcludedBrands(componentsPool.gpus, excluded);
  const psus = filterExcludedBrands(componentsPool.psus, excluded);
  const storages = filterExcludedBrands(componentsPool.storages, excluded);
  const cases = filterExcludedBrands(componentsPool.cases, excluded);
  const coolers = filterExcludedBrands(componentsPool.coolers, excluded);

  if ([cpus, motherboards, rams, gpus, psus, storages, cases, coolers].some((items) => items.length === 0)) return null;

  const budgets = {
    gpu: params.budget * 0.4,
    cpu: params.budget * 0.2,
    motherboard: params.budget * 0.12,
    ram: params.budget * 0.1,
    psu: params.budget * 0.09,
    storage: params.budget * 0.07,
  };

  const gpuRange = getResolutionGpuRange(params.targetResolution);
  const gpuScored = gpus
    .map((gpu) => ({ gpu, score: getNumberField(gpu, 'performanceScore', gpu.vramGb * 8) }))
    .filter((entry) => entry.score >= gpuRange.min - 8 && entry.score <= gpuRange.max + 12)
    .sort((a, b) => b.score - a.score || Math.abs(a.gpu.price - budgets.gpu) - Math.abs(b.gpu.price - budgets.gpu));
  const gpuCandidates = getTopCandidates((gpuScored.length > 0 ? gpuScored : gpus.map((gpu) => ({ gpu, score: getNumberField(gpu, 'performanceScore', gpu.vramGb * 8) }))).map((x) => x.gpu), 6);

  const compatibleBuilds: BuildCandidate[] = [];

  for (const gpu of gpuCandidates) {
    const gpuPerf = getNumberField(gpu, 'performanceScore', gpu.vramGb * 8);
    const cpuCandidates = getTopCandidates(
      cpus
        .filter((cpu) => {
          const cpuPerf = getNumberField(cpu, 'performanceScore', cpu.cores * 8 + cpu.threads * 2);
          return cpuPerf >= gpuPerf * 0.65;
        })
        .sort((a, b) => Math.abs(a.price - budgets.cpu) - Math.abs(b.price - budgets.cpu)),
      6,
    );

    for (const cpu of cpuCandidates) {
      const memoryType = (getRecord(cpu).memoryType as string | undefined) ?? 'DDR4';
      const boardCandidates = getTopCandidates(
        motherboards
          .filter((mb) => mb.socket === cpu.socket && mb.memoryType === memoryType && splitCsv(mb.supportedCpuGenerations).includes(cpu.generation))
          .sort((a, b) => Math.abs(a.price - budgets.motherboard) - Math.abs(b.price - budgets.motherboard)),
        5,
      );

      const ramCandidates = getTopCandidates(sortByPriceDistance(rams.filter((ram) => ram.memoryType === memoryType), budgets.ram), 5);
      const psuCandidates = getTopCandidates(
        sortByPriceDistance(psus.filter((psu) => psu.wattage >= gpu.recommendedPsuWattage), budgets.psu),
        5,
      );
      const storageCandidates = getTopCandidates(sortByPriceDistance(storages, budgets.storage), 4);
      const caseCandidates = getTopCandidates(sortByPriceDistance(cases, params.budget * 0.06), 5);
      const coolerCandidates = getTopCandidates(
        sortByPriceDistance(coolers.filter((cooler) => splitCsv(cooler.supportedSockets).includes(cpu.socket)), params.budget * 0.04),
        5,
      );

      for (const motherboard of boardCandidates) {
        for (const ram of ramCandidates) {
          for (const psu of psuCandidates) {
            for (const storage of storageCandidates) {
              for (const pcCase of caseCandidates) {
                for (const cooler of coolerCandidates) {
                  const components: SelectedBuildComponents = { cpu, motherboard, ram, gpu, psu, storage, pcCase, cooler };
                  const compatibilityResult = checkCompatibility(components);
                  if (!compatibilityResult.isCompatible || compatibilityResult.errors.length > 0) continue;
                  const totalPrice = compatibilityResult.totalPrice;
                  if (totalPrice > params.budget) continue;

                  const cpuPerf = getNumberField(cpu, 'performanceScore', cpu.cores * 8 + cpu.threads * 2);
                  const performanceScore = gpuPerf * 0.6 + cpuPerf * 0.4;
                  const candidateWithoutScore = { components, totalPrice, compatibilityResult, performanceScore };
                  const buildScore = calculateBuildScore(candidateWithoutScore, params);
                  compatibleBuilds.push({ ...candidateWithoutScore, buildScore });
                }
              }
            }
          }
        }
      }
    }
  }

  if (compatibleBuilds.length === 0) return null;

  compatibleBuilds.sort((a, b) => b.buildScore - a.buildScore);
  const best = compatibleBuilds[0];

  const alternatives: Partial<SelectedBuildComponents>[] = [];
  const altGpu = gpuCandidates.filter((gpu) => gpu.id !== best.components.gpu.id).slice(0, 3);
  altGpu.forEach((gpu) => alternatives.push({ gpu }));
  const altCpu = cpus.filter((cpu) => cpu.socket === best.components.cpu.socket && cpu.id !== best.components.cpu.id).slice(0, 3);
  altCpu.forEach((cpu) => alternatives.push({ cpu }));
  const altRamOrPsu = [
    ...rams.filter((ram) => ram.memoryType === best.components.ram.memoryType && ram.id !== best.components.ram.id).slice(0, 2).map((ram) => ({ ram })),
    ...psus.filter((psu) => psu.id !== best.components.psu.id && psu.wattage >= best.compatibilityResult.requiredPsuWattage).slice(0, 1).map((psu) => ({ psu })),
  ];
  alternatives.push(...altRamOrPsu.slice(0, 3));

  return {
    components: best.components,
    totalPrice: best.totalPrice,
    compatibilityResult: best.compatibilityResult,
    performanceScore: best.performanceScore,
    explanation: createExplanation(best, params),
    alternatives: alternatives.slice(0, 9),
  };
}
