import type {
  WorkoutSession,
} from "@/features/workout/types";


// ============================================================
// Types
// ============================================================

export interface ExerciseProgressOption {
  exerciseDefinitionId?:
    string;

  name: string;
}


export interface ExerciseProgressEntry {
  workoutId: string;

  date: string;

  exerciseDefinitionId?:
    string;

  exerciseName: string;

  weight: number;

  reps: number;

  estimatedOneRepMax: number;
}


export interface ExerciseProgressHistory {
  exerciseDefinitionId:
    string | null;

  exerciseName: string;

  progress:
    ExerciseProgressEntry[];
}


// ============================================================
// Helpers
// ============================================================

function estimateOneRepMax(
  weight:
    number,
  reps:
    number
) {
  if (
    weight <=
      0 ||
    reps <=
      0
  ) {
    return 0;
  }

  // Epley estimate. Capping reps prevents high-rep endurance
  // sets from producing misleading strength estimates.
  const cappedReps =
    Math.min(
      reps,
      30
    );

  return (
    weight *
    (
      1 +
      cappedReps /
        30
    )
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


function exerciseMatchesOption({
  exerciseDefinitionId,
  exerciseName,
  option,
}: {
  exerciseDefinitionId?:
    string;

  exerciseName:
    string;

  option:
    ExerciseProgressOption;
}) {
  if (
    option.exerciseDefinitionId &&
    exerciseDefinitionId
  ) {
    return (
      option.exerciseDefinitionId ===
      exerciseDefinitionId
    );
  }

  return (
    normalizeExerciseName(
      exerciseName
    ) ===
    normalizeExerciseName(
      option.name
    )
  );
}


// ============================================================
// Exercise Options
// ============================================================

export function getExerciseProgressOptions(
  workoutHistory:
    WorkoutSession[]
): ExerciseProgressOption[] {
  const byName =
    new Map<
      string,
      ExerciseProgressOption
    >();

  for (
    const workout
    of workoutHistory
  ) {
    for (
      const exercise
      of workout.exercises
    ) {
      const hasWeightedCompletedSet =
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
        !hasWeightedCompletedSet
      ) {
        continue;
      }

      const normalizedName =
        normalizeExerciseName(
          exercise.name
        );

      const existing =
        byName.get(
          normalizedName
        );

      // Deduplicate legacy name-only history and newer
      // permanent-ID history. Prefer a permanent ID when one
      // is available.
      if (
        !existing ||
        (
          !existing
            .exerciseDefinitionId &&
          exercise
            .exerciseDefinitionId
        )
      ) {
        byName.set(
          normalizedName,
          {
            exerciseDefinitionId:
              exercise
                .exerciseDefinitionId,

            name:
              exercise.name,
          }
        );
      }
    }
  }

  return [
    ...byName.values(),
  ].sort(
    (
      a,
      b
    ) =>
      a.name.localeCompare(
        b.name
      )
  );
}


// ============================================================
// Selected Exercise Progress
// ============================================================

export function getExerciseProgressEntries({
  workoutHistory,
  option,
}: {
  workoutHistory:
    WorkoutSession[];

  option:
    ExerciseProgressOption |
    null;
}): ExerciseProgressEntry[] {
  if (!option) {
    return [];
  }

  const entries:
    ExerciseProgressEntry[] = [];

  for (
    const workout
    of workoutHistory
  ) {
    const exercise =
      workout.exercises.find(
        (
          item
        ) =>
          exerciseMatchesOption({
            exerciseDefinitionId:
              item
                .exerciseDefinitionId,

            exerciseName:
              item.name,

            option,
          })
      );

    if (!exercise) {
      continue;
    }

    const completedSets =
      exercise.sets.filter(
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
      completedSets.length ===
      0
    ) {
      continue;
    }

    const bestSet =
      completedSets.reduce(
        (
          best,
          set
        ) =>
          estimateOneRepMax(
            set.weight,
            set.reps
          ) >
          estimateOneRepMax(
            best.weight,
            best.reps
          )
            ? set
            : best
      );

    entries.push({
      workoutId:
        workout.id,

      date:
        workout.completedAt ??
        workout.startedAt,

      exerciseDefinitionId:
        exercise
          .exerciseDefinitionId,

      exerciseName:
        exercise.name,

      weight:
        bestSet.weight,

      reps:
        bestSet.reps,

      estimatedOneRepMax:
        estimateOneRepMax(
          bestSet.weight,
          bestSet.reps
        ),
    });
  }

  return entries.sort(
    (
      a,
      b
    ) =>
      new Date(
        a.date
      ).getTime() -
      new Date(
        b.date
      ).getTime()
  );
}


// ============================================================
// All Exercise Progress
// ============================================================

export function getAllExerciseProgress(
  workoutHistory:
    WorkoutSession[]
): ExerciseProgressHistory[] {
  return getExerciseProgressOptions(
    workoutHistory
  ).map(
    (
      option
    ) => ({
      exerciseDefinitionId:
        option
          .exerciseDefinitionId ??
        null,

      exerciseName:
        option.name,

      progress:
        getExerciseProgressEntries({
          workoutHistory,
          option,
        }),
    })
  );
}