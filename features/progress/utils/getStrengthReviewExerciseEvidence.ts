import type {
  WorkoutSession,
} from "@/features/workout/types";

import {
  isDateInProgressReviewPeriod,
} from "./getProgressReviewPeriod";

import type {
  ProgressReviewPeriod,
} from "./getProgressReviewPeriod";


// ============================================================
// Types
// ============================================================

export interface StrengthReviewExerciseEvidence {
  exerciseDefinitionId:
    string | null;

  exerciseName: string;

  sampleCount: number;

  latestDate: string;
}


// ============================================================
// Helpers
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
    return null;
  }

  return formatLocalDate(
    date
  );
}


function normalizeExerciseName(
  exerciseName:
    string
) {
  return exerciseName
    .trim()
    .toLowerCase();
}


// ============================================================
// Strength Review Exercise Evidence
// ============================================================

export function getStrengthReviewExerciseEvidence({
  workoutHistory,
  period,
}: {
  workoutHistory:
    WorkoutSession[];

  period:
    ProgressReviewPeriod;
}): StrengthReviewExerciseEvidence[] {
  const evidenceByExercise =
    new Map<
      string,
      StrengthReviewExerciseEvidence
    >();

  for (
    const workout
    of workoutHistory
  ) {
    const workoutDate =
      getLocalDate(
        workout.completedAt ??
        workout.startedAt
      );

    if (
      !workoutDate ||
      !isDateInProgressReviewPeriod(
        workoutDate,
        period
      )
    ) {
      continue;
    }

    for (
      const exercise
      of workout.exercises
    ) {
      const hasUsablePerformance =
        exercise.sets.some(
          (
            set
          ) =>
            set.completed &&
            set.weight >
              0 &&
            set.reps >
              0
        );

      if (
        !hasUsablePerformance
      ) {
        continue;
      }

      const key =
        exercise.exerciseDefinitionId ??
        normalizeExerciseName(
          exercise.name
        );

      const existing =
        evidenceByExercise.get(
          key
        );

      if (existing) {
        evidenceByExercise.set(
          key,
          {
            ...existing,

            sampleCount:
              existing.sampleCount +
              1,

            latestDate:
              workoutDate >
              existing.latestDate
                ? workoutDate
                : existing.latestDate,
          }
        );
      } else {
        evidenceByExercise.set(
          key,
          {
            exerciseDefinitionId:
              exercise.exerciseDefinitionId ??
              null,

            exerciseName:
              exercise.name,

            sampleCount:
              1,

            latestDate:
              workoutDate,
          }
        );
      }
    }
  }

  return [
    ...evidenceByExercise.values(),
  ].sort(
    (
      a,
      b
    ) =>
      b.sampleCount -
        a.sampleCount ||
      b.latestDate.localeCompare(
        a.latestDate
      ) ||
      a.exerciseName.localeCompare(
        b.exerciseName
      )
  );
}


// ============================================================
// Preferred Strength Review Exercise
// ============================================================

export function getPreferredStrengthReviewExercise({
  workoutHistory,
  period,
}: {
  workoutHistory:
    WorkoutSession[];

  period:
    ProgressReviewPeriod;
}) {
  const strongestEvidence =
    getStrengthReviewExerciseEvidence({
      workoutHistory,
      period,
    })[0];

  return (
    strongestEvidence &&
    strongestEvidence.sampleCount >=
      2
      ? strongestEvidence
      : null
  );
}