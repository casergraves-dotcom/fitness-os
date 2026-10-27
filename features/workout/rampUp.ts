import type {
  ExerciseDefinition,
  ExerciseSet,
  StrengthMovementRole,
} from "./types";

const RAMP_UP_MOVEMENT_ROLES = new Set<StrengthMovementRole>([
  "Squat",
  "SquatGlute",
  "HipHinge",
  "HipExtension",
  "HorizontalPush",
  "HorizontalPull",
  "VerticalPush",
  "VerticalPull",
]);

export function supportsExerciseRampUp(
  definition: ExerciseDefinition | undefined
) {
  return (
    definition?.resistanceType === "Weight" &&
    definition.performanceType !== "Duration" &&
    definition.movementRoles?.some((role) =>
      RAMP_UP_MOVEMENT_ROLES.has(role)
    ) === true
  );
}

export function createRampUpSet(
  id: string,
  workingWeight: number,
  index = 0
): ExerciseSet {
  const factors = [0.5, 0.7, 0.85];
  const reps = [8, 5, 3];
  const safeIndex = Math.min(index, factors.length - 1);

  return {
    id,
    weight: Math.round((workingWeight * factors[safeIndex]) / 5) * 5,
    reps: reps[safeIndex],
    completed: false,
  };
}
