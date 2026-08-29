import type {
  LifestyleGoalProgressEvidence,
} from "../progress/utils/getLifestyleGoalProgressEvidence";

import type {
  CoachReviewContextSummary,
} from "./types";

export function getLifestyleContextObservation(
  evidence: LifestyleGoalProgressEvidence | null
): CoachReviewContextSummary | null {
  if (!evidence) {
    return null;
  }

  const signals: string[] = [];

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

  if (signals.length === 0) {
    return null;
  }

  return {
    label: `${evidence.windowStartDate} to ${evidence.windowEndDate}`,
    message: `Available 28-day context: ${signals.join("; ")}. This describes consistency only and does not prescribe compensatory exercise or a training-load change.`,
  };
}
