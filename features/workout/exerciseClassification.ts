import type {
  ExerciseDefinition,
  ExerciseMuscleGroup,
  ExerciseProgrammingRole,
  StrengthMovementRole,
} from "./types";

export const EXERCISE_MUSCLE_GROUPS: ExerciseMuscleGroup[] = [
  "Chest",
  "Lats",
  "Upper Back",
  "Traps",
  "Front Delts",
  "Side Delts",
  "Rear Delts",
  "Rotator Cuff",
  "Biceps",
  "Triceps",
  "Forearms / Grip",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Hip Abductors",
  "Hip Adductors",
  "Calves",
  "Tibialis",
  "Abs",
  "Obliques",
  "Hip Flexors",
  "Spinal Erectors",
];

const PRIMARY_MOVEMENT_ROLES = new Set<StrengthMovementRole>([
  "Squat",
  "SquatGlute",
  "HipHinge",
  "HipExtension",
  "HorizontalPush",
  "HorizontalPull",
  "VerticalPush",
  "VerticalPull",
]);

const ACCESSORY_EXERCISE_IDS = new Set([
  "glute-bridge",
  "glute-kickback-machine",
]);

const MUSCLES_BY_MOVEMENT_ROLE: Record<StrengthMovementRole, ExerciseMuscleGroup[]> = {
  Squat: ["Quads", "Glutes"],
  SquatGlute: ["Glutes", "Quads"],
  HipExtension: ["Glutes", "Hamstrings"],
  KneeFlexion: ["Hamstrings"],
  HipHinge: ["Hamstrings", "Glutes", "Spinal Erectors"],
  HorizontalPush: ["Chest", "Triceps", "Front Delts"],
  HorizontalPull: ["Upper Back", "Lats", "Biceps"],
  VerticalPush: ["Front Delts", "Triceps"],
  VerticalPull: ["Lats", "Upper Back", "Biceps", "Forearms / Grip"],
  HipStability: ["Hip Abductors", "Glutes"],
  Adduction: ["Hip Adductors"],
  CoreRotation: ["Obliques", "Abs"],
  CoreFlexion: ["Abs"],
  CoreStability: ["Abs", "Obliques"],
  CoreHipFlexion: ["Hip Flexors", "Abs"],
  ChestIsolation: ["Chest"],
  ShoulderAbduction: ["Side Delts"],
  RearShoulder: ["Rear Delts", "Upper Back"],
  ElbowFlexion: ["Biceps", "Forearms / Grip"],
  ElbowExtension: ["Triceps"],
  CalfRaise: ["Calves"],
};

const FALLBACK_MUSCLES_BY_CATEGORY: Record<ExerciseDefinition["category"], ExerciseMuscleGroup[]> = {
  Chest: ["Chest"],
  Back: ["Upper Back"],
  Shoulders: ["Front Delts"],
  Arms: ["Biceps", "Triceps"],
  Legs: ["Quads", "Hamstrings", "Glutes"],
  Core: ["Abs"],
};

export function getExerciseProgrammingRole(
  exercise: ExerciseDefinition
): ExerciseProgrammingRole {
  if (ACCESSORY_EXERCISE_IDS.has(exercise.id)) return "Accessory";

  return exercise.movementRoles?.some((role) => PRIMARY_MOVEMENT_ROLES.has(role))
    ? "Primary"
    : "Accessory";
}

export function getExerciseMuscleGroups(
  exercise: ExerciseDefinition
): ExerciseMuscleGroup[] {
  const muscles = exercise.movementRoles?.flatMap(
    (role) => MUSCLES_BY_MOVEMENT_ROLE[role]
  ) ?? FALLBACK_MUSCLES_BY_CATEGORY[exercise.category];

  return [...new Set(muscles)];
}

export function getExerciseCoverageMatrix(exercises: ExerciseDefinition[]) {
  return EXERCISE_MUSCLE_GROUPS.map((muscleGroup) => {
    const matchingExercises = exercises.filter((exercise) =>
      getExerciseMuscleGroups(exercise).includes(muscleGroup)
    );

    return {
      muscleGroup,
      primary: matchingExercises.filter(
        (exercise) => getExerciseProgrammingRole(exercise) === "Primary"
      ),
      accessory: matchingExercises.filter(
        (exercise) => getExerciseProgrammingRole(exercise) === "Accessory"
      ),
    };
  });
}
