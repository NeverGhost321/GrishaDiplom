import { describe, expect, it } from 'vitest';
import { checkCompatibility } from './compatibility.service';
import type { SelectedBuildComponents } from '../types/build';

function createCompatibleBuild(
  overrides: Partial<SelectedBuildComponents> = {},
): SelectedBuildComponents {
  const base: SelectedBuildComponents = {
    cpu: {
      id: 1,
      name: 'AMD Ryzen 5 7600',
      price: 22000,
      brand: 'AMD',
      socket: 'AM5',
      cores: 6,
      threads: 12,
      baseClockGhz: 3.8,
      boostClockGhz: 5.1,
      tdp: 65,
      integratedGraphics: true,
      generation: 'Ryzen 7000',
      memoryType: 'DDR5',
      maxMemoryFrequency: 6000,
      performanceScore: 76,
    } as SelectedBuildComponents['cpu'] & { memoryType: string; maxMemoryFrequency: number; performanceScore: number },
    motherboard: {
      id: 2,
      name: 'B650 ATX',
      price: 18000,
      socket: 'AM5',
      chipset: 'B650',
      supportedCpuGenerations: 'Ryzen 7000, Ryzen 8000',
      memoryType: 'DDR5',
      maxRamGb: 128,
      maxRamFrequency: 6400,
      ramSlots: 4,
      pcieVersion: 'PCIe 4.0',
      m2Slots: 2,
      sataPorts: 4,
      formFactor: 'ATX',
      vrmQualityScore: 82,
      biosVersion: 'F6 stable',
    },
    ram: {
      id: 3,
      name: '32GB DDR5 5600',
      price: 12000,
      memoryType: 'DDR5',
      capacityGb: 32,
      sticks: 2,
      frequencyMhz: 5600,
      cl: 36,
      voltage: 1.25,
      rgb: false,
    },
    gpu: {
      id: 4,
      name: 'GeForce RTX 4070',
      price: 65000,
      brand: 'NVIDIA',
      chipset: 'AD104',
      vramGb: 12,
      lengthMm: 300,
      powerConsumption: 200,
      recommendedPsuWattage: 650,
      pcieInterface: 'PCIe 4.0',
      pcieVersion: 'PCIe 4.0',
      performanceScore: 110,
    } as SelectedBuildComponents['gpu'] & { pcieVersion: string; performanceScore: number },
    psu: {
      id: 5,
      name: '750W Gold',
      price: 9000,
      wattage: 750,
      efficiencyRating: '80+ Gold',
      has12Vhpwr: true,
      pcie8PinCount: 4,
      atxVersion: 'ATX 3.0',
      modular: true,
      formFactor: 'ATX',
      reliabilityScore: 85,
    } as SelectedBuildComponents['psu'] & { formFactor: string; reliabilityScore: number },
    storage: {
      id: 6,
      name: '1TB NVMe Gen4',
      price: 7000,
      type: 'SSD',
      interface: 'NVMe PCIe 4.0',
      capacityGb: 1000,
      readSpeedMBs: 7000,
      writeSpeedMBs: 5000,
      formFactor: 'M.2',
      interfaceType: 'NVMe',
      pcieVersion: 'PCIe 4.0',
    } as SelectedBuildComponents['storage'] & { interfaceType: string; pcieVersion: string },
    pcCase: {
      id: 7,
      name: 'ATX Airflow Case',
      price: 6500,
      formFactor: 'Mid Tower',
      supportedMotherboardFormFactors: 'ATX, Micro-ATX',
      maxGpuLengthMm: 340,
      maxCpuCoolerHeightMm: 170,
      radiatorSupport: '240/360',
      fanCountIncluded: 3,
      airflowScore: 82,
      supportedPsuFormFactor: 'ATX',
    } as SelectedBuildComponents['pcCase'] & { supportedPsuFormFactor: string },
    cooler: {
      id: 8,
      name: 'Tower Cooler 180W',
      price: 3500,
      type: 'Air',
      supportedSockets: 'AM5, AM4, LGA1700',
      tdpRatingWatts: 180,
      heightMm: 158,
      radiatorSizeMm: 0,
      noiseLevelDb: 30,
    },
  };

  return {
    ...base,
    ...overrides,
  };
}

