import type { CoachingTrainingEmphasis } from "@/features/coach/coachingPreferences";
import type { BodyCompositionGoalType } from "@/features/progress/bodyCompositionTypes";
import type { StrengthMovementRole } from "./types";

export const STRENGTH_PROGRAMMING_PROFILE_VERSION = 1 as const;

export type StrengthProgrammingVolumeBias =
  | "Conserve"
  | "Standard"
  | "Build";

export interface StrengthProgrammingProfileInput {
  primaryGoal: BodyCompositionGoalType;
  trainingEmphasis: CoachingTrainingEmphasis;
}

export interface StrengthProgrammingProfile {
  version: typeof STRENGTH_PROGRAMMING_PROFILE_VERSION;
  primaryGoal: BodyCompositionGoalType;
  trainingEmphasis: CoachingTrainingEmphasis;
  volumeBias: StrengthProgrammingVolumeBias;
  protectedMovementRoles: StrengthMovementRole[];
  priorityMovementRoles: StrengthMovementRole[];
  constrainedIncreaseRoles: StrengthMovementRole[];
  maximumSetIncreasePerExercise: 0 | 1;
  maximumSetReductionPerExercise: 0 | 1;
  fatigueConstraints: string[];
  rationale: string[];
}

const BASE_PROTECTED_ROLES: StrengthMovementRole[] = [
  "Squat",
  "HipHinge",
  "HorizontalPush",
  "HorizontalPull",
  "VerticalPull",
  "CoreStability",
];

const STRENGTH_PRIORITY_ROLES: StrengthMovementRole[] = [
  "SquatGlute",
  "HipHinge",
  "HorizontalPush",
  "HorizontalPull",
  "VerticalPull",
];

const RUNNING_SUPPORT_ROLES: StrengthMovementRole[] = [
  "HorizontalPush",
  "HorizontalPull",
  "VerticalPull",
  "CoreStability",
];

const RUNNING_CONSTRAINED_ROLES: StrengthMovementRole[] = [
  "Squat",
  "SquatGlute",
  "HipHinge",
  "KneeFlexion",
];

const AERIAL_SUPPORT_ROLES: StrengthMovementRole[] = [
  "VerticalPull",
  "HorizontalPull",
  "RearShoulder",
  "CoreStability",
  "CoreHipFlexion",
];

const AERIAL_CONSTRAINED_ROLES: StrengthMovementRole[] = [
  "VerticalPull",
  "HorizontalPull",
  "VerticalPush",
  "RearShoulder",
  "ElbowFlexion",
];

export function getStrengthProgrammingProfile(
  input: StrengthProgrammingProfileInput
): StrengthProgrammingProfile {
  const rationale: string[] = [];
  const fatigueConstraints: string[] = [];
  let volumeBias: StrengthProgrammingVolumeBias = "Standard";
  let priorityMovementRoles: StrengthMovementRole[] = [];
  let constrainedIncreaseRoles: StrengthMovementRole[] = [];

  if (input.primaryGoal === "FatLoss") {
    volumeBias = "Conserve";
    rationale.push(
      "Protect useful strength while keeping recoverable strength volume during a fat-loss phase."
    );
  } else if (input.primaryGoal === "Performance") {
    volumeBias = "Build";
    rationale.push(
      "Allow progressive strength volume when performance and recovery evidence support it."
    );
  } else {
    rationale.push(
      "Use standard strength volume unless recovery or progression evidence calls for a change."
    );
  }

  if (input.trainingEmphasis === "Strength") {
    volumeBias = input.primaryGoal === "FatLoss" ? "Standard" : "Build";
    rationale.push(
      "Prioritize strength development within the active goal and recovery safeguards."
    );
    priorityMovementRoles = [...STRENGTH_PRIORITY_ROLES];
  } else if (input.trainingEmphasis === "Running") {
    if (volumeBias === "Build") {
      volumeBias = "Standard";
    }
    fatigueConstraints.push(
      "Avoid adding lower-body strength volume that interferes with key running sessions."
    );
    rationale.push(
      "Keep strength supportive of running rather than competing with run progression."
    );
    priorityMovementRoles = [...RUNNING_SUPPORT_ROLES];
    constrainedIncreaseRoles = [...RUNNING_CONSTRAINED_ROLES];
  } else if (input.trainingEmphasis === "Aerial") {
    if (volumeBias === "Build") {
      volumeBias = "Standard";
    }
    fatigueConstraints.push(
      "Avoid adding pulling, grip, or shoulder volume adjacent to demanding aerial practice."
    );
    rationale.push(
      "Preserve strength support for aerial while managing pulling, grip, and shoulder fatigue."
    );
    priorityMovementRoles = [...AERIAL_SUPPORT_ROLES];
    constrainedIncreaseRoles = [...AERIAL_CONSTRAINED_ROLES];
  } else {
    rationale.push(
      "Keep strength, running, aerial practice, and recovery balanced across the week."
    );
  }

  return {
    version: STRENGTH_PROGRAMMING_PROFILE_VERSION,
    primaryGoal: input.primaryGoal,
    trainingEmphasis: input.trainingEmphasis,
    volumeBias,
    protectedMovementRoles: [...BASE_PROTECTED_ROLES],
    priorityMovementRoles,
    constrainedIncreaseRoles,
    maximumSetIncreasePerExercise: volumeBias === "Build" ? 1 : 0,
    maximumSetReductionPerExercise: volumeBias === "Conserve" ? 1 : 0,
    fatigueConstraints,
    rationale,
  };
}
