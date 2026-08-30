import type {
  LifestyleGoalProgressEvidence,
} from "./getLifestyleGoalProgressEvidence";

export type AdaptiveNutritionTargetFeedback =
  | {
      status: "InsufficientEvidence";
    }
  | {
      status: "NoAdjustmentRecommended";
      averageActualCalories: number;
      averageTargetCalories: number;
      observedWeeklyWeightChangeLb: number;
      expectedWeeklyWeightChangeLb: number;
    }
  | {
      status: "ReviewSuggested";
      averageActualCalories: number;
      averageTargetCalories: number;
      observedWeeklyWeightChangeLb: number;
      expectedWeeklyWeightChangeLb: number;
      adjustmentDirection: "Increase" | "Decrease";
      suggestedAdjustmentCalories: number;
    };

function roundTo(value: number, increment: number) {
  return Math.round(value / increment) * increment;
}

export function getAdaptiveNutritionTargetFeedback(
  evidence: LifestyleGoalProgressEvidence
): AdaptiveNutritionTargetFeedback {
  const calories = evidence.nutrition.calories;
  const bodyComposition = evidence.bodyComposition;
  const observed = bodyComposition.observedWeeklyWeightChangeLb;
  const expected = bodyComposition.expectedWeeklyWeightChangeLb;

  if (
    !calories.evidenceReady ||
    !bodyComposition.evidenceReady ||
    calories.averageActualCalories === undefined ||
    calories.averageTargetCalories === undefined ||
    observed === undefined ||
    expected === undefined ||
    (bodyComposition.observedTrendDays ?? 0) < 21
  ) {
    return { status: "InsufficientEvidence" };
  }

  const rateDifference = observed - expected;
  const tolerance = Math.max(0.25, Math.abs(expected) * 0.35);

  if (Math.abs(rateDifference) <= tolerance) {
    return {
      status: "NoAdjustmentRecommended",
      averageActualCalories: calories.averageActualCalories,
      averageTargetCalories: calories.averageTargetCalories,
      observedWeeklyWeightChangeLb: observed,
      expectedWeeklyWeightChangeLb: expected,
    };
  }

  return {
    status: "ReviewSuggested",
    averageActualCalories: calories.averageActualCalories,
    averageTargetCalories: calories.averageTargetCalories,
    observedWeeklyWeightChangeLb: observed,
    expectedWeeklyWeightChangeLb: expected,
    adjustmentDirection: rateDifference > 0 ? "Decrease" : "Increase",
    suggestedAdjustmentCalories: Math.min(
      250,
      Math.max(100, roundTo(Math.abs(rateDifference) * 500, 50))
    ),
  };
}
