import type {
  WorkoutSession,
} from "@/features/workout/types";

import {
  getAllExerciseProgress,
} from "./getExerciseProgress";

import {
  filterRecordsByProgressReviewPeriod,
} from "./getProgressReviewPeriod";

import type {
  ProgressReviewPeriod,
} from "./getProgressReviewPeriod";

import {
  getStrengthRetentionReview,
} from "./getStrengthRetentionReview";


// ============================================================
// Date Helpers
// ============================================================

function formatLocalDate(
  date:
    Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() +
        1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return (
    `${year}-${month}-${day}`
  );
}


function getLocalDate(
  value:
    string
) {
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return value;
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return formatLocalDate(
    date
  );
}


// ============================================================
// Period Strength Retention
// ============================================================

export function getPeriodStrengthRetentionReview({
  workoutHistory,
  period,
}: {
  workoutHistory:
    WorkoutSession[];

  period:
    ProgressReviewPeriod;
}) {
  const allExerciseProgress =
    getAllExerciseProgress(
      workoutHistory
    );

  const periodExerciseProgress =
    allExerciseProgress.map(
      (
        exercise
      ) => ({
        exerciseDefinitionId:
          exercise
            .exerciseDefinitionId,

        exerciseName:
          exercise
            .exerciseName,

        progress:
          filterRecordsByProgressReviewPeriod(
            exercise.progress,
            (
              entry
            ) =>
              getLocalDate(
                entry.date
              ),
            period
          ),
      })
    );

  return getStrengthRetentionReview(
    periodExerciseProgress
  );
}