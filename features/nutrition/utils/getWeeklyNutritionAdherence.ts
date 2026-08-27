// ============================================================
// Imports
// ============================================================

import type {
  NutritionAdherence,
} from "./getNutritionAdherence";


// ============================================================
// Types
// ============================================================

export interface WeeklyNutritionAdherence {
  daysEvaluated: number;

  protein: {
    daysWithTarget: number;

    daysLogged: number;

    daysMet: number;

    daysBelowTarget: number;

    daysMetPercent?: number;

    averageIntakePercent?: number;

    dataCoveragePercent?: number;
  };

  calories: {
    daysWithTarget: number;

    daysLogged: number;

    daysOnTarget: number;

    daysBelowTarget: number;

    daysAboveTarget: number;

    daysOnTargetPercent?: number;

    averageIntakePercent?: number;

    dataCoveragePercent?: number;
  };
}


// ============================================================
// Weekly Aggregation
// ============================================================

export function getWeeklyNutritionAdherence(
  dailyAdherence:
    NutritionAdherence[]
): WeeklyNutritionAdherence {
  // ----------------------------------------------------------
  // Protein
  // ----------------------------------------------------------

  const proteinDaysWithTarget =
    dailyAdherence.filter(
      (
        day
      ) =>
        day.protein.targetGrams !==
        undefined
    ).length;

  const proteinLogged =
    dailyAdherence.filter(
      (
        day
      ) =>
        day.protein.targetGrams !==
          undefined &&
        day.protein.actualGrams !==
          undefined
    );

  const proteinDaysMet =
    proteinLogged.filter(
      (
        day
      ) =>
        day.protein.status ===
        "Met"
    ).length;

  const proteinDaysBelowTarget =
    proteinLogged.filter(
      (
        day
      ) =>
        day.protein.status ===
        "BelowTarget"
    ).length;

  const proteinDaysMetPercent =
    proteinLogged.length >
    0
      ? Math.round(
          (
            proteinDaysMet /
            proteinLogged.length
          ) *
            100
        )
      : undefined;

  const proteinAverageIntakePercent =
    proteinLogged.length >
    0
      ? Math.round(
          (
            proteinLogged.reduce(
              (
                total,
                day
              ) => {
                const target =
                  day.protein.targetGrams;

                const actual =
                  day.protein.actualGrams;

                if (
                  target ===
                    undefined ||
                  actual ===
                    undefined ||
                  target <=
                    0
                ) {
                  return total;
                }

                return (
                  total +
                  actual /
                    target
                );
              },
              0
            ) /
            proteinLogged.length
          ) *
            100
        )
      : undefined;


  // ----------------------------------------------------------
  // Calories
  // ----------------------------------------------------------

  const calorieDaysWithTarget =
    dailyAdherence.filter(
      (
        day
      ) =>
        day.calories.targetCalories !==
        undefined
    ).length;

  const caloriesLogged =
    dailyAdherence.filter(
      (
        day
      ) =>
        day.calories.targetCalories !==
          undefined &&
        day.calories.actualCalories !==
          undefined
    );

  const calorieDaysOnTarget =
    caloriesLogged.filter(
      (
        day
      ) =>
        day.calories.status ===
        "OnTarget"
    ).length;

  const calorieDaysBelowTarget =
    caloriesLogged.filter(
      (
        day
      ) =>
        day.calories.status ===
        "BelowTarget"
    ).length;

  const calorieDaysAboveTarget =
    caloriesLogged.filter(
      (
        day
      ) =>
        day.calories.status ===
        "AboveTarget"
    ).length;

  const calorieDaysOnTargetPercent =
    caloriesLogged.length >
    0
      ? Math.round(
          (
            calorieDaysOnTarget /
            caloriesLogged.length
          ) *
            100
        )
      : undefined;

  const calorieAverageIntakePercent =
    caloriesLogged.length >
    0
      ? Math.round(
          (
            caloriesLogged.reduce(
              (
                total,
                day
              ) => {
                const target =
                  day.calories.targetCalories;

                const actual =
                  day.calories.actualCalories;

                if (
                  target ===
                    undefined ||
                  actual ===
                    undefined ||
                  target <=
                    0
                ) {
                  return total;
                }

                return (
                  total +
                  actual /
                    target
                );
              },
              0
            ) /
            caloriesLogged.length
          ) *
            100
        )
      : undefined;


  // ----------------------------------------------------------
  // Result
  // ----------------------------------------------------------

  return {
    daysEvaluated:
      dailyAdherence.length,

    protein: {
      daysWithTarget:
        proteinDaysWithTarget,

      daysLogged:
        proteinLogged.length,

      daysMet:
        proteinDaysMet,

      daysBelowTarget:
        proteinDaysBelowTarget,

      daysMetPercent:
        proteinDaysMetPercent,

      averageIntakePercent:
        proteinAverageIntakePercent,

      dataCoveragePercent:
        proteinDaysWithTarget >
        0
          ? Math.round(
              (
                proteinLogged.length /
                proteinDaysWithTarget
              ) *
                100
            )
          : undefined,
    },

    calories: {
      daysWithTarget:
        calorieDaysWithTarget,

      daysLogged:
        caloriesLogged.length,

      daysOnTarget:
        calorieDaysOnTarget,

      daysBelowTarget:
        calorieDaysBelowTarget,

      daysAboveTarget:
        calorieDaysAboveTarget,

      daysOnTargetPercent:
        calorieDaysOnTargetPercent,

      averageIntakePercent:
        calorieAverageIntakePercent,

      dataCoveragePercent:
        calorieDaysWithTarget >
        0
          ? Math.round(
              (
                caloriesLogged.length /
                calorieDaysWithTarget
              ) *
                100
            )
          : undefined,
    },
  };
}