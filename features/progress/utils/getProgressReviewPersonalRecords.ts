import type {
  ExerciseDefinition,
  WorkoutSession,
} from "../../workout/types.ts";

import {
  getExercisePersonalRecord,
} from "../../workout/utils/getExercisePersonalRecord.ts";

import type {
  ExercisePersonalRecord,
} from "../../workout/utils/getExercisePersonalRecord.ts";

import {
  isDateInProgressReviewPeriod,
} from "./getProgressReviewPeriod.ts";

import type {
  ProgressReviewPeriod,
} from "./getProgressReviewPeriod.ts";


// ============================================================
// Types
// ============================================================

export interface ProgressReviewPersonalRecord
  extends ExercisePersonalRecord {
  workoutSessionId: string;

  achievedDate: string;
}


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
// Exercise Definition Lookup
// ============================================================

function getExerciseDefinition({
  exerciseDefinitionId,
  exerciseName,
  exerciseDefinitions,
}: {
  exerciseDefinitionId?:
    string;

  exerciseName:
    string;

  exerciseDefinitions:
    ExerciseDefinition[];
}) {
  return exerciseDefinitions.find(
    (
      definition
    ) =>
      definition.id ===
        exerciseDefinitionId ||
      (
        !exerciseDefinitionId &&
        definition.name
          .trim()
          .toLowerCase() ===
          exerciseName
            .trim()
            .toLowerCase()
      )
  );
}


// ============================================================
// Period Personal Records
// ============================================================

export function getProgressReviewPersonalRecords({
  workoutHistory,
  exerciseDefinitions,
  period,
}: {
  workoutHistory:
    WorkoutSession[];

  exerciseDefinitions:
    ExerciseDefinition[];

  period:
    ProgressReviewPeriod;
}): ProgressReviewPersonalRecord[] {
  const completedWorkouts =
    workoutHistory
      .filter(
        (
          workout
        ): workout is WorkoutSession & {
          completedAt: string;
        } =>
          Boolean(
            workout.completedAt
          )
      )
      .sort(
        (
          a,
          b
        ) =>
          new Date(
            a.completedAt
          ).getTime() -
          new Date(
            b.completedAt
          ).getTime()
      );

  const previousWorkoutHistory:
    WorkoutSession[] = [];

  const personalRecords:
    ProgressReviewPersonalRecord[] = [];

  for (
    const workout
    of completedWorkouts
  ) {
    const achievedDate =
      getLocalDate(
        workout.completedAt
      );

    if (
      achievedDate >
      period.endDate
    ) {
      break;
    }

    for (
      const exercise
      of workout.exercises
    ) {
      const definition =
        getExerciseDefinition({
          exerciseDefinitionId:
            exercise
              .exerciseDefinitionId,
          exerciseName:
            exercise.name,
          exerciseDefinitions,
        });

      const personalRecord =
        getExercisePersonalRecord(
          exercise,
          previousWorkoutHistory,
          definition
        );

      if (
        personalRecord &&
        isDateInProgressReviewPeriod(
          achievedDate,
          period
        )
      ) {
        personalRecords.push({
          ...personalRecord,

          workoutSessionId:
            workout.id,

          achievedDate,
        });
      }
    }

    previousWorkoutHistory.push(
      workout
    );
  }

  return personalRecords.sort(
    (
      a,
      b
    ) =>
      b.achievedDate.localeCompare(
        a.achievedDate
      )
  );
}
