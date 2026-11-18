import type {
  ExerciseDefinition,
  StrengthMovementRole,
  StrengthTrainingStyle,
  StrengthWorkoutIntent,
  StrengthWorkoutVariant,
} from "./types";

const LEGACY_STRENGTH_STYLE: StrengthTrainingStyle = "TraditionalStrength";

export interface StrengthWorkoutIntentCoverage {
  coveredRequiredRoles: StrengthMovementRole[];
  missingRequiredRoles: StrengthMovementRole[];
  coverageRate: number;
  satisfiesRequiredIntent: boolean;
}

export function getExerciseTrainingStyles(
  exercise: Pick<ExerciseDefinition, "trainingStyles">
): StrengthTrainingStyle[] {
  return exercise.trainingStyles?.length
    ? [...new Set(exercise.trainingStyles)]
    : [LEGACY_STRENGTH_STYLE];
}

export function getStrengthWorkoutVariantStyle(
  variant: Pick<StrengthWorkoutVariant, "trainingStyle">
): StrengthTrainingStyle {
  return variant.trainingStyle ?? LEGACY_STRENGTH_STYLE;
}

export function evaluateStrengthWorkoutIntentCoverage(
  variant: Pick<StrengthWorkoutVariant, "exercises">,
  intent: StrengthWorkoutIntent
): StrengthWorkoutIntentCoverage {
  const requiredRoles = intent.roles
    .filter((role) => role.required)
    .map((role) => role.role);
  const performedRoles = new Set(
    variant.exercises.map((exercise) => exercise.movementRole)
  );
  const coveredRequiredRoles = requiredRoles.filter((role) =>
    performedRoles.has(role)
  );
  const missingRequiredRoles = requiredRoles.filter(
    (role) => !performedRoles.has(role)
  );

  return {
    coveredRequiredRoles,
    missingRequiredRoles,
    coverageRate:
      requiredRoles.length > 0
        ? coveredRequiredRoles.length / requiredRoles.length
        : 1,
    satisfiesRequiredIntent: missingRequiredRoles.length === 0,
  };
}
