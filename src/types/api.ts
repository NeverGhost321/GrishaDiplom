import type { BuildGenerationParams, SelectedBuildComponents } from './build';
import type { CompatibilityResult } from './compatibility';

export type AutoBuildPriority = BuildGenerationParams['priority'];
export type AutoBuildResolution = BuildGenerationParams['targetResolution'];

export interface ComponentSummary {
  type: keyof SelectedBuildComponents;
  id: number;
  brand?: string;
  name: string;
  price: number;
  specs: Array<{ label: string; value: string | number | boolean }>;
}

export interface AutoBuildResult {
  components: SelectedBuildComponents;
  totalPrice: number;
  compatibilityResult: CompatibilityResult;
  performanceScore: number;
  explanation: string;
  alternatives: Partial<SelectedBuildComponents>[];
}

export interface AutoBuildApiSuccessResponse {
  result: AutoBuildResult;
}

export interface AutoBuildApiErrorResponse {
  error: string;
  details?: string[];
  recommendations?: string[];
}

export type AutoBuildApiResponse = AutoBuildApiSuccessResponse | AutoBuildApiErrorResponse;
