import type { TrainingActivityCompletion } from "../types";
import type { ResolvedWeeklyActivityOccurrence } from "./getResolvedWeeklyActivityOccurrences";
import type { ScheduleConflict } from "./evaluateScheduleConflicts";

export interface ReviewMoveCandidate {
  occurrence: ResolvedWeeklyActivityOccurrence;
  date: string;
}

// Review only movable, unfinished work and never suggest a date before today.
export function getReviewMoveCandidates(
  conflicts: ScheduleConflict[],
  occurrences: ResolvedWeeklyActivityOccurrence[],
  completions: TrainingActivityCompletion[],
  weekDates: string[],
  reviewDate: string,
): ReviewMoveCandidate[] {
  const seen = new Set<string>();
  return conflicts.flatMap((conflict) =>
    [conflict.first, conflict.second].flatMap((side) => {
      const occurrence = occurrences.find((item) =>
        item.activity.id === side.activity.id && item.date === side.date
      );
      if (!occurrence || occurrence.placementSource === "FixedAerialCommitment" ||
        completions.some((completion) =>
          completion.trainingActivityId === occurrence.activity.id && completion.date === occurrence.date
        )) return [];

      return weekDates.filter((date) => date >= reviewDate && date !== occurrence.date)
        .flatMap((date) => {
          const key = `${occurrence.activity.id}|${occurrence.originalDate}|${date}`;
          if (seen.has(key)) return [];
          seen.add(key);
          return [{ occurrence, date }];
        });
    }),
  );
}
