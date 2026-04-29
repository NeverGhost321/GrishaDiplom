export interface BaseComponent {
  id: number;
  name: string;
  price: number;
}

export interface Cpu extends BaseComponent {
  brand: string;
  socket: string;
  cores: number;
  threads: number;
  baseClockGhz: number;
  boostClockGhz: number;
  tdp: number;
  integratedGraphics: boolean;
  generation: string;
}

export interface Motherboard extends BaseComponent {
  socket: string;
  chipset: string;
  supportedCpuGenerations: string;
  memoryType: string;
  maxRamGb: number;
  maxRamFrequency: number;
  ramSlots: number;
  pcieVersion: string;
  m2Slots: number;
  sataPorts: number;
  formFactor: string;
  vrmQualityScore: number;
  biosVersion: string;
}

export interface Ram extends BaseComponent {
  memoryType: string;
  capacityGb: number;
  sticks: number;
  frequencyMhz: number;
  cl: number;
  voltage: number;
  rgb: boolean;
}

export interface Gpu extends BaseComponent {
  brand: string;
  chipset: string;
  vramGb: number;
  lengthMm: number;
  powerConsumption: number;
  recommendedPsuWattage: number;
  pcieInterface: string;
}

export interface Psu extends BaseComponent {
  wattage: number;
  efficiencyRating: string;
  has12Vhpwr: boolean;
  pcie8PinCount: number;
  atxVersion: string;
  modular: boolean;
}

export interface Storage extends BaseComponent {
  type: string;
  interface: string;
  capacityGb: number;
  readSpeedMBs: number;
  writeSpeedMBs: number;
  formFactor: string;
}

export interface PcCase extends BaseComponent {
  formFactor: string;
  supportedMotherboardFormFactors: string;
  maxGpuLengthMm: number;
  maxCpuCoolerHeightMm: number;
  radiatorSupport: string;
  fanCountIncluded: number;
  airflowScore: number;
}

export interface Cooler extends BaseComponent {
  type: string;
  supportedSockets: string;
  tdpRatingWatts: number;
  heightMm: number;
  radiatorSizeMm: number;
  noiseLevelDb: number;
}

export type ComponentCategory =
  | 'cpu'
  | 'motherboard'
  | 'ram'
  | 'gpu'
  | 'psu'
  | 'storage'
  | 'case'
  | 'cooler';

export type AnyComponent =
  | Cpu
  | Motherboard
  | Ram
  | Gpu
  | Psu
  | Storage
  | PcCase
  | Cooler;
