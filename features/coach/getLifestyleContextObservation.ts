import type {
  LifestyleGoalProgressEvidence,
} from "../progress/utils/getLifestyleGoalProgressEvidence";
import {
  getLifestyleGoalProgressPatterns,
} from "../progress/utils/getLifestyleGoalProgressPatterns.ts";
import {
  getAdaptiveNutritionTargetFeedback,
} from "../progress/utils/getAdaptiveNutritionTargetFeedback.ts";

import type {
  CoachReviewContextSummary,
} from "./types";

function formatWeightRate(rate: number) {
  const magnitude = Math.abs(rate).toFixed(1);

  if (rate < -0.05) {
    return `${magnitude} lb/week loss`;
  }

  if (rate > 0.05) {
    return `${magnitude} lb/week gain`;
  }

  return "approximately stable weight";
}

export function getLifestyleContextObservation(
  evidence: LifestyleGoalProgressEvidence | null
): CoachReviewContextSummary | null {
  if (!evidence) {
    return null;
  }

  const signals: string[] = [];
  const interpretation =
    getLifestyleGoalProgressPatterns(evidence);
  const adaptiveNutrition =
    getAdaptiveNutritionTargetFeedback(evidence);

  if (
    evidence.nutrition.protein.evidenceReady &&
    evidence.nutrition.protein.adherencePercent !== undefined
  ) {
    signals.push(
      `protein target met on ${evidence.nutrition.protein.adherencePercent}% of logged eligible days`
    );
  }

  if (
    evidence.nutrition.calories.evidenceReady &&
    evidence.nutrition.calories.adherencePercent !== undefined
  ) {
    signals.push(
      `calorie target range met on ${evidence.nutrition.calories.adherencePercent}% of logged eligible days`
    );
  }

  if (
    evidence.activity.steps.evidenceReady &&
    evidence.activity.steps.adherencePercent !== undefined
  ) {
    signals.push(
      `step target met on ${evidence.activity.steps.adherencePercent}% of logged eligible days`
    );
  }

  if (!interpretation.evidenceReady) {
    const missingEvidence =
      interpretation.insufficientEvidenceReasons.join(" ");

    return {
      label: "Still learning",
      message:
        signals.length > 0
          ? `Available 28-day consistency: ${signals.join("; ")}. Fitness OS cannot yet determine why progress is faster or slower than expected. ${missingEvidence}`
          : `Fitness OS cannot yet determine why progress is faster or slower than expected. ${missingEvidence}`,
    };
  }

  if (signals.length === 0) {
    return {
      label: "Still learning",
      message:
        "The available history does not yet contain a reliable lifestyle signal that explains progress. Keep logging normally; no target or training change is recommended from this evidence.",
    };
  }

  let nutritionFeedback =
    "The available evidence describes consistency only; no calorie-target adjustment is recommended yet.";

  if (adaptiveNutrition.status === "NoAdjustmentRecommended") {
    nutritionFeedback =
      `Average logged intake was ${Math.round(adaptiveNutrition.averageActualCalories)} cal/day. ` +
      `Observed ${formatWeightRate(adaptiveNutrition.observedWeeklyWeightChangeLb)} is reasonably close to the expected ${formatWeightRate(adaptiveNutrition.expectedWeeklyWeightChangeLb)}, so no calorie-target adjustment is recommended.`;
  }

  if (adaptiveNutrition.status === "ReviewSuggested") {
    const direction =
      adaptiveNutrition.adjustmentDirection === "Increase"
        ? "increase"
        : "decrease";

    nutritionFeedback =
      `Average logged intake was ${Math.round(adaptiveNutrition.averageActualCalories)} cal/day. ` +
      `Observed ${formatWeightRate(adaptiveNutrition.observedWeeklyWeightChangeLb)} differs from the expected ${formatWeightRate(adaptiveNutrition.expectedWeeklyWeightChangeLb)}. ` +
      `If this pattern persists, review a roughly ${adaptiveNutrition.suggestedAdjustmentCalories} cal/day ${direction}; any target change requires confirmation.`;
  }

  return {
    label: `${evidence.windowStartDate} to ${evidence.windowEndDate}`,
    message: `Available 28-day context: ${signals.join("; ")}. ${nutritionFeedback} This does not prescribe compensatory exercise or a training-load change.`,
  };
}
