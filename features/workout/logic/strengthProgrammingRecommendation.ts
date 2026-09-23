import type { Exercise } from "../types";
import {
  applyStrengthTemplateSetChanges,
  type ApplyStrengthTemplateSetChangesOptions,
} from "./applyStrengthTemplateSetChanges.ts";

export interface StrengthProgrammingSetRecommendation {
  exerciseId: string;
  exerciseName: string;
  currentSetCount: number;
  proposedSetCount: number;
  reason: string;
}

export interface StrengthProgrammingRecommendation {
  id: string;
  profileVersion: number;
  createdAt: string;
  summary: string;
  changes: StrengthProgrammingSetRecommendation[];
  reassessAfterCompletedStrengthSessions: number;
}

export interface ApplyStrengthProgrammingRecommendationOptions
  extends ApplyStrengthTemplateSetChangesOptions {
  approved: boolean;
}

export function applyStrengthProgrammingRecommendation(
  template: Exercise[],
  recommendation: StrengthProgrammingRecommendation,
  options: ApplyStrengthProgrammingRecommendationOptions
): Exercise[] {
  if (!options.approved) {
    throw new Error(
      "A strength programming recommendation requires explicit approval before it can be applied."
    );
  }

  if (recommendation.changes.length === 0) {
    return template.map((exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) => ({ ...set })),
      rampUpSets: exercise.rampUpSets?.map((set) => ({ ...set })),
    }));
  }

  for (const change of recommendation.changes) {
    if (!change.reason.trim()) {
      throw new Error(
        `Strength programming change is missing a reason: ${change.exerciseId}`
      );
    }

    const exercise = template.find(
      (candidate) => candidate.id === change.exerciseId
    );

    if (!exercise || exercise.sets.length !== change.currentSetCount) {
      throw new Error(
        `Strength programming recommendation is stale: ${change.exerciseId}`
      );
    }
  }

  if (recommendation.reassessAfterCompletedStrengthSessions < 1) {
    throw new Error(
      "A strength programming recommendation must define a future reassessment point."
    );
  }

  return applyStrengthTemplateSetChanges(
    template,
    recommendation.changes.map((change) => ({
      exerciseId: change.exerciseId,
      nextSetCount: change.proposedSetCount,
    })),
    options
  );
}
