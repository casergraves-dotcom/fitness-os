import type {
  TrainingPlanState,
} from "../types";

import {
  applyTrainingActivityReschedule,
} from "./applyTrainingActivityReschedule";

import {
  evaluateScheduleConflicts,
} from "./evaluateScheduleConflicts";

import type {
  ScheduleConflict,
  ScheduleConflictEvaluation,
} from "./evaluateScheduleConflicts";

import {
  getResolvedWeeklyActivityOccurrences,
} from "./getResolvedWeeklyActivityOccurrences";

import {
  classifyOptionalScheduleConflict,
} from "./classifyOptionalScheduleConflict";

import type {
  OptionalScheduleConflictResolution,
} from "./classifyOptionalScheduleConflict";
import {
  getTrainingWeekStart,
} from "@/lib/date/trainingWeek";


// ============================================================
// Types
// ============================================================

export interface WeeklyScheduleRearrangementMove {
  trainingActivityId:
    string;

  originalDate:
    string;

  scheduledDate:
    string;
}

export interface WeeklyScheduleUnavailableViolation {
  trainingActivityId:
    string;

  originalDate:
    string;

  scheduledDate:
    string;
}


export type WeeklyScheduleRearrangementStatus =
  | "Recommended"
  | "Acceptable"
  | "Caution"
  | "Avoid";


export interface EvaluateWeeklyScheduleRearrangementInput {
  state:
    TrainingPlanState;

  weekStartDate:
    string;

  moves:
    WeeklyScheduleRearrangementMove[];

  unavailableDates?:
    string[];
}


export interface ResolvableOptionalScheduleConflict {
  conflict:
    ScheduleConflict;

  resolution:
    OptionalScheduleConflictResolution;
}


export interface WeeklyScheduleRearrangementEvaluation {
  proposedState:
    TrainingPlanState;

  moves:
    WeeklyScheduleRearrangementMove[];

  // Blocking conflicts only. Optional-session conflicts that can
  // be resolved adaptively are reported separately below.
  conflicts:
    ScheduleConflict[];

  resolvableOptionalConflicts:
    ResolvableOptionalScheduleConflict[];

  unavailableViolations:
    WeeklyScheduleUnavailableViolation[];

  status:
    WeeklyScheduleRearrangementStatus;

  score:
    number;

  hasHighConflict:
    boolean;

  hasAnyConflict:
    boolean;

  reason:
    string;
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
    Number(match[1]);

  const month =
    Number(match[2]);

