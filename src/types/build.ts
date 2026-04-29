import type {
  Cooler,
  Cpu,
  Gpu,
  Motherboard,
  PcCase,
  Psu,
  Ram,
  Storage,
} from './components';
import type { CompatibilityResult } from './compatibility';

export interface SelectedBuildComponents {
  cpu: Cpu;
  motherboard: Motherboard;
  ram: Ram;
  gpu: Gpu;
  psu: Psu;
  storage: Storage;
  pcCase: PcCase;
  cooler: Cooler;
}

export interface BuildGenerationParams {
  budget: number;
  targetResolution: 'fullhd' | 'qhd' | 'uhd';
  priority: 'performance' | 'balanced' | 'budget' | 'reliability' | 'upgrade';
  preferredBrands?: string[];
  excludedBrands?: string[];
}

export interface GeneratedBuildResult {
  components: SelectedBuildComponents;
  totalPrice: number;
  compatibilityResult: CompatibilityResult;
  performanceScore: number;
  explanation: string;
  alternatives: Partial<SelectedBuildComponents>[];
}
