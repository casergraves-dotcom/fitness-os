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

  createdAt: string;

  updatedAt: string;
}