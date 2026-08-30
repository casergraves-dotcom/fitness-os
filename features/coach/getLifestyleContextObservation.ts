import type {
  LifestyleGoalProgressEvidence,
} from "../progress/utils/getLifestyleGoalProgressEvidence";
import {
  getLifestyleGoalProgressPatterns,
} from "../progress/utils/getLifestyleGoalProgressPatterns.ts";

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
  const interpretation =
    getLifestyleGoalProgressPatterns(evidence);

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

  return {
    label: `${evidence.windowStartDate} to ${evidence.windowEndDate}`,
    message: `Available 28-day context: ${signals.join("; ")}. This describes consistency only and does not prescribe compensatory exercise or a training-load change.`,
  };
}
