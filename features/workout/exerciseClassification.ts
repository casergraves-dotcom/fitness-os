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

const MUSCLES_BY_MOVEMENT_ROLE: Record<StrengthMovementRole, {
  direct: ExerciseMuscleGroup[];
  secondary: ExerciseMuscleGroup[];
}> = {
  Squat: { direct: ["Quads", "Glutes"], secondary: [] },
  SquatGlute: { direct: ["Glutes", "Quads"], secondary: [] },
  HipExtension: { direct: ["Glutes"], secondary: ["Hamstrings"] },
  KneeFlexion: { direct: ["Hamstrings"], secondary: [] },
  HipHinge: { direct: ["Hamstrings", "Glutes"], secondary: ["Spinal Erectors"] },
  HorizontalPush: { direct: ["Chest"], secondary: ["Triceps", "Front Delts"] },
  HorizontalPull: { direct: ["Upper Back", "Lats"], secondary: ["Biceps"] },
  VerticalPush: { direct: ["Front Delts"], secondary: ["Triceps"] },
  VerticalPull: { direct: ["Lats", "Upper Back"], secondary: ["Biceps", "Forearms / Grip"] },
  HipStability: { direct: ["Hip Abductors"], secondary: ["Glutes"] },
  Adduction: { direct: ["Hip Adductors"], secondary: [] },
  CoreRotation: { direct: ["Obliques"], secondary: ["Abs"] },
  CoreFlexion: { direct: ["Abs"], secondary: [] },
  CoreStability: { direct: ["Abs", "Obliques"], secondary: [] },
  CoreHipFlexion: { direct: ["Hip Flexors", "Abs"], secondary: [] },
  ChestIsolation: { direct: ["Chest"], secondary: [] },
  ShoulderAbduction: { direct: ["Side Delts"], secondary: [] },
  RearShoulder: { direct: ["Rear Delts"], secondary: ["Upper Back"] },
  ElbowFlexion: { direct: ["Biceps"], secondary: ["Forearms / Grip"] },
  ElbowExtension: { direct: ["Triceps"], secondary: [] },
  CalfRaise: { direct: ["Calves"], secondary: [] },
  TrapElevation: { direct: ["Traps"], secondary: [] },
  ShoulderExternalRotation: { direct: ["Rotator Cuff"], secondary: ["Rear Delts"] },
  KneeExtension: { direct: ["Quads"], secondary: [] },
  LatIsolation: { direct: ["Lats"], secondary: [] },
  SpinalExtension: { direct: ["Spinal Erectors"], secondary: ["Glutes", "Hamstrings"] },
  Dorsiflexion: { direct: ["Tibialis"], secondary: [] },
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
  const contribution = getExerciseMuscleContribution(exercise);

  return [...new Set([...contribution.direct, ...contribution.secondary])];
}

export function getExerciseMuscleContribution(
  exercise: ExerciseDefinition
) {
  if (!exercise.movementRoles?.length) {
    return {
      direct: FALLBACK_MUSCLES_BY_CATEGORY[exercise.category],
      secondary: [] as ExerciseMuscleGroup[],
    };
  }

  const direct = exercise.movementRoles.flatMap(
    (role) => MUSCLES_BY_MOVEMENT_ROLE[role].direct
  );
  const secondary = exercise.movementRoles.flatMap(
    (role) => MUSCLES_BY_MOVEMENT_ROLE[role].secondary
  );

  return {
    direct: [...new Set(direct)],
    secondary: [...new Set(secondary)].filter((muscle) => !direct.includes(muscle)),
  };
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
