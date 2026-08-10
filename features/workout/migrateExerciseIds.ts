import {
  exerciseLibrary as builtInExercises,
} from "./exerciseLibrary";

import type {
  Exercise,
  ExerciseDefinition,
  WorkoutSession,
} from "./types";

// ============================================================
// Storage Keys
// ============================================================

const CUSTOM_EXERCISE_STORAGE_KEY =
  "fitness-os-custom-exercises";

const TEMPLATE_STORAGE_KEY =
  "fitness-os-workout-templates";

const ACTIVE_WORKOUT_STORAGE_KEY =
  "fitness-os-active-workout";

const HISTORY_STORAGE_KEY =
  "fitness-os-workout-history";

const MIGRATION_STORAGE_KEY =
  "fitness-os-exercise-id-migration-v1";

// ============================================================
// Types
// ============================================================

type StoredWorkoutTemplates = {
  Push: Exercise[];
  Pull: Exercise[];
  Legs: Exercise[];
};

// ============================================================
// Helpers
// ============================================================

function normalizeName(
  name: string
) {
  return name
    .trim()
    .toLowerCase();
}

// ------------------------------------------------------------
// Add Missing Exercise Definition IDs
// ------------------------------------------------------------

function migrateExercises(
  exercises: Exercise[],
  library: ExerciseDefinition[]
): Exercise[] {
  return exercises.map(
    (exercise) => {
      // This exercise has already been migrated.
      if (
        exercise.exerciseDefinitionId
      ) {
        return exercise;
      }

      // Older workout data only has the exercise name.
      // Find the matching Exercise Library definition.
      const definition =
        library.find(
          (item) =>
            normalizeName(
              item.name
            ) ===
            normalizeName(
              exercise.name
            )
        );

      // If we can't confidently identify the exercise,
      // leave it untouched rather than assigning the
      // wrong permanent ID.
      if (!definition) {
        return exercise;
      }

      return {
        ...exercise,
        exerciseDefinitionId:
          definition.id,
      };
    }
  );
}

// ============================================================
// Exercise ID Migration
// ============================================================

export function migrateExerciseIds() {
  // ----------------------------------------------------------
  // Run Migration Only Once
  // ----------------------------------------------------------

  const alreadyMigrated =
    localStorage.getItem(
      MIGRATION_STORAGE_KEY
    );

  if (alreadyMigrated) {
    return;
  }

  // ----------------------------------------------------------
  // Build Complete Exercise Library
  // ----------------------------------------------------------

  let customExercises:
    ExerciseDefinition[] = [];

  const savedCustomExercises =
    localStorage.getItem(
      CUSTOM_EXERCISE_STORAGE_KEY
    );

  if (savedCustomExercises) {
    try {
      customExercises =
        JSON.parse(
          savedCustomExercises
        );
    } catch {
      // Don't modify the user's custom exercise storage.
      // Continue using the built-in library.
      customExercises = [];
    }
  }

  const library: ExerciseDefinition[] = [
    ...builtInExercises,
    ...customExercises,
  ];

  // ----------------------------------------------------------
  // Migrate Workout Templates
  // ----------------------------------------------------------

  const savedTemplates =
    localStorage.getItem(
      TEMPLATE_STORAGE_KEY
    );

  if (savedTemplates) {
    try {
      const templates: StoredWorkoutTemplates =
        JSON.parse(
          savedTemplates
        );

      const migratedTemplates:
        StoredWorkoutTemplates = {
        Push: migrateExercises(
          templates.Push,
          library
        ),

        Pull: migrateExercises(
          templates.Pull,
          library
        ),

        Legs: migrateExercises(
          templates.Legs,
          library
        ),
      };

      localStorage.setItem(
        TEMPLATE_STORAGE_KEY,
        JSON.stringify(
          migratedTemplates
        )
      );
    } catch {
      // Leave malformed template data untouched.
    }
  }

  // ----------------------------------------------------------
  // Migrate Active Workout
  // ----------------------------------------------------------

  const savedActiveWorkout =
    localStorage.getItem(
      ACTIVE_WORKOUT_STORAGE_KEY
    );

  if (savedActiveWorkout) {
    try {
      const activeWorkout:
        WorkoutSession =
        JSON.parse(
          savedActiveWorkout
        );

      const migratedActiveWorkout:
        WorkoutSession = {
        ...activeWorkout,

        exercises:
          migrateExercises(
            activeWorkout.exercises,
            library
          ),
      };

      localStorage.setItem(
        ACTIVE_WORKOUT_STORAGE_KEY,
        JSON.stringify(
          migratedActiveWorkout
        )
      );
    } catch {
      // Leave malformed active workout data untouched.
    }
  }

  // ----------------------------------------------------------
  // Migrate Workout History
  // ----------------------------------------------------------

  const savedHistory =
    localStorage.getItem(
      HISTORY_STORAGE_KEY
    );

  if (savedHistory) {
    try {
      const history:
        WorkoutSession[] =
        JSON.parse(
          savedHistory
        );

      const migratedHistory =
        history.map(
          (workout) => ({
            ...workout,

            exercises:
              migrateExercises(
                workout.exercises,
                library
              ),
          })
        );

      localStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(
          migratedHistory
        )
      );
    } catch {
      // Leave malformed history data untouched.
    }
  }

  // ----------------------------------------------------------
  // Mark Migration Complete
  // ----------------------------------------------------------

  localStorage.setItem(
    MIGRATION_STORAGE_KEY,
    "true"
  );
}