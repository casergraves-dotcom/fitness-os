// ============================================================
// Fitness OS Storage Keys
// ============================================================
//
// Central source of truth for Fitness OS persisted data used by
// the current localStorage/cloud-sync implementation.
//
// These values intentionally match the existing localStorage
// keys so cloud sync does not change persisted data formats.
// ============================================================

export const FITNESS_OS_STORAGE_KEYS = {
  customExercises:
    "fitness-os-custom-exercises",

  workoutTemplates:
    "fitness-os-workout-templates",

  trainingPlanState:
    "fitness-os-training-plan-state",

  trainingActivityCompletions:
    "fitness-os-training-activity-completions",

  morningCheckIns:
    "fitness-os-morning-check-ins",

  workoutHistory:
    "fitness-os-workout-history",

  runHistory:
    "fitness-os-run-history",

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
  // Nutrition
  // ----------------------------------------------------------

  nutritionTargets:
    "fitness-os-nutrition-targets",

  dailyNutrition:
    "fitness-os-daily-nutrition",

  // ----------------------------------------------------------
  // Daily Activity
  // ----------------------------------------------------------

  stepTargets:
    "fitness-os-step-targets",

  dailySteps:
    "fitness-os-daily-steps",

  // ----------------------------------------------------------
  // Device-Local Only
  // ----------------------------------------------------------

  activeWorkout:
    "fitness-os-active-workout",

  activeRun:
    "fitness-os-active-run",
} as const;


// ============================================================
// Cloud Sync Keys
// ============================================================
//
// Persistent Fitness OS records are synchronized.
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

  FITNESS_OS_STORAGE_KEYS.goalHistory,
  FITNESS_OS_STORAGE_KEYS.bodyMeasurements,
  FITNESS_OS_STORAGE_KEYS.dexaRecords,
  FITNESS_OS_STORAGE_KEYS.progressCheckIns,

  FITNESS_OS_STORAGE_KEYS.nutritionTargets,
  FITNESS_OS_STORAGE_KEYS.dailyNutrition,

  FITNESS_OS_STORAGE_KEYS.stepTargets,
  FITNESS_OS_STORAGE_KEYS.dailySteps,
] as const;


export type FitnessOsSyncKey =
  (typeof FITNESS_OS_SYNC_KEYS)[number];