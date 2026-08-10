// ============================================================
// Fitness OS Storage Keys
// ============================================================

export const STORAGE_KEYS = {
  morningCheckIns:
    "fitness-os-morning-check-ins",

  activeRun:
    "fitness-os-active-run",

  runHistory:
    "fitness-os-run-history",

  trainingPlanState:
    "fitness-os-training-plan-state",

  customExercises:
    "fitness-os-custom-exercises",

  workoutTemplates:
    "fitness-os-workout-templates",

  activeWorkout:
    "fitness-os-active-workout",

  workoutHistory:
    "fitness-os-workout-history",

  trainingActivityCompletions:
    "fitness-os-training-activity-completions",

  exerciseIdMigrationV1:
    "fitness-os-exercise-id-migration-v1",
} as const;

// ============================================================
// Cloud-Synced Data
// ============================================================
//
// Phase 1 intentionally excludes active workout/run state.
// Those require more careful conflict handling.
//

export const CLOUD_SYNC_STORAGE_KEYS = [
  STORAGE_KEYS.morningCheckIns,
  STORAGE_KEYS.runHistory,
  STORAGE_KEYS.trainingPlanState,
  STORAGE_KEYS.customExercises,
  STORAGE_KEYS.workoutTemplates,
  STORAGE_KEYS.workoutHistory,
  STORAGE_KEYS.trainingActivityCompletions,
] as const;

// ============================================================
// Types
// ============================================================

export type StorageKey =
  (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export type CloudSyncStorageKey =
  (typeof CLOUD_SYNC_STORAGE_KEYS)[number];