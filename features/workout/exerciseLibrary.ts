import type {
  ExerciseDefinition,
} from "./types";

// ============================================================
// Built-In Exercise Library
// ============================================================
//
// Programming values below come from the Fitness OS
// spreadsheet DATA_Exercises table.
//
// Exercises that existed in the app but were not defined
// in the spreadsheet are preserved without progression
// settings. We can configure those separately later.
//
// Metric model:
//
// resistanceType
//   None       = bodyweight / no external resistance
//   Weight     = external resistance
//   Assistance = external assistance
//
// performanceType
//   Reps       = performance measured in repetitions
//   Duration   = performance measured in seconds
//
// progressionType is temporarily retained for backwards
// compatibility with the existing progression engine.
// ============================================================

export const exerciseLibrary: ExerciseDefinition[] = [
  // ==========================================================
  // Chest
  // ==========================================================

  {
    id: "chest-press-machine",
    name: "Chest Press Machine",
    category: "Chest",
    sets: 3,
    repMin: 8,
    repMax: 12,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },
  {
    id: "incline-chest-press-machine",
    name: "Incline Chest Press Machine",
    category: "Chest",
    sets: 3,
    repMin: 8,
    repMax: 12,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },
  {
    id: "dumbbell-chest-press",
    name: "Dumbbell Chest Press",
    category: "Chest",
    sets: 3,
    repMin: 8,
    repMax: 12,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },

  // ----------------------------------------------------------
  // Push-Up Progression
  // ----------------------------------------------------------

  {
    id: "push-ups",
    name: "Push-Ups",
    category: "Chest",
    sets: 3,
    repMin: 8,
    repMax: 15,
    increment: 0,
    progressionType: "Reps",
    resistanceType: "None",
    performanceType: "Reps",
    nextVariationId:
      "feet-elevated-push-ups",
  },
  {
    id: "feet-elevated-push-ups",
    name: "Feet-Elevated Push-Ups",
    category: "Chest",
    sets: 3,
    repMin: 8,
    repMax: 15,
    increment: 0,
    progressionType: "Reps",
    resistanceType: "None",
    performanceType: "Reps",
    nextVariationId:
      "weighted-push-ups",
  },
  {
    id: "weighted-push-ups",
    name: "Weighted Push-Ups",
    category: "Chest",
    sets: 3,
    repMin: 8,
    repMax: 12,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },

  // Not defined in the spreadsheet.
  {
    id: "barbell-bench-press",
    name: "Barbell Bench Press",
    category: "Chest",
  },
  {
    id: "incline-dumbbell-press",
    name: "Incline Dumbbell Press",
    category: "Chest",
  },
  {
    id: "chest-fly",
    name: "Chest Fly",
    category: "Chest",
  },

  // ==========================================================
  // Back
  // ==========================================================

  {
    id: "seated-row",
    name: "Seated Row",
    category: "Back",
    sets: 3,
    repMin: 8,
    repMax: 12,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },
  {
    id: "cable-row",
    name: "Cable Row",
    category: "Back",
    sets: 3,
    repMin: 8,
    repMax: 12,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },
  {
    id: "one-arm-dumbbell-row",
    name: "One-Arm Dumbbell Row",
    category: "Back",
    sets: 3,
    repMin: 8,
    repMax: 12,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },
  {
    id: "backpack-row",
    name: "Backpack Row",
    category: "Back",
    sets: 3,
    repMin: 10,
    repMax: 15,
    increment: 0,
    progressionType: "Reps",
    resistanceType: "None",
    performanceType: "Reps",
  },
  {
    id: "lat-pulldown",
    name: "Lat Pulldown",
    category: "Back",
    sets: 3,
    repMin: 8,
    repMax: 12,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },
  {
    id: "assisted-pull-up",
    name: "Assisted Pull-Up",
    category: "Back",
    sets: 3,
    repMin: 8,
    repMax: 12,
    increment: 5,
    progressionType: "Assistance",
    resistanceType: "Assistance",
    performanceType: "Reps",
  },
  {
    id: "band-pulldown",
    name: "Band Pulldown",
    category: "Back",
    sets: 3,
    repMin: 10,
    repMax: 15,
    increment: 0,
    progressionType: "Reps",
    resistanceType: "None",
    performanceType: "Reps",
  },

  // Not defined in the spreadsheet.
  {
    id: "barbell-row",
    name: "Barbell Row",
    category: "Back",
  },

  // ==========================================================
  // Shoulders
  // ==========================================================

  {
    id: "shoulder-press-machine",
    name: "Shoulder Press Machine",
    category: "Shoulders",
    sets: 2,
    repMin: 8,
    repMax: 12,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },
  {
    id: "dumbbell-shoulder-press",
    name: "Dumbbell Shoulder Press",
    category: "Shoulders",
    sets: 2,
    repMin: 8,
    repMax: 12,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },
  {
    id: "lateral-raise-machine",
    name: "Lateral Raise Machine",
    category: "Shoulders",
    sets: 2,
    repMin: 12,
    repMax: 15,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },
  {
    id: "dumbbell-lateral-raise",
    name: "Dumbbell Lateral Raise",
    category: "Shoulders",
    sets: 2,
    repMin: 12,
    repMax: 15,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },
  {
    id: "reverse-pec-deck",
    name: "Reverse Pec Deck",
    category: "Shoulders",
    sets: 2,
    repMin: 12,
    repMax: 15,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },
  {
    id: "cable-face-pull",
    name: "Cable Face Pull",
    category: "Shoulders",
    sets: 3,
    repMin: 12,
    repMax: 15,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },

  // Not defined in the spreadsheet.
  {
    id: "overhead-press",
    name: "Overhead Press",
    category: "Shoulders",
  },

  // ==========================================================
  // Arms
  // ==========================================================

  {
    id: "biceps-curl-machine",
    name: "Biceps Curl Machine",
    category: "Arms",
    sets: 2,
    repMin: 10,
    repMax: 15,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },
  {
    id: "dumbbell-curl",
    name: "Dumbbell Curl",
    category: "Arms",
    sets: 2,
    repMin: 10,
    repMax: 15,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },
  {
    id: "triceps-press-machine",
    name: "Triceps Press Machine",
    category: "Arms",
    sets: 2,
    repMin: 10,
    repMax: 15,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },
  {
    id: "cable-pressdown",
    name: "Cable Pressdown",
    category: "Arms",
    sets: 2,
    repMin: 10,
    repMax: 15,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },

  // Not defined in the spreadsheet.
  {
    id: "triceps-pushdown",
    name: "Triceps Pushdown",
    category: "Arms",
  },
  {
    id: "biceps-curl",
    name: "Biceps Curl",
    category: "Arms",
  },

  // ==========================================================
  // Legs
  // ==========================================================

  {
    id: "leg-press",
    name: "Leg Press",
    category: "Legs",
    sets: 3,
    repMin: 8,
    repMax: 12,
    increment: 10,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },
  {
    id: "hack-squat-pendulum-squat",
    name: "Hack Squat / Pendulum Squat",
    category: "Legs",
    sets: 3,
    repMin: 8,
    repMax: 12,
    increment: 10,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },
  {
    id: "goblet-squat",
    name: "Goblet Squat",
    category: "Legs",
    sets: 3,
    repMin: 8,
    repMax: 12,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },
  {
    id: "reverse-lunge",
    name: "Reverse Lunge",
    category: "Legs",
    sets: 3,
    repMin: 8,
    repMax: 12,
    increment: 0,
    progressionType: "Reps",
    resistanceType: "None",
    performanceType: "Reps",
  },
  {
    id: "leg-curl",
    name: "Leg Curl",
    category: "Legs",
    sets: 3,
    repMin: 10,
    repMax: 15,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },
  {
    id: "dumbbell-rdl",
    name: "Dumbbell RDL",
    category: "Legs",
    sets: 3,
    repMin: 8,
    repMax: 12,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },
  {
    id: "glute-bridge",
    name: "Glute Bridge",
    category: "Legs",
    sets: 3,
    repMin: 10,
    repMax: 15,
    increment: 0,
    progressionType: "Reps",
    resistanceType: "None",
    performanceType: "Reps",
  },
  {
    id: "hip-abductor",
    name: "Hip Abductor",
    category: "Legs",
    sets: 2,
    repMin: 12,
    repMax: 20,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },
  {
    id: "side-lying-hip-abduction",
    name: "Side-Lying Hip Abduction",
    category: "Legs",
    sets: 2,
    repMin: 12,
    repMax: 20,
    increment: 0,
    progressionType: "Reps",
    resistanceType: "None",
    performanceType: "Reps",
  },
  {
    id: "hip-adductor",
    name: "Hip Adductor",
    category: "Legs",
    sets: 2,
    repMin: 12,
    repMax: 20,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },

  // Not defined in the spreadsheet.
  {
    id: "barbell-squat",
    name: "Barbell Squat",
    category: "Legs",
  },
  {
    id: "romanian-deadlift",
    name: "Romanian Deadlift",
    category: "Legs",
  },
  {
    id: "calf-raise",
    name: "Calf Raise",
    category: "Legs",
  },

  // ==========================================================
  // Core
  // ==========================================================

  {
    id: "cable-woodchop",
    name: "Cable Woodchop",
    category: "Core",
    sets: 3,
    repMin: 10,
    repMax: 12,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },
  {
    id: "ab-crunch-machine",
    name: "Ab Crunch Machine",
    category: "Core",
    sets: 3,
    repMin: 10,
    repMax: 15,
    increment: 5,
    progressionType: "Load",
    resistanceType: "Weight",
    performanceType: "Reps",
  },

  // ----------------------------------------------------------
  // Plank Progression
  // ----------------------------------------------------------

  {
    id: "plank",
    name: "Plank",
    category: "Core",
    sets: 3,
    repMin: 30,
    repMax: 60,
    increment: 0,
    progressionType: "Duration",
    resistanceType: "None",
    performanceType: "Duration",
    nextVariationId:
      "long-lever-plank",
  },
  {
    id: "long-lever-plank",
    name: "Long-Lever Plank",
    category: "Core",
    sets: 3,
    repMin: 20,
    repMax: 45,
    increment: 0,
    progressionType: "Duration",
    resistanceType: "None",
    performanceType: "Duration",
    nextVariationId:
      "weighted-plank",
  },
  {
    id: "weighted-plank",
    name: "Weighted Plank",
    category: "Core",
    sets: 3,
    repMin: 30,
    repMax: 60,
    increment: 5,

    // Temporarily retained for backwards compatibility.
    progressionType: "Load",

    resistanceType: "Weight",
    performanceType: "Duration",
  },

  {
    id: "dead-bug",
    name: "Dead Bug",
    category: "Core",
    sets: 3,
    repMin: 8,
    repMax: 12,
    increment: 0,
    progressionType: "Reps",
    resistanceType: "None",
    performanceType: "Reps",
  },

  // Not defined in the spreadsheet.
  {
    id: "cable-crunch",
    name: "Cable Crunch",
    category: "Core",
  },
  {
    id: "hanging-leg-raise",
    name: "Hanging Leg Raise",
    category: "Core",
  },
];