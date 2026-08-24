import type {
  TrainingPlanState,
} from "../types";

import {
  applyTrainingActivityReschedule,
} from "./applyTrainingActivityReschedule";

import {
  getResolvedWeeklyActivityOccurrences,
} from "./getResolvedWeeklyActivityOccurrences";

import {
  evaluateScheduleConflicts,
} from "./evaluateScheduleConflicts";

import type {
  ScheduleConflict,
  ScheduleConflictEvaluation,
} from "./evaluateScheduleConflicts";


// ============================================================
// Types
// ============================================================

export interface EvaluateProposedActivityRescheduleInput {
  state:
    TrainingPlanState;

  trainingActivityId:
    string;

  originalDate:
    string;

  scheduledDate:
    string;
}


export interface ProposedActivityRescheduleEvaluation {
  proposedState:
    TrainingPlanState;

  conflicts:
    ScheduleConflict[];

  hasHighConflict:
    boolean;

  hasAnyConflict:
    boolean;
}


// ============================================================
// Date Helpers
// ============================================================

function parseLocalDate(
  value: string
): Date | null {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      value
    );

  if (!match) {
    return null;
  }

  const year =
    Number(
      match[1]
    );

  const month =
    Number(
      match[2]
    );

  const day =
    Number(
      match[3]
    );

  const date =
    new Date(
      year,
      month - 1,
      day
    );

  if (
    date.getFullYear() !==
      year ||
    date.getMonth() !==
      month - 1 ||
    date.getDate() !==
      day
  ) {
    return null;
  }

  return date;
}


function getMonday(
  date: Date
) {
  const result =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

  const day =
    result.getDay();

  const daysSinceMonday =
    day === 0
      ? 6
      : day - 1;

  result.setDate(
    result.getDate() -
      daysSinceMonday
  );

  return result;
}


