import type {
  TrainingPlanState,
} from "../types";
import { parseLocalCalendarDate } from "../../../lib/date/trainingWeek.ts";


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

  overrideRecurringPlacement?: boolean;
}


export function applyTrainingActivityReschedule({
  state,
  trainingActivityId,
  originalDate,
  scheduledDate,
  rescheduledAt,
  overrideRecurringPlacement = false,
}: ApplyTrainingActivityRescheduleInput):
  TrainingPlanState {

  // A user-added activity is already a dated schedule instance. Move that
  // instance directly; it has no recurring-plan occurrence to overlay.
  const adHocEntry = (state.adHocActivities ?? []).find(
    (entry) => entry.activity.id === trainingActivityId,
  );
  if (adHocEntry) {
    if (
      adHocEntry.date !== originalDate ||
      !parseLocalCalendarDate(scheduledDate) ||
      scheduledDate < state.startDate ||
      scheduledDate === adHocEntry.date
    ) return state;

    return {
      ...state,
      adHocActivities: (state.adHocActivities ?? []).map((entry) =>
        entry.activity.id === trainingActivityId
          ? { ...entry, date: scheduledDate }
          : entry,
      ),
    };
  }

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
      originalDate &&
    !overrideRecurringPlacement
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
    ...(overrideRecurringPlacement
      ? { overrideRecurringPlacement: true }
      : {}),
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
