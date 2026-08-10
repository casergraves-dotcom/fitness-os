// ============================================================
// Fitness OS Storage Keys
// ============================================================
//
// Central source of truth for Fitness OS persisted data.
//
// These keys intentionally match the existing localStorage keys
// so cloud sync can be added without changing the data formats
// already used throughout the app.
// ============================================================

export const FITNESS_OS_STORAGE_KEYS = {
  customExercises: "fitness-os-custom-exercises",
  workoutTemplates: "fitness-os-workout-templates",
  trainingPlanState: "fitness-os-training-plan-state",
  trainingActivityCompletions:
    "fitness-os-training-activity-completions",
  morningCheckIns: "fitness-os-morning-check-ins",
  workoutHistory: "fitness-os-workout-history",
  runHistory: "fitness-os-run-history",

  // ----------------------------------------------------------
  // Device-local only for now
  // ----------------------------------------------------------

  activeWorkout: "fitness-os-active-workout",
  activeRun: "fitness-os-active-run",
} as const;

// ============================================================
// Cloud Sync Keys
// ============================================================
//
// Only completed/persistent data is synchronized during the
// first sync phase.
//
// Active workout/run state stays device-local until conflict
// handling is implemented.
// ============================================================

export const FITNESS_OS_SYNC_KEYS = [
  FITNESS_OS_STORAGE_KEYS.customExercises,
  FITNESS_OS_STORAGE_KEYS.workoutTemplates,
  FITNESS_OS_STORAGE_KEYS.trainingPlanState,
  FITNESS_OS_STORAGE_KEYS.trainingActivityCompletions,
  FITNESS_OS_STORAGE_KEYS.morningCheckIns,
  FITNESS_OS_STORAGE_KEYS.workoutHistory,
  FITNESS_OS_STORAGE_KEYS.runHistory,
] as const;

export type FitnessOsSyncKey =
  (typeof FITNESS_OS_SYNC_KEYS)[number];