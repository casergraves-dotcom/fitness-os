import type {
  Exercise,
  ExerciseDefinition,
  WorkoutSession,
} from "../types";

export interface ExercisePersonalRecord {
  exerciseName: string;
  estimatedOneRepMax: number;
  previousEstimatedOneRepMax: number;
  improvement: number;
}

function isSameExercise(
  current: Exercise,
  historical: Exercise
) {
  if (
    current.exerciseDefinitionId &&
    historical.exerciseDefinitionId
  ) {
    return (
      current.exerciseDefinitionId ===
      historical.exerciseDefinitionId
    );
  }

  return (
    current.name.trim().toLowerCase() ===
    historical.name.trim().toLowerCase()
  );
}

function getEstimatedOneRepMax(
  exercise: Exercise
) {
  const estimates = exercise.sets
    .filter(
      (set) =>
        set.completed &&
        set.weight > 0 &&
        set.reps > 0
    )
    .map(
      (set) =>
        set.weight *
        (1 + set.reps / 30)
    );

  if (estimates.length === 0) {
    return null;
  }

  return Math.round(
    Math.max(...estimates)
  );
}

function supportsEstimatedStrength(
  definition?: ExerciseDefinition
) {
  if (!definition) {
    return true;
  }

  return !(
    definition.progressionType ===
      "Assistance" ||
    definition.progressionType ===
      "Reps" ||
    definition.progressionType ===
      "Duration" ||
    definition.performanceType ===
      "Duration"
  );
}

export function getExercisePersonalRecord(
  currentExercise: Exercise,
  workoutHistory: WorkoutSession[],
  definition?: ExerciseDefinition
): ExercisePersonalRecord | null {
  if (
    !supportsEstimatedStrength(
      definition
    )
  ) {
    return null;
  }

  const currentEstimatedOneRepMax =
    getEstimatedOneRepMax(
      currentExercise
    );

  if (
    currentEstimatedOneRepMax ===
    null
  ) {
    return null;
  }

  const previousEstimates =
    workoutHistory.flatMap(
      (workout) =>
        workout.exercises
          .filter(
            (exercise) =>
              isSameExercise(
                currentExercise,
                exercise
              )
          )
          .map(
            (exercise) =>
              getEstimatedOneRepMax(
                exercise
              )
          )
          .filter(
            (
              estimate
            ): estimate is number =>
              estimate !== null
          )
    );

  // The first logged performance establishes a baseline.
  // It should not be presented as a personal record yet.
  if (previousEstimates.length === 0) {
    return null;
  }

  const previousEstimatedOneRepMax =
    Math.max(...previousEstimates);

  if (
    currentEstimatedOneRepMax <=
    previousEstimatedOneRepMax
  ) {
    return null;
  }

  return {
    exerciseName:
      currentExercise.name,
    estimatedOneRepMax:
      currentEstimatedOneRepMax,
    previousEstimatedOneRepMax,
    improvement:
      currentEstimatedOneRepMax -
      previousEstimatedOneRepMax,
  };
}
