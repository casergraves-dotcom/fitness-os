import type {
  ExerciseProgressEntry,
} from "../hooks/useExerciseProgress";

import {
  getStrengthProgressTrend,
} from "./getStrengthProgressTrend";

import type {
  StrengthProgressTrend,
} from "./getStrengthProgressTrend";


// ============================================================
// Types
// ============================================================

export type StrengthRetentionReviewStatus =
  | "InsufficientData"
  | "Improving"
  | "Maintained"
  | "Mixed"
  | "Declining";


export interface StrengthRetentionExerciseReview {
  exerciseDefinitionId:
    string | null;

  exerciseName: string;

  trend:
    StrengthProgressTrend;
}


export interface StrengthRetentionReview {
  status:
    StrengthRetentionReviewStatus;

  evaluatedExerciseCount: number;

  improvingExerciseCount: number;

  maintainedExerciseCount: number;

  decliningExerciseCount: number;

  insufficientExerciseCount: number;

  exercises:
    StrengthRetentionExerciseReview[];

  message: string;
}


// ============================================================
// Strength Retention Review
// ============================================================

export function getStrengthRetentionReview(
  exerciseProgress:
    Array<{
      exerciseDefinitionId:
        string | null;

      exerciseName: string;

      progress:
        ExerciseProgressEntry[];
    }>
): StrengthRetentionReview {
  const exercises =
    exerciseProgress
      .map(
        (
          exercise
        ) => ({
          exerciseDefinitionId:
            exercise
              .exerciseDefinitionId,

          exerciseName:
            exercise
              .exerciseName,

          trend:
            getStrengthProgressTrend(
              exercise.progress
            ),
        })
      )
      .sort(
        (
          a,
          b
        ) =>
          a.exerciseName.localeCompare(
            b.exerciseName
          )
      );

  const improvingExerciseCount =
    exercises.filter(
      (
        exercise
      ) =>
        exercise.trend.status ===
        "Improving"
    ).length;

  const maintainedExerciseCount =
    exercises.filter(
      (
        exercise
      ) =>
        exercise.trend.status ===
        "Maintained"
    ).length;

  const decliningExerciseCount =
    exercises.filter(
      (
        exercise
      ) =>
        exercise.trend.status ===
        "Declining"
    ).length;

  const insufficientExerciseCount =
    exercises.filter(
      (
        exercise
      ) =>
        exercise.trend.status ===
        "InsufficientData"
    ).length;

  const evaluatedExerciseCount =
    exercises.length -
    insufficientExerciseCount;


  // ----------------------------------------------------------
  // Insufficient Evidence
  // ----------------------------------------------------------

  if (
    evaluatedExerciseCount ===
    0
  ) {
    return {
      status:
        "InsufficientData",

      evaluatedExerciseCount,

      improvingExerciseCount,

      maintainedExerciseCount,

      decliningExerciseCount,

      insufficientExerciseCount,

      exercises,

      message:
        "More repeated exercise performances are needed within the review period before whole-program strength retention can be evaluated.",
    };
  }


  // ----------------------------------------------------------
  // Aggregate Status
  // ----------------------------------------------------------

  let status:
    StrengthRetentionReviewStatus;

  if (
    decliningExerciseCount ===
    evaluatedExerciseCount
  ) {
    status =
      "Declining";
  } else if (
    decliningExerciseCount >
      0
  ) {
    status =
      "Mixed";
  } else if (
    improvingExerciseCount >
      0
  ) {
    status =
      "Improving";
  } else {
    status =
      "Maintained";
  }


  // ----------------------------------------------------------
  // Message
  // ----------------------------------------------------------

  let message: string;

  switch (
    status
  ) {
    case "Improving":
      message =
        `Strength improved for ${improvingExerciseCount} exercise${improvingExerciseCount === 1 ? "" : "s"} and was maintained for the remaining evaluated exercises during the review period.`;
      break;

    case "Maintained":
      message =
        `Strength was maintained across ${maintainedExerciseCount} evaluated exercise${maintainedExerciseCount === 1 ? "" : "s"} during the review period.`;
      break;

    case "Mixed":
      message =
        `Strength results were mixed: ${decliningExerciseCount} exercise${decliningExerciseCount === 1 ? "" : "s"} declined while ${improvingExerciseCount + maintainedExerciseCount} improved or were maintained during the review period.`;
      break;

    case "Declining":
      message =
        `Strength declined across all ${decliningExerciseCount} evaluated exercise${decliningExerciseCount === 1 ? "" : "s"} during the review period.`;
      break;

    default:
      message =
        "More repeated exercise performances are needed within the review period before whole-program strength retention can be evaluated.";
      break;
  }


  // ----------------------------------------------------------
  // Result
  // ----------------------------------------------------------

  return {
    status,

    evaluatedExerciseCount,

    improvingExerciseCount,

    maintainedExerciseCount,

    decliningExerciseCount,

    insufficientExerciseCount,

    exercises,

    message,
  };
}