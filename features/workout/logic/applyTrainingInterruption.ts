import type {
  TrainingInterruptionReason,
  TrainingPlanState,
} from "../types";

import {
  getReturnToTrainingDecision,
} from "./getReturnToTrainingDecision";


export interface ApplyTrainingInterruptionInput {
  state: TrainingPlanState;

  startedAt: string;

  resumedAt: string;

  reason:
    TrainingInterruptionReason;

  // Monday of the calendar week in which the user resumes
  // structured training.
  returnWeekStartDate: string;
}


export function applyTrainingInterruption({
  state,
  startedAt,
  resumedAt,
  reason,
  returnWeekStartDate,
}: ApplyTrainingInterruptionInput):
  TrainingPlanState {

  const decision =
    getReturnToTrainingDecision(
      startedAt,
      resumedAt,
      reason
    );


  // ----------------------------------------------------------
  // Short Interruption
  // ----------------------------------------------------------
  //
  // Week 7 means normal steady state can resume immediately.
  // There is therefore no temporary return-ramp overlay to
  // persist.

  if (
    decision.returnRampWeek ===
    7
  ) {
    return {
      ...state,

      trainingInterruption:
        undefined,
    };
  }


  // ----------------------------------------------------------
  // Re-ramp Required
  // ----------------------------------------------------------
  //
  // Preserve the entire existing TrainingPlanState and add only
  // the temporary return-to-training context.
  //
  // In particular, this does NOT change:
  // - startDate
  // - evaluated weeks
  // - weekly progression decisions
  // - strength/workout history
  // - adaptive running progression
  // - successful steady-state count
  // - deload history

  return {
    ...state,

    trainingInterruption: {
      startedAt,
      resumedAt,
      reason,

      returnRampWeek:
        decision.returnRampWeek,

      returnWeekStartDate,
    },
  };
}