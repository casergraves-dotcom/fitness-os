import {
  applyTrainingActivityAdjustment,
} from "./applyTrainingActivityAdjustment";

import {
  applyTrainingActivityReschedule,
} from "./applyTrainingActivityReschedule";

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


export interface ApplyAdaptiveScheduleRecommendationInput {
  state:
    TrainingPlanState;

  moves:
    AdaptiveScheduleRecommendationMove[];

  adjustments:
    AdaptiveScheduleRecommendationAdjustment[];

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
//
// Persistence belongs to the caller. This function only produces
// the next TrainingPlanState.
//

export function applyAdaptiveScheduleRecommendation({
  state,
  moves,
  adjustments,
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


  return nextState;
}