function formatLocalDate(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


// ============================================================
// Conflict Helpers
// ============================================================

function isConflictAboutMovedOccurrence(
  conflict: ScheduleConflict,
  trainingActivityId: string,
  scheduledDate: string
) {
  const firstIsMoved =
    conflict.first.activity.id ===
      trainingActivityId &&
    conflict.first.date ===
      scheduledDate;

  const secondIsMoved =
    conflict.second.activity.id ===
      trainingActivityId &&
    conflict.second.date ===
      scheduledDate;

  return (
    firstIsMoved ||
    secondIsMoved
  );
}


function getConflictKey(
  conflict: ScheduleConflict
) {
  const first =
    `${conflict.first.date}:${conflict.first.activity.id}`;

  const second =
    `${conflict.second.date}:${conflict.second.activity.id}`;

  const orderedOccurrences =
    [first, second]
      .sort()
      .join("|");

  return [
    conflict.kind,
    conflict.severity,
    orderedOccurrences,
  ].join("|");
}


function getConflictOccurrences(
  state: TrainingPlanState,
  owningWeekStartDate: string,
  destinationWeekStartDate: string
) {
  const ownedOccurrences =
    getResolvedWeeklyActivityOccurrences(
      state,
      owningWeekStartDate
    );

  if (!ownedOccurrences) {
    return null;
  }

  const destinationOccurrences =
    destinationWeekStartDate ===
      owningWeekStartDate
      ? []
      : (
          getResolvedWeeklyActivityOccurrences(
            state,
            destinationWeekStartDate
          ) ??
          []
        );

  return [
    ...ownedOccurrences,
    ...destinationOccurrences,
  ].map(
    (occurrence) => ({
      date:
        occurrence.date,

      activity:
        occurrence.activity,
    })
  );
}


// ============================================================
// Evaluate Proposed Activity Reschedule
// ============================================================

export function evaluateProposedActivityReschedule({
  state,
  trainingActivityId,
  originalDate,
  scheduledDate,
}: EvaluateProposedActivityRescheduleInput):
  ProposedActivityRescheduleEvaluation | null {

  const original =
    parseLocalDate(
      originalDate
    );

  const destination =
    parseLocalDate(
      scheduledDate
    );

  if (
    !original ||
    !destination
  ) {
    return null;
  }


  // ----------------------------------------------------------
  // Apply Proposed Move To Temporary State
  // ----------------------------------------------------------

  const proposedState =
    applyTrainingActivityReschedule({
      state,

      trainingActivityId,

      originalDate,

      scheduledDate,

      rescheduledAt:
        new Date().toISOString(),
    });


  // ----------------------------------------------------------
  // Determine Relevant Weeks
  // ----------------------------------------------------------

  const owningWeekStartDate =
    formatLocalDate(
      getMonday(
        original
      )
    );

  const destinationWeekStartDate =
    formatLocalDate(
      getMonday(
        destination
      )
    );


  // ----------------------------------------------------------
  // Evaluate Baseline Schedule
  // ----------------------------------------------------------
  //
  // The baseline represents the schedule before the proposed
  // move. Existing conflicts should not be blamed on the move.

  const baselineOccurrences =
    getConflictOccurrences(
      state,
      owningWeekStartDate,
      destinationWeekStartDate
    );

  if (!baselineOccurrences) {
    return null;
  }

  const baselineEvaluation:
    ScheduleConflictEvaluation =
    evaluateScheduleConflicts(
      baselineOccurrences
    );

  const baselineConflictKeys =
    new Set(
      baselineEvaluation.conflicts.map(
        getConflictKey
      )
    );

      // ----------------------------------------------------------
  // Evaluate Original Prescribed Schedule
  // ----------------------------------------------------------
  //
  // The prescribed baseline removes activity-reschedule
  // overlays while preserving the rest of the training-plan
  // state.
  //
  // This prevents the reschedule UI from warning about a
  // relationship that is already part of the intended training
  // plan when an activity is restored to its original date.
  //
  // Example:
  //
  // Original:
  //   Monday Gym A
  //   Tuesday Aerial
  //
  // User moves Gym A to Wednesday, then restores it to Monday.
  //
  // Monday -> Tuesday adjacency is inherent to the prescribed
  // plan and should not be presented as a conflict introduced
  // by restoring Gym A.

  const prescribedState:
    TrainingPlanState = {
      ...state,

      activityReschedules:
        [],
    };


  const prescribedOccurrences =
    getConflictOccurrences(
      prescribedState,
      owningWeekStartDate,
      destinationWeekStartDate
    );

  if (!prescribedOccurrences) {
    return null;
  }


  const prescribedEvaluation:
    ScheduleConflictEvaluation =
    evaluateScheduleConflicts(
      prescribedOccurrences
    );


  const prescribedConflictKeys =
    new Set(
      prescribedEvaluation.conflicts.map(
        getConflictKey
      )
    );


  // ----------------------------------------------------------
  // Evaluate Proposed Schedule
  // ----------------------------------------------------------

  const proposedOccurrences =
    getConflictOccurrences(
      proposedState,
      owningWeekStartDate,
      destinationWeekStartDate
    );

  if (!proposedOccurrences) {
    return null;
  }

  const proposedEvaluation:
    ScheduleConflictEvaluation =
    evaluateScheduleConflicts(
      proposedOccurrences
    );


  // ----------------------------------------------------------
  // Return Only Newly Introduced Conflicts
  // ----------------------------------------------------------
  //
  // A proposed move should warn only when it introduces a
  // conflict that did not already exist in the current schedule.
  //
  // This also handles restoring an activity to its original
  // prescribed date without requiring a UI special case.

  const conflicts =
    proposedEvaluation.conflicts.filter(
      (conflict) => {
        if (
          !isConflictAboutMovedOccurrence(
            conflict,
            trainingActivityId,
            scheduledDate
          )
        ) {
          return false;
        }

        const key =
          getConflictKey(
            conflict
          );

        const alreadyExistsCurrently =
          baselineConflictKeys.has(
            key
          );

        const existsInPrescription =
          prescribedConflictKeys.has(
            key
          );

        return (
          !alreadyExistsCurrently &&
          !existsInPrescription
        );
      }
    );


  return {
    proposedState,

    conflicts,

    hasHighConflict:
      conflicts.some(
        (conflict) =>
          conflict.severity ===
          "High"
      ),

    hasAnyConflict:
      conflicts.length >
      0,
  };
}