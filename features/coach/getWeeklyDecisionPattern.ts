import type { WeeklyProgressionDecisionRecord } from "../workout/types";
import type { WeeklyProgressionDecisionDriver } from "../workout/types";

export interface WeeklyDecisionPattern {
  label: string;
  message: string;
  consecutiveReviewCount: number;
  finalShouldAdvance: boolean;
  limitingDriver?: WeeklyProgressionDecisionDriver;
}

export function getWeeklyDecisionPattern(
  decisions: WeeklyProgressionDecisionRecord[]
): WeeklyDecisionPattern | null {
  const ordered = decisions
    .slice()
    .sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate));
  const latest = ordered[0];

  if (!latest) return null;

  const firstDifferentIndex = ordered.findIndex(
    (decision) => decision.finalShouldAdvance !== latest.finalShouldAdvance
  );
  const matchingCount =
    firstDifferentIndex === -1 ? ordered.length : firstDifferentIndex;

  if (matchingCount < 2) return null;

  const outcome = latest.finalShouldAdvance ? "advanced" : "was held";
  const matchingDecisions = ordered.slice(0, matchingCount);
  const limitingDriver =
    matchingDecisions.every(
      (decision) =>
        !decision.manuallyOverridden &&
        decision.automaticDriver !== undefined &&
        decision.automaticDriver === latest.automaticDriver
    )
      ? latest.automaticDriver
      : undefined;

  return {
    label: `${matchingCount} consecutive completed reviews`,
    message: `The training plan ${outcome} after each of the last ${matchingCount} weekly reviews. This is historical context, not a reason to override today's schedule or recovery guidance.`,
    consecutiveReviewCount: matchingCount,
    finalShouldAdvance: latest.finalShouldAdvance,
    limitingDriver,
  };
}
