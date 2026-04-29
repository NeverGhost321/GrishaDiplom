import { describe, expect, it } from 'vitest';
import { generateBuild } from './build-generator.service';
import type { BuildGenerationParams } from '../types/build';
import type { Cooler, Cpu, Gpu, Motherboard, PcCase, Psu, Ram, Storage } from '../types/components';

const cpus: Cpu[] = [
  { id: 1, name: 'AMD Ryzen 5 7600', price: 22000, brand: 'AMD', socket: 'AM5', cores: 6, threads: 12, baseClockGhz: 3.8, boostClockGhz: 5.1, tdp: 65, integratedGraphics: true, generation: 'Ryzen 7000', performanceScore: 78, memoryType: 'DDR5' } as Cpu & { performanceScore: number; memoryType: string },
  { id: 2, name: 'Intel Core i5-12400F', price: 17000, brand: 'Intel', socket: 'LGA1700', cores: 6, threads: 12, baseClockGhz: 2.5, boostClockGhz: 4.4, tdp: 65, integratedGraphics: false, generation: '12th Gen', performanceScore: 68, memoryType: 'DDR4' } as Cpu & { performanceScore: number; memoryType: string },
];
const motherboards: Motherboard[] = [
  { id: 3, name: 'B650', price: 16000, socket: 'AM5', chipset: 'B650', supportedCpuGenerations: 'Ryzen 7000', memoryType: 'DDR5', maxRamGb: 128, maxRamFrequency: 6400, ramSlots: 4, pcieVersion: 'PCIe 4.0', m2Slots: 2, sataPorts: 4, formFactor: 'ATX', vrmQualityScore: 80, biosVersion: 'stable', boardManufacturer: 'ASUS' } as Motherboard & { boardManufacturer: string },
  { id: 4, name: 'B660', price: 11000, socket: 'LGA1700', chipset: 'B660', supportedCpuGenerations: '12th Gen', memoryType: 'DDR4', maxRamGb: 128, maxRamFrequency: 5200, ramSlots: 4, pcieVersion: 'PCIe 4.0', m2Slots: 2, sataPorts: 4, formFactor: 'ATX', vrmQualityScore: 72, biosVersion: 'stable', boardManufacturer: 'MSI' } as Motherboard & { boardManufacturer: string },
];
const rams: Ram[] = [
  { id: 5, name: '32GB DDR5', price: 10000, memoryType: 'DDR5', capacityGb: 32, sticks: 2, frequencyMhz: 5600, cl: 36, voltage: 1.25, rgb: false },
  { id: 6, name: '16GB DDR4', price: 5000, memoryType: 'DDR4', capacityGb: 16, sticks: 2, frequencyMhz: 3200, cl: 16, voltage: 1.35, rgb: false },
];
const gpus: Gpu[] = [
  { id: 7, name: 'RTX 4070', price: 54000, brand: 'NVIDIA', chipset: 'AD104', vramGb: 12, lengthMm: 280, powerConsumption: 200, recommendedPsuWattage: 650, pcieInterface: 'PCIe 4.0', performanceScore: 86, manufacturer: 'NVIDIA' } as Gpu & { performanceScore: number; manufacturer: string },
  { id: 8, name: 'RX 7600', price: 28000, brand: 'AMD', chipset: 'Navi 33', vramGb: 8, lengthMm: 250, powerConsumption: 165, recommendedPsuWattage: 550, pcieInterface: 'PCIe 4.0', performanceScore: 66, manufacturer: 'AMD' } as Gpu & { performanceScore: number; manufacturer: string },
];
const psus: Psu[] = [
  { id: 9, name: '750W Gold', price: 8000, wattage: 750, efficiencyRating: '80+ Gold', has12Vhpwr: true, pcie8PinCount: 4, atxVersion: 'ATX 3.0', modular: true, reliabilityScore: 85 } as Psu & { reliabilityScore: number },
  { id: 10, name: '550W Bronze', price: 4500, wattage: 550, efficiencyRating: '80+ Bronze', has12Vhpwr: false, pcie8PinCount: 2, atxVersion: 'ATX 2.4', modular: false, reliabilityScore: 65 } as Psu & { reliabilityScore: number },
];
const storages: Storage[] = [
  { id: 11, name: '1TB NVMe', price: 6000, type: 'SSD', interface: 'NVMe PCIe 4.0', capacityGb: 1000, readSpeedMBs: 5000, writeSpeedMBs: 4000, formFactor: 'M.2', interfaceType: 'NVMe', pcieVersion: 'PCIe 4.0' } as Storage & { interfaceType: string; pcieVersion: string },
];
const cases: PcCase[] = [
  { id: 12, name: 'ATX Airflow', price: 5000, formFactor: 'Mid Tower', supportedMotherboardFormFactors: 'ATX, mATX', maxGpuLengthMm: 320, maxCpuCoolerHeightMm: 165, radiatorSupport: '240', fanCountIncluded: 3, airflowScore: 80, supportedPsuFormFactor: 'ATX' } as PcCase & { supportedPsuFormFactor: string },
];
const coolers: Cooler[] = [
  { id: 13, name: 'Tower 180W', price: 3000, type: 'Air', supportedSockets: 'AM5, LGA1700', tdpRatingWatts: 180, heightMm: 155, radiatorSizeMm: 0, noiseLevelDb: 28 },
];

const pool = { cpus, motherboards, rams, gpus, psus, storages, cases, coolers };

describe('BuildGeneratorService.generateBuild', () => {
  it('подбирает совместимую сборку при достаточном бюджете', () => {
    const params: BuildGenerationParams = { budget: 140000, targetResolution: 'qhd', priority: 'balanced' };
    const result = generateBuild(params, pool);

    expect(result).not.toBeNull();
    expect(result?.compatibilityResult.isCompatible).toBe(true);
    expect((result?.totalPrice ?? 0) <= params.budget).toBe(true);
    expect(result?.explanation).toContain('Сборка выбрана');
  });

  it('возвращает null при слишком маленьком бюджете', () => {
    const params: BuildGenerationParams = { budget: 25000, targetResolution: 'qhd', priority: 'performance' };
    const result = generateBuild(params, pool);
    expect(result).toBeNull();
  });

  it('учитывает excludedBrands', () => {
    const params: BuildGenerationParams = { budget: 140000, targetResolution: 'qhd', priority: 'balanced', excludedBrands: ['NVIDIA'] };
    const result = generateBuild(params, pool);

    expect(result).not.toBeNull();
    expect(result?.components.gpu.brand).not.toBe('NVIDIA');
  });
});
