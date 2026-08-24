import {
  applyTrainingActivityAdjustment,
} from "./applyTrainingActivityAdjustment";

import {
  applyTrainingActivityReschedule,
} from "./applyTrainingActivityReschedule";

import {
  applyTrainingActivityVariantOverride,
} from "./applyTrainingActivityVariantOverride";

import type {
  TrainingActivityAdjustmentAction,
  TrainingPlanState,
} from "../types";


// ============================================================
// Types
// ============================================================

export interface AdaptiveScheduleRecommendationMove {
  trainingActivityId:
    string;

  originalDate:
    string;

  scheduledDate:
    string;
}


export interface AdaptiveScheduleRecommendationAdjustment {
  trainingActivityId:
    string;

  originalDate:
    string;

  action:
    TrainingActivityAdjustmentAction;

  substituteTrainingActivityId?:
    string;
}


export interface AdaptiveScheduleRecommendationVariantOverride {
  trainingActivityId:
    string;

  originalDate:
    string;

  strengthWorkoutVariantId:
    string;
}


export interface ApplyAdaptiveScheduleRecommendationInput {
  state:
    TrainingPlanState;

  moves:
    AdaptiveScheduleRecommendationMove[];

  adjustments:
    AdaptiveScheduleRecommendationAdjustment[];

  variantOverrides:
    AdaptiveScheduleRecommendationVariantOverride[];

  appliedAt:
    string;
}


// ============================================================
// Apply Adaptive Schedule Recommendation
// ============================================================
//
// Applies the complete accepted recommendation as one pure state
// transition:
//
//   1. coordinated date moves
//   2. optional Skip/Substitute occurrence adjustments
//   3. per-occurrence strength-workout variant overrides
//
// Persistence belongs to the caller. This function only produces
// the next TrainingPlanState.
//

export function applyAdaptiveScheduleRecommendation({
  state,
  moves,
  adjustments,
  variantOverrides,
  appliedAt,
}: ApplyAdaptiveScheduleRecommendationInput):
  TrainingPlanState {

  let nextState =
    state;


  for (
    const move
    of moves
  ) {
    nextState =
      applyTrainingActivityReschedule({
        state:
          nextState,

        trainingActivityId:
          move.trainingActivityId,

        originalDate:
          move.originalDate,

        scheduledDate:
          move.scheduledDate,

        rescheduledAt:
          appliedAt,
      });
  }


  for (
    const adjustment
    of adjustments
  ) {
    nextState =
      applyTrainingActivityAdjustment({
        state:
          nextState,

        trainingActivityId:
          adjustment.trainingActivityId,

        originalDate:
          adjustment.originalDate,

        action:
          adjustment.action,

        substituteTrainingActivityId:
          adjustment.substituteTrainingActivityId,

        adjustedAt:
          appliedAt,
      });
  }


  for (
    const variantOverride
    of variantOverrides
  ) {
    nextState =
      applyTrainingActivityVariantOverride({
        state:
          nextState,

        trainingActivityId:
          variantOverride.trainingActivityId,

        originalDate:
          variantOverride.originalDate,

        strengthWorkoutVariantId:
          variantOverride.strengthWorkoutVariantId,

        overriddenAt:
          appliedAt,
      });
  }


  return nextState;
}
