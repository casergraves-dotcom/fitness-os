// ============================================================
// Nutrition Targets
// ============================================================

export interface NutritionTarget {
  id: string;

  effectiveDate: string;

  calorieTarget?: number;

  proteinTargetGrams?: number;

  notes?: string;

  createdAt: string;

  updatedAt: string;
}


// ============================================================
// Daily Nutrition
// ============================================================

export interface DailyNutritionRecord {
  id: string;

  date: string;

  calories?: number;

  proteinGrams?: number;

  notes?: string;

  confirmedAt?: string;

  createdAt: string;

  updatedAt: string;
}

// ============================================================
// Resting Metabolic Rate Records
// ============================================================

export type MetabolicRateSource =
  | "IndirectCalorimetry"
  | "ProviderEstimate"
  | "ManualEstimate";

export interface MetabolicRateRecord {
  id: string;

  measuredDate: string;

  restingCalories: number;

  source: MetabolicRateSource;

  weightLb?: number;

  notes?: string;

  createdAt: string;

  updatedAt: string;
}
