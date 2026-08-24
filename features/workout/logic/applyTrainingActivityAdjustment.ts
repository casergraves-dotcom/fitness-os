import type {
  TrainingActivityAdjustmentAction,
  TrainingPlanState,
} from "../types";


// ============================================================
// Types
// ============================================================

export interface ApplyTrainingActivityAdjustmentInput {
  state:
    TrainingPlanState;

  trainingActivityId:
    string;

  originalDate:
    string;

  action:
    TrainingActivityAdjustmentAction;

  substituteTrainingActivityId?:
    string;

  adjustedAt:
    string;
}


// ============================================================
// Apply Training Activity Adjustment
// ============================================================
//
// Applies or replaces one persisted Skip/Substitute decision for
// one scheduled occurrence.
//
// trainingActivityId + originalDate is the stable occurrence key.
//
// This function does not mutate the underlying training-plan
// template and does not decide whether the activity is optional.
// Schedule resolution is responsible for defensively refusing to
// suppress required training.
//

export function applyTrainingActivityAdjustment({
  state,
  trainingActivityId,
  originalDate,
  action,
  substituteTrainingActivityId,
  adjustedAt,
}: ApplyTrainingActivityAdjustmentInput):
  TrainingPlanState {

  if (
    action ===
      "Substitute" &&
    !substituteTrainingActivityId
  ) {
    return state;
  }


  const existing =
    state.activityAdjustments ??
    [];


  const nextAdjustment = {
    trainingActivityId,

    originalDate,

    action,

    substituteTrainingActivityId:
      action ===
      "Substitute"
        ? substituteTrainingActivityId
        : undefined,

    adjustedAt,
  };


  const existingIndex =
    existing.findIndex(
      (item) =>
        item.trainingActivityId ===
          trainingActivityId &&
        item.originalDate ===
          originalDate
    );


  if (
    existingIndex ===
    -1
  ) {
    return {
      ...state,

      activityAdjustments: [
        ...existing,
        nextAdjustment,
      ],
    };
  }


  const existingAdjustment =
    existing[
      existingIndex
    ];


  if (
    existingAdjustment.action ===
      nextAdjustment.action &&
    existingAdjustment
      .substituteTrainingActivityId ===
      nextAdjustment
        .substituteTrainingActivityId
  ) {
    return state;
  }


  const nextAdjustments =
    [
      ...existing,
    ];


  nextAdjustments[
    existingIndex
  ] =
    nextAdjustment;


  return {
    ...state,

    activityAdjustments:
      nextAdjustments,
  };
}
