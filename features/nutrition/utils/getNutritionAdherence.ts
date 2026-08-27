// ============================================================
// Imports
// ============================================================

import type {
  DailyNutritionRecord,
  NutritionTarget,
} from "../nutritionTypes";


// ============================================================
// Types
// ============================================================

export type ProteinAdherenceStatus =
  | "Met"
  | "BelowTarget"
  | "NoData";


export type CalorieAdherenceStatus =
  | "OnTarget"
  | "BelowTarget"
  | "AboveTarget"
  | "NoData";


export interface NutritionAdherence {
  date: string;

  target:
    NutritionTarget |
    null;

  record:
    DailyNutritionRecord |
    null;

  protein: {
    targetGrams?: number;

    actualGrams?: number;

    differenceGrams?: number;

    status:
      ProteinAdherenceStatus;
  };

  calories: {
    targetCalories?: number;

    actualCalories?: number;

    differenceCalories?: number;

    lowerBoundCalories?: number;

    upperBoundCalories?: number;

    status:
      CalorieAdherenceStatus;
  };
}


// ============================================================
// Constants
// ============================================================

const CALORIE_LOWER_BOUND_MULTIPLIER =
  0.9;

const CALORIE_UPPER_BOUND_MULTIPLIER =
  1.1;


// ============================================================
// Adherence
// ============================================================

export function getNutritionAdherence(
  date: string,
  target:
    NutritionTarget |
    null,
  record:
    DailyNutritionRecord |
    null
): NutritionAdherence {
  // ----------------------------------------------------------
  // Protein
  // ----------------------------------------------------------

  const proteinTarget =
    target?.proteinTargetGrams;

  const actualProtein =
    record?.proteinGrams;

  let proteinStatus:
    ProteinAdherenceStatus =
      "NoData";

  if (
    proteinTarget !==
      undefined &&
    actualProtein !==
      undefined
  ) {
    proteinStatus =
      actualProtein >=
      proteinTarget
        ? "Met"
        : "BelowTarget";
  }


  // ----------------------------------------------------------
  // Calories
  // ----------------------------------------------------------

  const calorieTarget =
    target?.calorieTarget;

  const actualCalories =
    record?.calories;

  const lowerBound =
    calorieTarget !==
    undefined
      ? Math.round(
          calorieTarget *
          CALORIE_LOWER_BOUND_MULTIPLIER
        )
      : undefined;

  const upperBound =
    calorieTarget !==
    undefined
      ? Math.round(
          calorieTarget *
          CALORIE_UPPER_BOUND_MULTIPLIER
        )
      : undefined;

  let calorieStatus:
    CalorieAdherenceStatus =
      "NoData";

  if (
    calorieTarget !==
      undefined &&
    actualCalories !==
      undefined &&
    lowerBound !==
      undefined &&
    upperBound !==
      undefined
  ) {
    if (
      actualCalories <
      lowerBound
    ) {
      calorieStatus =
        "BelowTarget";
    } else if (
      actualCalories >
      upperBound
    ) {
      calorieStatus =
        "AboveTarget";
    } else {
      calorieStatus =
        "OnTarget";
    }
  }


  // ----------------------------------------------------------
  // Result
  // ----------------------------------------------------------

  return {
    date,

    target,

    record,

    protein: {
      targetGrams:
        proteinTarget,

      actualGrams:
        actualProtein,

      differenceGrams:
        proteinTarget !==
          undefined &&
        actualProtein !==
          undefined
          ? actualProtein -
            proteinTarget
          : undefined,

      status:
        proteinStatus,
    },

    calories: {
      targetCalories:
        calorieTarget,

      actualCalories,

      differenceCalories:
        calorieTarget !==
          undefined &&
        actualCalories !==
          undefined
          ? actualCalories -
            calorieTarget
          : undefined,

      lowerBoundCalories:
        lowerBound,

      upperBoundCalories:
        upperBound,

      status:
        calorieStatus,
    },
  };
}