import type { WeeklyProgressionDecisionRecord } from "../workout/types";
import type { WeeklyProgressionDecisionDriver } from "../workout/types";
import type { TrainingActivityType } from "../workout/types";

export type WeeklyRepeatLevel =
  | "FirstRepeat"
  | "SecondRepeat"
  | "PersistentRepeat";

export interface WeeklyRecurringBlocker {
  activityId: string;
  label: string;
  type: TrainingActivityType;
}

export interface WeeklyDecisionPattern {
  label: string;
  message: string;
  consecutiveReviewCount: number;
  finalShouldAdvance: boolean;
  limitingDriver?: WeeklyProgressionDecisionDriver;
  programWeekId?: string;
  repeatedProgramWeekCount?: number;
  repeatLevel?: WeeklyRepeatLevel;
  recurringBlocker?: WeeklyRecurringBlocker;
  intentionalRepeat?: boolean;
}

function getRepeatLevel(count: number): WeeklyRepeatLevel {
  if (count >= 3) return "PersistentRepeat";
  if (count === 2) return "SecondRepeat";
  return "FirstRepeat";
}

function getRecurringBlocker(
  decisions: WeeklyProgressionDecisionRecord[]
): WeeklyRecurringBlocker | undefined {
  if (
    decisions.some(
      (decision) =>
        decision.manuallyOverridden ||
        !decision.missedRequiredActivities?.length
    )
  ) {
    return undefined;
  }

  const latestActivities =
    decisions[0].missedRequiredActivities ?? [];

  const recurring = latestActivities.find((activity) =>
    decisions.every((decision) =>
      decision.missedRequiredActivities?.some(
        (candidate) => candidate.activityId === activity.activityId
      )
    )
  );

  return recurring
    ? {
        activityId: recurring.activityId,
        label: recurring.label,
        type: recurring.type,
      }
    : undefined;
}

export function getWeeklyDecisionPattern(
  decisions: WeeklyProgressionDecisionRecord[]
): WeeklyDecisionPattern | null {
  const ordered = decisions
    .slice()
    .sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate));
  const latest = ordered[0];

  if (!latest) return null;

  if (!latest.finalShouldAdvance && latest.programWeekId) {
    const firstDifferentPhaseIndex = ordered.findIndex(
      (decision) =>
        decision.finalShouldAdvance ||
        decision.programWeekId !== latest.programWeekId
    );
    const repeatedProgramWeekCount =
      firstDifferentPhaseIndex === -1
        ? ordered.length
        : firstDifferentPhaseIndex;
    const matchingDecisions = ordered.slice(0, repeatedProgramWeekCount);
    const intentionalRepeat =
      latest.manuallyOverridden &&
      latest.automaticShouldAdvance;
    const limitingDriver = matchingDecisions.every(
      (decision) =>
        !decision.manuallyOverridden &&
        decision.automaticDriver !== undefined &&
        decision.automaticDriver === latest.automaticDriver
    )
      ? latest.automaticDriver
      : undefined;
    const recurringBlocker = getRecurringBlocker(matchingDecisions);
    const repeatLevel = getRepeatLevel(repeatedProgramWeekCount);
    const phaseLabel = latest.programWeekName
      ? `${latest.programWeekName} (Week ${latest.programWeekNumber ?? "?"})`
      : `program week ${latest.programWeekNumber ?? ""}`.trim();
    const blockerMessage = recurringBlocker
      ? ` ${recurringBlocker.label} was incomplete in each review.`
      : "";

    return {
      label:
        repeatLevel === "FirstRepeat"
          ? "First repeat"
          : repeatLevel === "SecondRepeat"
            ? "Second repeat"
            : `${repeatedProgramWeekCount} repeats`,
      message: intentionalRepeat
        ? `${phaseLabel} is repeating by choice. Coach will preserve the decision without treating it as an automatic training failure.`
        : `${phaseLabel} has been held ${repeatedProgramWeekCount} time${repeatedProgramWeekCount === 1 ? "" : "s"}.${blockerMessage}`,
      consecutiveReviewCount: repeatedProgramWeekCount,
      finalShouldAdvance: false,
      limitingDriver,
      programWeekId: latest.programWeekId,
      repeatedProgramWeekCount,
      repeatLevel,
      recurringBlocker,
      intentionalRepeat,
    };
  }

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
