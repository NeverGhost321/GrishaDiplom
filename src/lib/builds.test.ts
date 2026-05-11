import { describe, expect, it } from 'vitest';
import { checkCompatibility } from '../services/compatibility.service';
import { mapComponentsByRecords } from './builds';

describe('build mappers', () => {
  it('normalizes Prisma component fields before compatibility checks and saving', () => {
    const components = mapComponentsByRecords({
      cpu: {
        id: 1,
        model: 'Ryzen 5 7600',
        brand: 'AMD',
        socket: 'AM5',
        cores: 6,
        threads: 12,
        baseClockGhz: 3.8,
        boostClockGhz: 5.1,
        tdpWatts: 65,
        integratedGraphics: true,
        generation: 'Ryzen 7000',
        price: 22000,
      },
      motherboard: {
        id: 2,
        model: 'B650 ATX',
        socket: 'AM5',
        chipset: 'B650',
        supportedCpuGenerations: 'Ryzen 7000',
        memoryType: 'DDR5',
        maxRamGb: 128,
        maxRamFrequency: 6400,
        ramSlots: 4,
        pcieVersion: 'PCIe 4.0',
        m2Slots: 2,
        sataPorts: 4,
        formFactor: 'ATX',
        vrmQualityScore: 80,
        biosVersion: 'stable',
        price: 16000,
      },
      ram: {
        id: 3,
        model: '32GB DDR5',
        memoryType: 'DDR5',
        capacityGb: 32,
        sticks: 2,
        frequencyMhz: 5600,
        cl: 36,
        voltage: 1.25,
        rgb: false,
        price: 10000,
      },
      gpu: {
        id: 4,
        model: 'RTX 4070',
        brand: 'NVIDIA',
        chipset: 'AD104',
        vramGb: 12,
        lengthMm: 280,
        powerDrawWatts: 200,
        recommendedPsuWatts: 650,
        pcieInterface: 'PCIe 4.0',
        price: 54000,
      },
      psu: {
        id: 5,
        model: '750W Gold',
        wattage: 750,
        efficiencyRating: '80+ Gold',
        has12Vhpwr: true,
        pcie8PinCount: 4,
        atxVersion: 'ATX 3.0',
        modular: true,
        price: 8000,
      },
      storage: {
        id: 6,
        model: '1TB NVMe',
        type: 'SSD',
        interface: 'NVMe PCIe 4.0',
        capacityGb: 1000,
        readSpeedMBs: 5000,
        writeSpeedMBs: 4000,
        formFactor: 'M.2',
        price: 6000,
      },
      pcCase: {
        id: 7,
        model: 'ATX Airflow',
        formFactor: 'Mid Tower',
        supportedMotherboardFormFactors: 'ATX, mATX',
        maxGpuLengthMm: 320,
        maxCpuCoolerHeightMm: 165,
        radiatorSupport: '240',
        fanCountIncluded: 3,
        airflowScore: 80,
        price: 5000,
      },
      cooler: {
        id: 8,
        model: 'Tower 180W',
        type: 'Air',
        supportedSockets: 'AM5, LGA1700',
        tdpRatingWatts: 180,
        heightMm: 155,
        radiatorSizeMm: 0,
        noiseLevelDb: 28,
        price: 3000,
      },
    });

    expect(components.cpu.name).toBe('Ryzen 5 7600');
    expect(components.cpu.tdp).toBe(65);
    expect(components.gpu.name).toBe('RTX 4070');
    expect(components.gpu.powerConsumption).toBe(200);
    expect(components.gpu.recommendedPsuWattage).toBe(650);

    const compatibilityResult = checkCompatibility(components);
    expect(compatibilityResult.isCompatible).toBe(true);
    expect(compatibilityResult.totalPowerConsumption).toBeGreaterThan(0);
    expect(compatibilityResult.requiredPsuWattage).toBeGreaterThan(0);
    expect(compatibilityResult.totalPrice).toBe(124000);
  });
});
