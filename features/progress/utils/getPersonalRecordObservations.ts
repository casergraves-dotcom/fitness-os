import type {
  LongTermProgressReviewObservation,
} from "./getLongTermProgressReview";

import type {
  ProgressReviewPersonalRecord,
} from "./getProgressReviewPersonalRecords";

export function getPersonalRecordObservations(
  personalRecords: ProgressReviewPersonalRecord[]
): LongTermProgressReviewObservation[] {
  const representedExercises =
    new Set<string>();

  return [...personalRecords]
    .sort(
      (a, b) =>
        b.achievedDate.localeCompare(
          a.achievedDate
        )
    )
    .filter((record) => {
      const exerciseKey =
        record.exerciseName
          .trim()
          .toLowerCase();

      if (
        representedExercises.has(
          exerciseKey
        )
      ) {
        return false;
      }

      representedExercises.add(
        exerciseKey
      );

      return true;
    })
    .slice(0, 3)
    .map((record) => ({
      type: "PersonalRecord",
      message:
        `${record.exerciseName} reached a new estimated 1RM of ${record.estimatedOneRepMax} lb on ${record.achievedDate}, improving the previous best by ${record.improvement} lb.`,
    }));
}