describe('CompatibilityService.checkCompatibility', () => {
  it('returns compatible result for a fully compatible build', () => {
    const result = checkCompatibility(createCompatibleBuild());

    expect(result.isCompatible).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.compatibilityScore).toBeGreaterThanOrEqual(80);
    expect(result.warnings).toHaveLength(0);
    expect(result.recommendations).toContain(
      'Конфигурация совместима и не содержит заметных аппаратных рисков.',
    );
  });

  it('detects incompatible CPU and motherboard socket', () => {
    const result = checkCompatibility(
      createCompatibleBuild({
        motherboard: { ...createCompatibleBuild().motherboard, socket: 'LGA1700' },
      }),
    );

    expect(result.isCompatible).toBe(false);
    expect(result.errors.join(' ')).toContain('сокет CPU AM5 не совпадает');
  });

  it('detects unsupported CPU generation on motherboard', () => {
    const result = checkCompatibility(
      createCompatibleBuild({
        motherboard: { ...createCompatibleBuild().motherboard, supportedCpuGenerations: 'Ryzen 5000' },
      }),
    );

    expect(result.isCompatible).toBe(false);
    expect(result.errors.join(' ')).toContain('не поддерживает поколение');
  });

  it('detects incompatible RAM type', () => {
    const result = checkCompatibility(
      createCompatibleBuild({
        ram: { ...createCompatibleBuild().ram, memoryType: 'DDR4' },
      }),
    );

    expect(result.isCompatible).toBe(false);
    expect(result.errors.join(' ')).toContain('Оперативная память несовместима');
  });

  it('warns when RAM frequency is above motherboard and CPU limits', () => {
    const result = checkCompatibility(
      createCompatibleBuild({
        ram: { ...createCompatibleBuild().ram, frequencyMhz: 7000 },
        motherboard: { ...createCompatibleBuild().motherboard, maxRamFrequency: 6400 },
      }),
    );

    expect(result.isCompatible).toBe(true);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining('выше официально поддерживаемой материнской платой'),
        expect.stringContaining('выше официально поддерживаемой процессором'),
      ]),
    );
  });

  it('fails when PSU wattage is insufficient', () => {
    const result = checkCompatibility(
      createCompatibleBuild({
        psu: { ...createCompatibleBuild().psu, wattage: 450 },
      }),
    );

    expect(result.isCompatible).toBe(false);
    expect(result.errors.join(' ')).toContain('Мощность блока питания ниже рекомендованной');
  });

  it('fails when GPU does not fit case length', () => {
    const result = checkCompatibility(
      createCompatibleBuild({
        gpu: { ...createCompatibleBuild().gpu, lengthMm: 380 },
      }),
    );

    expect(result.isCompatible).toBe(false);
    expect(result.errors.join(' ')).toContain('не помещается в выбранный корпус по длине');
  });

  it('fails when NVMe storage is selected but motherboard has no M.2 slots', () => {
    const result = checkCompatibility(
      createCompatibleBuild({
        motherboard: { ...createCompatibleBuild().motherboard, m2Slots: 0 },
      }),
    );

    expect(result.isCompatible).toBe(false);
    expect(result.errors.join(' ')).toContain('нет доступных M.2 слотов');
  });

  it('fails when cooler socket support is missing CPU socket', () => {
    const result = checkCompatibility(
      createCompatibleBuild({
        cooler: { ...createCompatibleBuild().cooler, supportedSockets: 'AM4, LGA1700' },
      }),
    );

    expect(result.isCompatible).toBe(false);
    expect(result.errors.join(' ')).toContain('Кулер не поддерживает сокет');
  });

  it('fails when cooler cannot handle CPU TDP', () => {
    const result = checkCompatibility(
      createCompatibleBuild({
        cpu: { ...createCompatibleBuild().cpu, tdp: 170 },
        cooler: { ...createCompatibleBuild().cooler, tdpRatingWatts: 95 },
      }),
    );

    expect(result.isCompatible).toBe(false);
    expect(result.errors.join(' ')).toContain('Система охлаждения не рассчитана');
  });

  it('keeps build compatible but warns on older motherboard PCIe version', () => {
    const result = checkCompatibility(
      createCompatibleBuild({
        motherboard: { ...createCompatibleBuild().motherboard, pcieVersion: 'PCIe 3.0' },
      }),
    );

    expect(result.isCompatible).toBe(true);
    expect(result.warnings.join(' ')).toContain('более новую версию PCIe');
  });

  it('warns when BIOS update may be required', () => {
    const result = checkCompatibility(
      createCompatibleBuild({
        motherboard: {
          ...createCompatibleBuild().motherboard,
          biosVersion: 'BIOS update required for Ryzen 7000',
        },
      }),
    );

    expect(result.isCompatible).toBe(true);
    expect(result.warnings.join(' ')).toContain('обновление BIOS');
  });

  it('warns about CPU bottleneck with very strong GPU', () => {
    const result = checkCompatibility(
      createCompatibleBuild({
        cpu: {
          ...createCompatibleBuild().cpu,
          performanceScore: 40,
        } as SelectedBuildComponents['cpu'] & { performanceScore: number },
        gpu: {
          ...createCompatibleBuild().gpu,
          performanceScore: 220,
        } as SelectedBuildComponents['gpu'] & { performanceScore: number },
      }),
    );

    expect(result.warnings.join(' ')).toContain('узкое место: видеокарта значительно мощнее процессора');
  });

  it('warns about missing 12VHPWR for very power-hungry GPU', () => {
    const result = checkCompatibility(
      createCompatibleBuild({
        gpu: {
          ...createCompatibleBuild().gpu,
          name: 'GeForce RTX 4090',
          powerConsumption: 450,
          recommendedPsuWattage: 850,
        },
        psu: { ...createCompatibleBuild().psu, has12Vhpwr: false, wattage: 1000 },
      }),
    );

    expect(result.warnings.join(' ')).toContain('рекомендуется блок питания с разъёмом 12VHPWR');
  });
});
