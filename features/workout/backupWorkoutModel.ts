import type {
  StrengthWorkoutIntent,
  StrengthWorkoutType,
  StrengthWorkoutVariant,
  StrengthWorkoutVariantType,
  WorkoutEquipment,
  WorkoutSetupCapability,
} from "./types";


// ============================================================
// Current Home Equipment Profile
// ============================================================
//
// Phase 2.1 starts with equipment that is currently usable in
// the home environment.
//
// Pull-up bar and punching bag are intentionally excluded here.
// They are owned, but not currently set up in the apartment.

export const currentHomeWorkoutEquipment:
WorkoutEquipment[] = [
  "Bodyweight",
  "YogaMat",
  "ResistanceBands",
];


export const currentHomeWorkoutCapabilities:
WorkoutSetupCapability[] = [
  "FloorSpace",
  "HighAnchor",
];

export const currentGymWorkoutEquipment:
WorkoutEquipment[] = [
  "Bodyweight",
  "YogaMat",
  "ResistanceBands",
  "PullUpBar",
  "Dumbbells",
  "Barbell",
  "BarbellRack",
  "WeightPlate",
  "Bench",
  "GymMachines",
];

export const currentGymWorkoutCapabilities:
WorkoutSetupCapability[] = [
  "FloorSpace",
  "HighAnchor",
  "LowAnchor",
  "PullUpBarInstalled",
];


// ============================================================
// Planned Strength Workout Variants
// ============================================================

export const strengthWorkoutVariantTypes:
StrengthWorkoutVariantType[] = [
  "FullGym",
  "ShortGym",
  "Home",
];


// ============================================================
// Strength Workout Intent
// ============================================================

export const strengthWorkoutIntents:
Record<
  StrengthWorkoutType,
  StrengthWorkoutIntent
> = {
  "Gym A": {
    strengthWorkout:
      "Gym A",

    roles: [
      { role: "Squat", required: true },
      { role: "HorizontalPush", required: true },
      { role: "HorizontalPull", required: true },
      { role: "KneeFlexion", required: true },
      { role: "VerticalPush", required: false },
      { role: "ShoulderAbduction", required: false },
      { role: "CoreRotation", required: true },
    ],
  },

  "Gym B": {
    strengthWorkout:
      "Gym B",

    roles: [
      { role: "Squat", required: true },
      { role: "VerticalPull", required: true },
      { role: "HorizontalPush", required: true },
      { role: "KneeFlexion", required: true },
      { role: "ElbowFlexion", required: false },
      { role: "ElbowExtension", required: false },
      { role: "RearShoulder", required: false },
    ],
  },

  "Gym C": {
    strengthWorkout:
      "Gym C",

    roles: [
      { role: "SquatGlute", required: true },
      { role: "HipHinge", required: true },
      { role: "VerticalPull", required: true },
      { role: "HorizontalPush", required: true },
      { role: "ElbowExtension", required: false },
      { role: "HipStability", required: false },
      { role: "Adduction", required: false },
      { role: "CoreFlexion", required: true },
    ],
  },
};


// ============================================================
// Backup Workout Prescriptions
// ============================================================
//
// Short Gym:
// Keep the highest-value movements and reduce working-set
// volume so the session can fit roughly 25-35 minutes.
//
// Home:
// Bands + bodyweight + yoga mat. These sessions preserve the
// major movement intent as closely as the currently available
// equipment allows.
//
// Vertical pulling in Home Gym B / C explicitly requires the
// HighAnchor capability in addition to ResistanceBands. This
// keeps equipment ownership separate from setup availability.

