import type {
  Exercise,
  WorkoutSession,
} from "./types";

// ============================================================
// Helpers
// ============================================================

function createSet(
  id: string
) {
  return {
    id,
    weight: 0,
    reps: 0,
    completed: false,
  };
}

function createExercise(
  id: string,
  exerciseDefinitionId: string,
  name: string,
  setCount: number
): Exercise {
  return {
    id,
    exerciseDefinitionId,
    name,
    prescribedSetCount: setCount,

    sets: Array.from(
      { length: setCount },
      (_, index) =>
        createSet(
          `${id}-set-${index + 1}`
        )
    ),
  };
}

// ============================================================
// Gym A
// ============================================================
//
// Spreadsheet roles:
//
// 1. Squat              - required
// 2. Horizontal Push    - required
// 3. Horizontal Pull    - required
// 4. Hamstrings         - required
// 5. Vertical Push      - optional
// 6. Accessory          - optional
// 7. Core               - required
//
// Spreadsheet cardio:
// Zone 2 - 15 to 20 min
//
// Cardio is intentionally NOT stored as an Exercise here.
// It will be prescribed by the Training Plan.
// ============================================================

const gymAExercises: Exercise[] = [
  createExercise(
    "gym-a-leg-press",
    "leg-press",
    "Leg Press",
    3
  ),

  createExercise(
    "gym-a-chest-press",
    "chest-press-machine",
    "Chest Press Machine",
    3
  ),

  createExercise(
    "gym-a-seated-row",
    "seated-row",
    "Seated Row",
    3
  ),

  createExercise(
    "gym-a-leg-curl",
    "leg-curl",
    "Leg Curl",
    3
  ),

  createExercise(
    "gym-a-shoulder-press",
    "shoulder-press-machine",
    "Shoulder Press Machine",
    2
  ),

  createExercise(
    "gym-a-lateral-raise",
    "lateral-raise-machine",
    "Lateral Raise Machine",
    2
  ),

  createExercise(
    "gym-a-cable-woodchop",
    "cable-woodchop",
    "Cable Woodchop",
    3
  ),
];

// ============================================================
// Gym B
// ============================================================
//
// Spreadsheet roles:
//
// 1. Squat              - required
// 2. Vertical Pull      - required
// 3. Horizontal Push    - required
// 4. Hamstrings         - required
// 5. Accessory          - optional
// 6. Accessory          - optional
// 7. Accessory          - optional
//
// Spreadsheet cardio:
// Incline walk - 15 to 20 min
// ============================================================

const gymBExercises: Exercise[] = [
  createExercise(
    "gym-b-hack-squat",
    "hack-squat-pendulum-squat",
    "Hack Squat / Pendulum Squat",
    3
  ),

  createExercise(
    "gym-b-lat-pulldown",
    "lat-pulldown",
    "Lat Pulldown",
    3
  ),

  createExercise(
    "gym-b-incline-chest-press",
    "incline-chest-press-machine",
    "Incline Chest Press Machine",
    3
  ),

  createExercise(
    "gym-b-leg-curl",
    "leg-curl",
    "Leg Curl",
    3
  ),

  createExercise(
    "gym-b-biceps-curl",
    "biceps-curl-machine",
    "Biceps Curl Machine",
    2
  ),

  createExercise(
    "gym-b-triceps-press",
    "triceps-press-machine",
    "Triceps Press Machine",
    2
  ),

  createExercise(
    "gym-b-reverse-pec-deck",
    "reverse-pec-deck",
    "Reverse Pec Deck",
    2
  ),
];

// ============================================================
// Gym C
// ============================================================
//
// Spreadsheet roles:
//
// 1. Squat / Glute      - required
// 2. Vertical Pull      - required
// 3. Horizontal Push    - required
// 4. Accessory          - optional
// 5. Hip Stability      - optional
// 6. Adduction          - optional
// 7. Core               - required
//
// Spreadsheet note:
// Leg Press uses a high-foot setup for additional
// posterior-chain / glute emphasis.
//
// Spreadsheet cardio:
// Intervals / adaptive cardio
// ============================================================

const gymCExercises: Exercise[] = [
  createExercise(
    "gym-c-leg-press",
    "leg-press",
    "Leg Press",
    3
  ),

  createExercise(
    "gym-c-assisted-pull-up",
    "assisted-pull-up",
    "Assisted Pull-Up",
    3
  ),

  createExercise(
    "gym-c-chest-press",
    "chest-press-machine",
    "Chest Press Machine",
    3
  ),

  createExercise(
    "gym-c-cable-pressdown",
    "cable-pressdown",
    "Cable Pressdown",
    2
  ),

  createExercise(
    "gym-c-hip-abductor",
    "hip-abductor",
    "Hip Abductor",
    2
  ),

  createExercise(
    "gym-c-hip-adductor",
    "hip-adductor",
    "Hip Adductor",
    2
  ),

  createExercise(
    "gym-c-ab-crunch",
    "ab-crunch-machine",
    "Ab Crunch Machine",
    3
  ),
];

// ============================================================
// Workout Templates
// ============================================================

export const workoutTemplates = {
  "Gym A": gymAExercises,
  "Gym B": gymBExercises,
  "Gym C": gymCExercises,
};

// ============================================================
// Legacy Initial Session
// ============================================================
//
// Temporary export while the rest of the app transitions away
// from a single hard-coded initial workout.
//
// New users start with Gym A.
// ============================================================

export const workoutSession: WorkoutSession = {
  id: "initial-workout",
  workoutType: "Gym A",
  startedAt:
    new Date().toISOString(),
  exercises:
    gymAExercises,
};