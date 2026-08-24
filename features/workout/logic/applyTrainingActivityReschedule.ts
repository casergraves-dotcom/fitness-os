import type {
  TrainingPlanState,
} from "../types";


export interface ApplyTrainingActivityRescheduleInput {
  state:
    TrainingPlanState;

  trainingActivityId:
    string;

  originalDate:
    string;

  scheduledDate:
    string;

  rescheduledAt:
    string;
}


export function applyTrainingActivityReschedule({
  state,
  trainingActivityId,
  originalDate,
  scheduledDate,
  rescheduledAt,
}: ApplyTrainingActivityRescheduleInput):
  TrainingPlanState {

  const existing =
    state.activityReschedules ??
    [];


  // ----------------------------------------------------------
  // Move Back To Original Date
  // ----------------------------------------------------------
  //
  // If the destination equals the original date, there is no
  // longer an active reschedule for this occurrence.

  if (
    scheduledDate ===
    originalDate
  ) {
    const nextReschedules =
      existing.filter(
        (item) =>
          !(
            item.trainingActivityId ===
              trainingActivityId &&
            item.originalDate ===
              originalDate
          )
      );

    if (
      nextReschedules.length ===
      existing.length
    ) {
      return state;
    }

    return {
      ...state,

      activityReschedules:
        nextReschedules,
    };
  }


  // ----------------------------------------------------------
  // Replace Existing Move
  // ----------------------------------------------------------
  //
  // One original scheduled occurrence can have at most one
  // active destination.
  //
  // Moving it again updates the existing record rather than
  // stacking multiple moves.

  const nextReschedule = {
    trainingActivityId,
    originalDate,
    scheduledDate,
    rescheduledAt,
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
    existingIndex >=
    0
  ) {
    const nextReschedules = [
      ...existing,
    ];

    nextReschedules[
      existingIndex
    ] =
      nextReschedule;

    return {
      ...state,

      activityReschedules:
        nextReschedules,
    };
  }


  // ----------------------------------------------------------
  // New Move
  // ----------------------------------------------------------

  return {
    ...state,

    activityReschedules: [
      ...existing,
      nextReschedule,
    ],
  };
}