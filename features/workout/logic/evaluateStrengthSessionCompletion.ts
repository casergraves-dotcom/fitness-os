import type { WorkoutSession } from "../types";

export type StrengthSessionCompletionClassification =
  | "FullSession"
  | "ValidShortenedSession"
  | "SubstantialPartialSession"
  | "MinimalSession"
  | "MissedSession";

export interface StrengthSessionCompletionEvaluation {
  classification: StrengthSessionCompletionClassification;
  prescribedExerciseCount: number;
  completedExerciseCount: number;
  prescribedWorkingSetCount: number;
  completedWorkingSetCount: number;
  exerciseCompletionRate: number;
  workingSetCompletionRate: number;
  intentionallyReduced: boolean;
}

export function evaluateStrengthSessionCompletion(
  session: WorkoutSession,
): StrengthSessionCompletionEvaluation {
  const completedExercises = session.exercises.filter((exercise) =>
    exercise.sets.some((set) => set.completed && set.reps > 0),
  );
  const completedWorkingSetCount = session.exercises.reduce(
    (total, exercise) =>
      total +
      exercise.sets.filter((set) => set.completed && set.reps > 0).length,
    0,
  );
  const fallbackPrescribedSetCount = session.exercises.reduce(
    (total, exercise) =>
      total + Math.max(0, exercise.prescribedSetCount ?? exercise.sets.length),
    0,
  );
  const prescribedExerciseCount = Math.max(
    0,
    session.prescriptionSnapshot?.prescribedExerciseCount ??
      session.exercises.length,
  );
  const prescribedWorkingSetCount = Math.max(
    0,
    session.prescriptionSnapshot?.prescribedWorkingSetCount ??
      fallbackPrescribedSetCount,
  );
  const intentionallyReduced =
    session.prescriptionSnapshot?.intentionallyReduced ??
    session.variantType === "ShortGym";
  const exerciseCompletionRate =
    prescribedExerciseCount > 0
      ? Math.min(1, completedExercises.length / prescribedExerciseCount)
      : 0;
  const workingSetCompletionRate =
    prescribedWorkingSetCount > 0
      ? Math.min(1, completedWorkingSetCount / prescribedWorkingSetCount)
      : 0;
  const completedPrescription =
    prescribedExerciseCount > 0 &&
    prescribedWorkingSetCount > 0 &&
    completedExercises.length >= prescribedExerciseCount &&
    completedWorkingSetCount >= prescribedWorkingSetCount;

  let classification: StrengthSessionCompletionClassification;

  if (completedWorkingSetCount === 0) {
    classification = "MissedSession";
  } else if (completedPrescription) {
    classification = intentionallyReduced
      ? "ValidShortenedSession"
      : "FullSession";
  } else if (
    workingSetCompletionRate >= 0.6 &&
    exerciseCompletionRate >= 0.5
  ) {
    classification = "SubstantialPartialSession";
  } else {
    classification = "MinimalSession";
  }

  return {
    classification,
    prescribedExerciseCount,
    completedExerciseCount: completedExercises.length,
    prescribedWorkingSetCount,
    completedWorkingSetCount,
    exerciseCompletionRate,
    workingSetCompletionRate,
    intentionallyReduced,
  };
}
