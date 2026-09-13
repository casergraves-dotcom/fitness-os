import type { TrainingActivityCompletion } from "../types";
import type { ResolvedWeeklyActivityOccurrence } from "./getResolvedWeeklyActivityOccurrences";

export interface DaySwapTargets {
  targets: ResolvedWeeklyActivityOccurrence[];
  blockedBy: "Completed" | "FixedCommitment" | null;
}

// A grouped swap must exchange the whole movable day, never only the
// unfinished/flexible subset while silently leaving another activity behind.
export function getDaySwapTargets(
  occurrences: ResolvedWeeklyActivityOccurrence[],
  date: string,
  movingOccurrence: ResolvedWeeklyActivityOccurrence,
  completions: TrainingActivityCompletion[],
): DaySwapTargets {
  const targets = occurrences.filter((occurrence) =>
    occurrence.date === date && occurrence.activity.type !== "Rest" &&
    !(occurrence.activity.id === movingOccurrence.activity.id &&
      occurrence.originalDate === movingOccurrence.originalDate)
  );

  if (targets.some((occurrence) =>
    completions.some((completion) =>
      completion.trainingActivityId === occurrence.activity.id &&
      completion.date === occurrence.date
    )
  )) return { targets: [], blockedBy: "Completed" };

  if (targets.some((occurrence) => occurrence.placementSource === "FixedAerialCommitment")) {
    return { targets: [], blockedBy: "FixedCommitment" };
  }

  return { targets, blockedBy: null };
}