  const day =
    Number(match[3]);

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


function getCanonicalWeekStart(
  date: Date
) {
  return getTrainingWeekStart(date);
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


function addDays(
  date: Date,
  days: number
) {
  const result =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

  result.setDate(
    result.getDate() +
      days
  );

  return result;
}


function getDayDistance(
  firstDate: string,
  secondDate: string
) {
  const first =
    parseLocalDate(
      firstDate
    );

  const second =
    parseLocalDate(
      secondDate
    );

  if (
    !first ||
    !second
  ) {
    return 0;
  }

  const firstUtc =
    Date.UTC(
      first.getFullYear(),
      first.getMonth(),
      first.getDate()
    );

  const secondUtc =
    Date.UTC(
      second.getFullYear(),
      second.getMonth(),
      second.getDate()
    );

  return Math.abs(
    Math.round(
      (
        secondUtc -
        firstUtc
      ) /
        86_400_000
    )
  );
}


// ============================================================
// Conflict Helpers
// ============================================================

function getConflictKey(
  conflict: ScheduleConflict
) {
  const first =
    `${conflict.first.date}:${conflict.first.activity.id}`;

  const second =
    `${conflict.second.date}:${conflict.second.activity.id}`;

  const ordered =
    [first, second]
      .sort()
      .join("|");

  return [
    conflict.kind,
    conflict.severity,
    ordered,
  ].join("|");
}


function getRelevantWeekStarts(
  weekStartDate: string,
  moves:
    WeeklyScheduleRearrangementMove[]
) {
  const weekStarts =
    new Set<string>();


  const targetWeekStart =
    parseLocalDate(
      weekStartDate
    );


  if (!targetWeekStart) {
    return [];
  }


  // ----------------------------------------------------------
  // Target Week + Boundaries
  // ----------------------------------------------------------
  //
  // Always evaluate the immediately preceding and following
  // calendar weeks as well.
  //
  // This prevents a rearrangement from appearing safe only
  // because a conflict falls just outside the Sunday-Saturday
  // planning window. For example, moving a full-body strength
  // session to Sunday must still be evaluated against the
  // following Monday's prescribed strength session.

  weekStarts.add(
    formatLocalDate(
      addDays(
        targetWeekStart,
        -7
      )
    )
  );


  weekStarts.add(
    weekStartDate
  );


  weekStarts.add(
    formatLocalDate(
      addDays(
        targetWeekStart,
        7
      )
    )
  );


  // ----------------------------------------------------------
  // Destination Weeks
  // ----------------------------------------------------------
  //
  // Keep supporting cross-week moves. If a proposed move lands
  // outside the target week, include that destination's week
  // plus its adjacent weeks so the destination is evaluated in
  // its surrounding training context too.

  for (
    const move
    of moves
  ) {
    const destination =
      parseLocalDate(
        move.scheduledDate
      );


    if (!destination) {
      continue;
    }


    const destinationMonday =
      getCanonicalWeekStart(
        destination
      );


    weekStarts.add(
      formatLocalDate(
        addDays(
          destinationMonday,
          -7
        )
      )
    );


    weekStarts.add(
      formatLocalDate(
        destinationMonday
      )
    );


    weekStarts.add(
      formatLocalDate(
        addDays(
          destinationMonday,
          7
        )
      )
    );
  }


  return Array.from(
    weekStarts
  );
}


function getConflictOccurrences(
  state: TrainingPlanState,
  weekStarts: string[]
) {
  return weekStarts.flatMap(
    (weekStart) => {
      const occurrences =
        getResolvedWeeklyActivityOccurrences(
          state,
          weekStart
        );

      if (!occurrences) {
        return [];
      }

      return occurrences.map(
        (occurrence) => ({
          date:
            occurrence.date,

          activity:
            occurrence.activity,
        })
      );
    }
  );
}


function getResolvedOccurrences(
  state: TrainingPlanState,
  weekStarts: string[]
) {
  return weekStarts.flatMap(
    (weekStart) =>
      getResolvedWeeklyActivityOccurrences(
        state,
        weekStart
      ) ??
      []
  );
}


// ============================================================
// Apply Rearrangement
// ============================================================

function applyMoves(
  state: TrainingPlanState,
  moves:
    WeeklyScheduleRearrangementMove[]
) {
  return moves.reduce(
    (
      currentState,
      move,
      index
    ) =>
      applyTrainingActivityReschedule({
        state:
          currentState,

        trainingActivityId:
          move.trainingActivityId,

        originalDate:
          move.originalDate,

        scheduledDate:
          move.scheduledDate,

        rescheduledAt:
          new Date(
            Date.now() +
            index
          ).toISOString(),
      }),
    state
  );
}


// ============================================================
// Evaluate Rearrangement
// ============================================================

export function evaluateWeeklyScheduleRearrangement({
  state,
  weekStartDate,
  moves,
  unavailableDates = [],
}: EvaluateWeeklyScheduleRearrangementInput):
  WeeklyScheduleRearrangementEvaluation | null {

  if (
    !parseLocalDate(
      weekStartDate
    )
  ) {
    return null;
  }


  const proposedState =
    applyMoves(
      state,
      moves
    );


  const relevantWeekStarts =
    getRelevantWeekStarts(
      weekStartDate,
      moves
    );


  // ----------------------------------------------------------
  // Current Schedule Baseline
  // ----------------------------------------------------------

  const baselineOccurrences =
    getConflictOccurrences(
      state,
      relevantWeekStarts
    );

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
  // Prescribed Schedule Baseline
  // ----------------------------------------------------------
  //
  // As with single-move evaluation, conflicts inherent to the
  // original prescription should not be blamed on an adaptive
  // rearrangement.

  const prescribedState:
    TrainingPlanState = {
      ...state,

      activityReschedules:
        [],
    };


  const prescribedOccurrences =
    getConflictOccurrences(
      prescribedState,
      relevantWeekStarts
    );

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
  // Proposed Schedule
  // ----------------------------------------------------------

  const proposedOccurrences =
    getConflictOccurrences(
      proposedState,
      relevantWeekStarts
    );

  const proposedEvaluation:
    ScheduleConflictEvaluation =
    evaluateScheduleConflicts(
      proposedOccurrences
    );


  const introducedConflicts =
    proposedEvaluation.conflicts.filter(
      (conflict) => {
        const key =
          getConflictKey(
            conflict
          );

        return (
          !baselineConflictKeys.has(
            key
          ) &&
          !prescribedConflictKeys.has(
            key
          )
        );
      }
    );


  // ----------------------------------------------------------
  // Blocking vs Adaptively Resolvable Conflicts
  // ----------------------------------------------------------
  //
  // A conflict involving an optional session should not
  // automatically reject an otherwise sound rearrangement.
  // Preserve it as recommendation metadata so the later action
  // layer can decide whether to move, shorten, substitute, or
  // skip that optional occurrence.

  const conflicts:
    ScheduleConflict[] =
      [];

  const resolvableOptionalConflicts:
    ResolvableOptionalScheduleConflict[] =
      [];

  for (
    const conflict
    of introducedConflicts
  ) {
    const resolution =
      classifyOptionalScheduleConflict(
        conflict
      );

    if (
      resolution.resolvable
    ) {
      resolvableOptionalConflicts.push({
        conflict,
        resolution,
      });
    } else {
      conflicts.push(
        conflict
      );
    }
  }


  // ----------------------------------------------------------
  // Unavailable-Date Violations
  // ----------------------------------------------------------

  const unavailableSet =
    new Set(
      unavailableDates
    );


  const proposedResolvedOccurrences =
    getResolvedOccurrences(
      proposedState,
      relevantWeekStarts
    );


  const unavailableViolations =
    proposedResolvedOccurrences
      .filter(
        (occurrence) =>
          unavailableSet.has(
            occurrence.date
          )
      )
      .map(
        (occurrence) => ({
          trainingActivityId:
            occurrence.activity.id,

          originalDate:
            occurrence.originalDate,

          scheduledDate:
            occurrence.date,
        })
      );


  // ----------------------------------------------------------
  // Score
  // ----------------------------------------------------------
  //
  // Lower is better.
  //
  // Hard conflicts dominate.
  // Cautions matter.
  // More moves and larger changes are mildly penalized so the
  // planner prefers the smallest effective rearrangement.

  const highConflictCount =
    conflicts.filter(
      (conflict) =>
        conflict.severity ===
        "High"
    ).length;


  const cautionCount =
    conflicts.filter(
      (conflict) =>
        conflict.severity ===
        "Caution"
    ).length;


  const infoCount =
    conflicts.filter(
      (conflict) =>
        conflict.severity ===
        "Info"
    ).length;


  const optionalAdjustmentCount =
    resolvableOptionalConflicts.length;


  const totalMoveDistance =
    moves.reduce(
      (
        total,
        move
      ) =>
        total +
        getDayDistance(
          move.originalDate,
          move.scheduledDate
        ),
      0
    );


  const score =
    (
      unavailableViolations.length *
      1000
    ) +
    (
      highConflictCount *
      100
    ) +
    (
      cautionCount *
      25
    ) +
    (
      infoCount *
      5
    ) +
    (
      optionalAdjustmentCount *
      8
    ) +
    (
      moves.length *
      3
    ) +
    totalMoveDistance;


  // ----------------------------------------------------------
  // Status
  // ----------------------------------------------------------

  let status:
    WeeklyScheduleRearrangementStatus;


  if (
    unavailableViolations.length >
      0 ||
    highConflictCount >
      0
  ) {
    status =
      "Avoid";
  } else if (
    cautionCount >
    0
  ) {
    status =
      "Caution";
  } else if (
    optionalAdjustmentCount >
    0
  ) {
    status =
      "Acceptable";
  } else if (
    moves.length <=
      3
  ) {
    status =
      "Recommended";
  } else {
    status =
      "Acceptable";
  }


  // ----------------------------------------------------------
  // Explanation
  // ----------------------------------------------------------

  let reason:
    string;


  if (
    unavailableViolations.length >
    0
  ) {
    reason =
      "This rearrangement still schedules training on a date marked unavailable.";
  } else if (
    highConflictCount >
    0
  ) {
    reason =
      "This rearrangement introduces a high training-load conflict and should be avoided when a safer weekly arrangement exists.";
  } else if (
    cautionCount >
    0
  ) {
    reason =
      "This rearrangement resolves the unavailable day but still introduces a training-load caution.";
  } else if (
    optionalAdjustmentCount >
    0
  ) {
    reason =
      "This rearrangement resolves the unavailable day without a blocking training-load conflict, but one or more optional sessions must be adjusted.";
  } else if (
    moves.length <=
      3
  ) {
    reason =
      "This rearrangement resolves the unavailable day without introducing new training-load conflicts and keeps the number of schedule changes small.";
  } else {
    reason =
      "This rearrangement avoids new training-load conflicts but requires several schedule changes.";
  }


  return {
    proposedState,

    moves,

    conflicts,

    resolvableOptionalConflicts,

    unavailableViolations,

    status,

    score,

    hasHighConflict:
      highConflictCount >
      0,

    hasAnyConflict:
      conflicts.length >
      0,

    reason,
  };
}
