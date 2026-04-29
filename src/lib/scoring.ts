import {
  BOTTLENECK_CRITICAL_THRESHOLD,
  BOTTLENECK_WARNING_THRESHOLD,
  OTHER_COMPONENTS_POWER_WATTS,
  PSU_POWER_RESERVE_PERCENT,
} from './constants';
import type { SelectedBuildComponents } from '../types/build';

export type CpuGpuBalanceStatus =
  | 'balanced'
  | 'gpu_bottleneck'
  | 'cpu_bottleneck'
  | 'critical_gpu_bottleneck'
  | 'critical_cpu_bottleneck';

export interface CpuGpuBalanceResult {
  difference: number;
  status: CpuGpuBalanceStatus;
  message: string;
}

export function calculateTotalPrice(components: SelectedBuildComponents): number {
  return (
    components.cpu.price +
    components.motherboard.price +
    components.ram.price +
    components.gpu.price +
    components.psu.price +
    components.storage.price +
    components.pcCase.price +
    components.cooler.price
  );
}

export function calculateTotalPowerConsumption(
  components: SelectedBuildComponents,
): number {
  return (
    components.cpu.tdp + components.gpu.powerConsumption + OTHER_COMPONENTS_POWER_WATTS
  );
}

export function calculateRequiredPsuWattage(totalPowerConsumption: number): number {
  const reserveMultiplier = 1 + PSU_POWER_RESERVE_PERCENT / 100;

  return Math.ceil(totalPowerConsumption * reserveMultiplier);
}

export function calculateCompatibilityScore(
  errors: string[],
  warnings: string[],
): number {
  const rawScore = 100 - errors.length * 25 - warnings.length * 7;

  return Math.max(rawScore, 0);
}

export function calculateCpuGpuBalance(
  cpuPerformanceScore: number,
  gpuPerformanceScore: number,
): CpuGpuBalanceResult {
  const difference = Math.abs(cpuPerformanceScore - gpuPerformanceScore);

  if (difference < BOTTLENECK_WARNING_THRESHOLD) {
    return {
      difference,
      status: 'balanced',
      message: 'Баланс CPU и GPU находится в норме.',
    };
  }

  const isCpuBottleneck = gpuPerformanceScore > cpuPerformanceScore;
  const isCritical = difference >= BOTTLENECK_CRITICAL_THRESHOLD;

  if (isCpuBottleneck) {
    return {
      difference,
      status: isCritical ? 'critical_cpu_bottleneck' : 'cpu_bottleneck',
      message: isCritical
        ? 'Критический упор в процессор: видеокарта значительно мощнее CPU.'
        : 'Есть упор в процессор: видеокарта заметно мощнее CPU.',
    };
  }

  return {
    difference,
    status: isCritical ? 'critical_gpu_bottleneck' : 'gpu_bottleneck',
    message: isCritical
      ? 'Критический упор в видеокарту: процессор значительно мощнее GPU.'
      : 'Есть упор в видеокарту: процессор заметно мощнее GPU.',
  };
}
