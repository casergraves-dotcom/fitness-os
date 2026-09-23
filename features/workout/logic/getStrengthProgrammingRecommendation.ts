import { exerciseLibrary } from "../exerciseLibrary.ts";
import { strengthWorkoutIntents } from "../backupWorkoutModel.ts";
import type { Exercise, StrengthMovementRole, StrengthWorkoutType, WorkoutEquipment } from "../types";
import type { StrengthProgrammingProfile } from "../strengthProgrammingProfile.ts";
import type { StrengthProgrammingRecommendation } from "./strengthProgrammingRecommendation.ts";

const MINIMUM_FULL_SESSIONS_FOR_BUILD = 6;

export type StrengthProgrammingAssessmentStatus =
  | "InsufficientEvidence"
  | "NoChange"
  | "Ready";

export interface StrengthProgrammingRecommendationInput {
  workoutType: StrengthWorkoutType;
  template: Exercise[];
  profile: StrengthProgrammingProfile;
  completedFullSessionsForWorkout: number;
  recoverySupportsBuild: boolean;
  recoveryCallsForReduction: boolean;
  availableEquipment: WorkoutEquipment[];
  fixedCommitmentConstrainedRoles: StrengthMovementRole[];
  recommendationId: string;
  createdAt: string;
}

export interface StrengthProgrammingRecommendationAssessment {
  status: StrengthProgrammingAssessmentStatus;
  explanation: string;
  recommendation: StrengthProgrammingRecommendation | null;
}

function getExerciseRoles(exercise: Exercise): StrengthMovementRole[] {
  if (!exercise.exerciseDefinitionId) return [];

  return (
    exerciseLibrary.find(
      (definition) => definition.id === exercise.exerciseDefinitionId
    )?.movementRoles ?? []
  );
}

function hasAnyRole(exercise: Exercise, roles: StrengthMovementRole[]) {
  return getExerciseRoles(exercise).some((role) => roles.includes(role));
}

function hasRequiredEquipment(
  exercise: Exercise,
  availableEquipment: WorkoutEquipment[]
) {
  if (!exercise.exerciseDefinitionId) return false;
  const definition = exerciseLibrary.find(
    (item) => item.id === exercise.exerciseDefinitionId
  );
  if (!definition) return false;
  return (definition.requiredEquipment ?? []).every((item) =>
    availableEquipment.includes(item)
  );
}

export function getStrengthProgrammingRecommendation(
  input: StrengthProgrammingRecommendationInput
): StrengthProgrammingRecommendationAssessment {
  if (input.profile.volumeBias === "Build") {
    if (
      input.completedFullSessionsForWorkout < MINIMUM_FULL_SESSIONS_FOR_BUILD ||
      !input.recoverySupportsBuild
    ) {
      return {
        status: "InsufficientEvidence",
        explanation: `Keep the current template while Fitness OS collects ${MINIMUM_FULL_SESSIONS_FOR_BUILD} full ${input.workoutType} sessions and confirms recovery supports more volume.`,
        recommendation: null,
      };
    }

    const candidate = input.template.find(
      (exercise) =>
        exercise.sets.length < 4 &&
        hasAnyRole(exercise, input.profile.priorityMovementRoles) &&
        !hasAnyRole(exercise, input.profile.constrainedIncreaseRoles) &&
        !hasAnyRole(exercise, input.fixedCommitmentConstrainedRoles) &&
        hasRequiredEquipment(exercise, input.availableEquipment)
    );

    if (!candidate) {
      return {
        status: "NoChange",
        explanation:
          "The current template has no eligible priority exercise that can safely increase around fixed commitments and the available gym equipment.",
        recommendation: null,
      };
    }

    return {
      status: "Ready",
      explanation: `A small ${input.workoutType} volume increase is ready for review.`,
      recommendation: {
        id: input.recommendationId,
        profileVersion: input.profile.version,
        createdAt: input.createdAt,
        summary: `Add one set to ${candidate.name}.`,
        reassessAfterCompletedStrengthSessions: 6,
        changes: [
          {
            exerciseId: candidate.id,
            exerciseName: candidate.name,
            currentSetCount: candidate.sets.length,
            proposedSetCount: candidate.sets.length + 1,
            reason:
              input.fixedCommitmentConstrainedRoles.length > 0
                ? "This priority movement has enough full-session evidence and does not add overlapping fatigue next to a fixed commitment."
                : "This priority movement has enough full-session evidence for one incremental set increase.",
          },
        ],
      },
    };
  }

  if (input.profile.volumeBias === "Conserve") {
    if (!input.recoveryCallsForReduction) {
      return {
        status: "NoChange",
        explanation:
          "Conserve means avoiding unnecessary added volume; it does not automatically remove useful work when recovery is stable.",
        recommendation: null,
      };
    }

    const requiredRoles = strengthWorkoutIntents[input.workoutType].roles
      .filter((role) => role.required)
      .map((role) => role.role);
    const candidate = [...input.template]
      .reverse()
      .find(
        (exercise) =>
          exercise.sets.length > 2 && !hasAnyRole(exercise, requiredRoles)
      );

    if (!candidate) {
      return {
        status: "NoChange",
        explanation:
          "Recovery calls for caution, but this template has no non-required exercise that can safely lose one set.",
        recommendation: null,
      };
    }

    return {
      status: "Ready",
      explanation: `A small ${input.workoutType} recovery adjustment is ready for review.`,
      recommendation: {
        id: input.recommendationId,
        profileVersion: input.profile.version,
        createdAt: input.createdAt,
        summary: `Remove one set from ${candidate.name}.`,
        reassessAfterCompletedStrengthSessions: 3,
        changes: [
          {
            exerciseId: candidate.id,
            exerciseName: candidate.name,
            currentSetCount: candidate.sets.length,
            proposedSetCount: candidate.sets.length - 1,
            reason:
              "Recovery evidence supports a temporary one-set reduction from a non-required movement.",
          },
        ],
      },
    };
  }

  return {
    status: "NoChange",
    explanation:
      "The current goal and emphasis support maintaining the existing template volume.",
    recommendation: null,
  };
}
