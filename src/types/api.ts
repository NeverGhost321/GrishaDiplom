import type { BuildGenerationParams, SelectedBuildComponents } from './build';
import type { CompatibilityResult } from './compatibility';

export type AutoBuildPriority = BuildGenerationParams['priority'];
export type AutoBuildResolution = BuildGenerationParams['targetResolution'];


export type CatalogCategory =
  | 'cpus'
  | 'motherboards'
  | 'rams'
  | 'gpus'
  | 'psus'
  | 'storages'
  | 'cases'
  | 'coolers';

export interface CatalogFilters {
  search: string;
  manufacturer: string;
  sort: 'price_asc' | 'price_desc' | 'manufacturer_asc';
  minPrice: string;
  maxPrice: string;
}

export interface ComponentsApiResponse<T> {
  items: T[];
  count: number;
  error?: string;
}

export interface SelectedIds {
  cpuId: number | null;
  motherboardId: number | null;
  ramId: number | null;
  gpuId: number | null;
  psuId: number | null;
  storageId: number | null;
  caseId: number | null;
  coolerId: number | null;
}

export interface CompatibilityCheckApiSuccessResponse {
  result: CompatibilityResult;
}

export interface CompatibilityCheckApiErrorResponse {
  error: string;
  details?: string[];
}

export type CompatibilityCheckApiResponse = CompatibilityCheckApiSuccessResponse | CompatibilityCheckApiErrorResponse;

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
