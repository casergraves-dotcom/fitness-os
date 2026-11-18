import type {
  WeeklyProgressionDomainOutcome,
  WeeklyProgressionDomainOutcomes,
} from "@/features/workout/types";

export function getDomainProgressionStatusLabel(
  outcome: WeeklyProgressionDomainOutcome
) {
  switch (outcome.status) {
    case "Progress":
      return "Ready to progress";
    case "Maintain":
      return "Maintain current level";
    case "InsufficientEvidence":
      return "More evidence needed";
    case "NotScheduled":
      return "Not scheduled";
  }
}

export function getSplitProgressionSummary(
  outcomes: WeeklyProgressionDomainOutcomes,
  overallAdvanced: boolean
) {
  if (
    !overallAdvanced &&
    outcomes.strength.status === "Progress" &&
    outcomes.cardio.status !== "Progress"
  ) {
    return "Strength progression evidence remains valid while cardio stays at its current level. Repeating the overall phase does not erase exercise-specific strength progress.";
  }

  if (
    !overallAdvanced &&
    outcomes.cardio.status === "Progress" &&
    outcomes.strength.status !== "Progress"
  ) {
    return "Cardio progression evidence remains valid while strength stays at its current level. Repeating the overall phase does not erase earned run progression.";
  }

  return null;
}
