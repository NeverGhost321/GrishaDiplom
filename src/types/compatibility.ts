export interface CompatibilityResult {
  isCompatible: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  totalPowerConsumption: number;
  requiredPsuWattage: number;
  totalPrice: number;
  compatibilityScore: number;
}