export const strengthWorkoutVariants:
StrengthWorkoutVariant[] = [
  // ----------------------------------------------------------
  // Gym A - Short Gym
  // ----------------------------------------------------------

  {
    id: "gym-a-short",
    label: "Gym A - Short",
    sourceStrengthWorkout: "Gym A",
    variantType: "ShortGym",
    requiredEquipment: ["GymMachines"],
    movementRoles: [
      "Squat",
      "HorizontalPush",
      "HorizontalPull",
      "KneeFlexion",
      "CoreRotation",
    ],
    exercises: [
      {
        exerciseDefinitionId: "leg-press",
        movementRole: "Squat",
        sets: 2,
      },
      {
        exerciseDefinitionId: "chest-press-machine",
        movementRole: "HorizontalPush",
        sets: 2,
      },
      {
        exerciseDefinitionId: "seated-row",
        movementRole: "HorizontalPull",
        sets: 2,
      },
      {
        exerciseDefinitionId: "leg-curl",
        movementRole: "KneeFlexion",
        sets: 2,
      },
      {
        exerciseDefinitionId: "cable-woodchop",
        movementRole: "CoreRotation",
        sets: 2,
      },
    ],
    durationMin: 25,
    durationMax: 35,
    note:
      "Reduced-volume Gym A that keeps every required movement role.",
  },

  // ----------------------------------------------------------
  // Gym A - Home
  // ----------------------------------------------------------

  {
    id: "gym-a-home",
    label: "Gym A - Home",
    sourceStrengthWorkout: "Gym A",
    variantType: "Home",
    requiredEquipment: [
      "Bodyweight",
      "YogaMat",
      "ResistanceBands",
    ],
    requiredCapabilities: [
      "FloorSpace",
    ],
    movementRoles: [
      "Squat",
      "HorizontalPush",
      "HorizontalPull",
      "HipHinge",
      "VerticalPush",
      "CoreStability",
    ],
    exercises: [
      {
        exerciseDefinitionId: "reverse-lunge",
        movementRole: "Squat",
        sets: 3,
      },
      {
        exerciseDefinitionId: "push-ups",
        movementRole: "HorizontalPush",
        sets: 3,
      },
      {
        exerciseDefinitionId: "band-row",
        movementRole: "HorizontalPull",
        sets: 3,
        note:
          "Use a seated band row around the feet if no anchor is available.",
      },
      {
        exerciseDefinitionId: "band-good-morning",
        movementRole: "HipHinge",
        sets: 3,
      },
      {
        exerciseDefinitionId: "band-shoulder-press",
        movementRole: "VerticalPush",
        sets: 2,
        optional: true,
      },
      {
        exerciseDefinitionId: "dead-bug",
        movementRole: "CoreStability",
        sets: 3,
      },
    ],
    durationMin: 30,
    durationMax: 40,
    note:
      "Bands + bodyweight substitute preserving most of Gym A's movement intent. Band Good Morning provides hip-hinge work but does not replace the scheduled knee-flexion pattern. Dead Bug provides practical core-stability work but does not replace the scheduled rotational pattern.",
  },

  // ----------------------------------------------------------
  // Gym B - Short Gym
  // ----------------------------------------------------------

  {
    id: "gym-b-short",
    label: "Gym B - Short",
    sourceStrengthWorkout: "Gym B",
    variantType: "ShortGym",
    requiredEquipment: ["GymMachines"],
    movementRoles: [
      "Squat",
      "VerticalPull",
      "HorizontalPush",
      "KneeFlexion",
    ],
    exercises: [
      {
        exerciseDefinitionId: "hack-squat-pendulum-squat",
        movementRole: "Squat",
        sets: 2,
      },
      {
        exerciseDefinitionId: "lat-pulldown",
        movementRole: "VerticalPull",
        sets: 2,
      },
      {
        exerciseDefinitionId: "incline-chest-press-machine",
        movementRole: "HorizontalPush",
        sets: 2,
      },
      {
        exerciseDefinitionId: "leg-curl",
        movementRole: "KneeFlexion",
        sets: 2,
      },
    ],
    durationMin: 25,
    durationMax: 35,
    note:
      "Reduced-volume Gym B that prioritizes all four required movement roles.",
  },

  // ----------------------------------------------------------
  // Gym B - Home
  // ----------------------------------------------------------

  {
    id: "gym-b-home",
    label: "Gym B - Home",
    sourceStrengthWorkout: "Gym B",
    variantType: "Home",
    requiredEquipment: [
      "Bodyweight",
      "YogaMat",
      "ResistanceBands",
    ],
    requiredCapabilities: [
      "FloorSpace",
      "HighAnchor",
    ],
    movementRoles: [
      "Squat",
      "VerticalPull",
      "HorizontalPush",
      "HipHinge",
      "ElbowFlexion",
      "ElbowExtension",
    ],
    exercises: [
      {
        exerciseDefinitionId: "reverse-lunge",
        movementRole: "Squat",
        sets: 3,
      },
      {
        exerciseDefinitionId: "band-pulldown",
        movementRole: "VerticalPull",
        sets: 3,
        note:
          "Use only with a secure high anchor. If no safe anchor is available, the future equipment-aware flow should replace this rather than improvise an unsafe setup.",
      },
      {
        exerciseDefinitionId: "push-ups",
        movementRole: "HorizontalPush",
        sets: 3,
      },
      {
        exerciseDefinitionId: "band-good-morning",
        movementRole: "HipHinge",
        sets: 3,
      },
      {
        exerciseDefinitionId: "band-biceps-curl",
        movementRole: "ElbowFlexion",
        sets: 2,
        optional: true,
      },
      {
        exerciseDefinitionId: "band-overhead-triceps-extension",
        movementRole: "ElbowExtension",
        sets: 2,
        optional: true,
      },
    ],
    durationMin: 30,
    durationMax: 40,
    note:
      "Bands + bodyweight substitute. Vertical pulling requires a safe high band anchor. Band Good Morning provides hip-hinge work but does not replace the scheduled knee-flexion pattern.",
  },

  // ----------------------------------------------------------
  // Gym C - Short Gym
  // ----------------------------------------------------------

  {
    id: "gym-c-short",
    label: "Gym C - Short",
    sourceStrengthWorkout: "Gym C",
    variantType: "ShortGym",
    requiredEquipment: [
      "GymMachines",
      "Dumbbells",
    ],
    movementRoles: [
      "SquatGlute",
      "HipHinge",
      "VerticalPull",
      "HorizontalPush",
      "CoreFlexion",
    ],
    exercises: [
      {
        exerciseDefinitionId: "leg-press",
        movementRole: "SquatGlute",
        sets: 2,
        note:
          "Use the programmed high-foot setup for additional glute/posterior-chain emphasis.",
      },
      {
        exerciseDefinitionId: "dumbbell-rdl",
        movementRole: "HipHinge",
        sets: 2,
      },
      {
        exerciseDefinitionId: "assisted-pull-up",
        movementRole: "VerticalPull",
        sets: 2,
      },
      {
        exerciseDefinitionId: "chest-press-machine",
        movementRole: "HorizontalPush",
        sets: 2,
      },
      {
        exerciseDefinitionId: "ab-crunch-machine",
        movementRole: "CoreFlexion",
        sets: 2,
      },
    ],
    durationMin: 25,
    durationMax: 35,
    note:
      "Reduced-volume Gym C that keeps every required movement role.",
  },

  // ----------------------------------------------------------
  // Gym C - Home
  // ----------------------------------------------------------

  {
    id: "gym-c-home",
    label: "Gym C - Home",
    sourceStrengthWorkout: "Gym C",
    variantType: "Home",
    requiredEquipment: [
      "Bodyweight",
      "YogaMat",
      "ResistanceBands",
    ],
    requiredCapabilities: [
      "FloorSpace",
      "HighAnchor",
    ],
    movementRoles: [
      "SquatGlute",
      "HipHinge",
      "VerticalPull",
      "HorizontalPush",
      "HipStability",
      "Adduction",
      "CoreStability",
    ],
    exercises: [
      {
        exerciseDefinitionId: "glute-bridge",
        movementRole: "SquatGlute",
        sets: 3,
        note:
          "Use band resistance above the knees when appropriate.",
      },
      {
        exerciseDefinitionId: "band-good-morning",
        movementRole: "HipHinge",
        sets: 3,
      },
      {
        exerciseDefinitionId: "band-pulldown",
        movementRole: "VerticalPull",
        sets: 3,
        note:
          "Use only with a secure high anchor.",
      },
      {
        exerciseDefinitionId: "push-ups",
        movementRole: "HorizontalPush",
        sets: 3,
      },
      {
        exerciseDefinitionId: "side-lying-hip-abduction",
        movementRole: "HipStability",
        sets: 2,
        optional: true,
      },
      {
        exerciseDefinitionId: "side-lying-hip-adduction",
        movementRole: "Adduction",
        sets: 2,
        optional: true,
      },
      {
        exerciseDefinitionId: "plank",
        movementRole: "CoreStability",
        sets: 3,
      },
    ],
    durationMin: 30,
    durationMax: 40,
    note:
      "Bands + bodyweight substitute. Vertical pulling requires a safe high band anchor. Plank provides practical core-stability work but does not replace the scheduled trunk-flexion pattern.",
  },
];


// ============================================================
// Variant Lookup
// ============================================================

export function getStrengthWorkoutVariants(
  strengthWorkout:
    StrengthWorkoutType
) {
  return strengthWorkoutVariants.filter(
    (variant) =>
      variant.sourceStrengthWorkout ===
      strengthWorkout
  );
}



// ============================================================
// Availability Helpers
// ============================================================

function includesAll<T>(
  available: T[],
  required: T[]
) {
  return required.every(
    (item) =>
      available.includes(item)
  );
}


export function isStrengthWorkoutVariantAvailable(
  variant:
    StrengthWorkoutVariant,
  availableEquipment:
    WorkoutEquipment[],
  availableCapabilities:
    WorkoutSetupCapability[]
) {
  const equipmentAvailable =
    includesAll(
      availableEquipment,
      variant.requiredEquipment
    );

  const capabilitiesAvailable =
    includesAll(
      availableCapabilities,
      variant.requiredCapabilities ??
        []
    );

  return (
    equipmentAvailable &&
    capabilitiesAvailable
  );
}
