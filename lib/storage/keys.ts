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

  trainingPreferences:
    "fitness-os-training-preferences",

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

  // ----------------------------------------------------------
  // Body Composition / Goal Progress
  // ----------------------------------------------------------

  goalHistory:
    "fitness-os-goal-history",

  bodyMeasurements:
    "fitness-os-body-measurements",

  dexaRecords:
    "fitness-os-dexa-records",

  progressCheckIns:
    "fitness-os-progress-check-ins",

  // ----------------------------------------------------------
  // Local Migration Markers
  // ----------------------------------------------------------

  exerciseIdMigrationV1:
    "fitness-os-exercise-id-migration-v1",
} as const;


// ============================================================
// Cloud-Synced Data
// ============================================================
//
// Persistent Fitness OS records are synchronized.
//
// Active workout/run state remains device-local until
// cross-device conflict handling is deliberately implemented.
// ============================================================

export const CLOUD_SYNC_STORAGE_KEYS = [
  STORAGE_KEYS.morningCheckIns,
  STORAGE_KEYS.runHistory,
  STORAGE_KEYS.trainingPlanState,
  STORAGE_KEYS.trainingPreferences,
  STORAGE_KEYS.customExercises,
  STORAGE_KEYS.workoutTemplates,
  STORAGE_KEYS.workoutHistory,
  STORAGE_KEYS.trainingActivityCompletions,

  STORAGE_KEYS.goalHistory,
  STORAGE_KEYS.bodyMeasurements,
  STORAGE_KEYS.dexaRecords,
  STORAGE_KEYS.progressCheckIns,
] as const;


// ============================================================
// Types
// ============================================================

export type StorageKey =
  (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export type CloudSyncStorageKey =
  (typeof CLOUD_SYNC_STORAGE_KEYS)[number];
