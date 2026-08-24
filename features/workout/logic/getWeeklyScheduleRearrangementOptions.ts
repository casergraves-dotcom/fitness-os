import type {
  TrainingPlanState,
} from "../types";

import type {
  RearrangementActivityOptions,
} from "./rankWeeklyScheduleRearrangements";

import {
  getResolvedWeeklyActivityOccurrences,
} from "./getResolvedWeeklyActivityOccurrences";


// ============================================================
// Types
// ============================================================

export interface GetWeeklyScheduleRearrangementOptionsInput {
  state:
    TrainingPlanState;

  weekStartDate:
    string;

  unavailableDates:
    string[];
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


function formatLocalDate(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

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


// ============================================================
// Candidate Dates
// ============================================================

function getWeekDates(
  weekStartDate: string
) {
  const weekStart =
    parseLocalDate(
      weekStartDate
    );

  if (!weekStart) {
    return [];
  }

  return Array.from(
    {
      length:
        7,
    },
    (
      _,
      index
    ) =>
      formatLocalDate(
        addDays(
          weekStart,
          index
        )
      )
  );
}


// ============================================================
// Rearrangement Options
// ============================================================

export function getWeeklyScheduleRearrangementOptions({
  state,
  weekStartDate,
  unavailableDates,
}: GetWeeklyScheduleRearrangementOptionsInput):
  RearrangementActivityOptions[] {

  const occurrences =
    getResolvedWeeklyActivityOccurrences(
      state,
      weekStartDate
    );

  if (!occurrences) {
    return [];
  }


  const unavailableSet =
    new Set(
      unavailableDates
    );


  const availableWeekDates =
    getWeekDates(
      weekStartDate
    ).filter(
      (date) =>
        !unavailableSet.has(
          date
        )
    );


  // ----------------------------------------------------------
  // Required Moves
  // ----------------------------------------------------------
  //
  // Every activity currently scheduled on an unavailable date
  // must participate in the search.
  //
  // Otherwise the planner could move one activity away from an
  // unavailable day while leaving another scheduled activity
  // behind on that same unavailable day.

  const requiredOccurrences =
    occurrences.filter(
      (occurrence) =>
        unavailableSet.has(
          occurrence.date
        )
    );


  // ----------------------------------------------------------
  // Supporting Strength Activities
  // ----------------------------------------------------------
  //
  // Other strength sessions in the week are allowed to
  // participate because moving an unavailable strength session
  // may require another strength session to shift in order to
  // preserve appropriate recovery spacing.
  //
  // We intentionally do NOT include every optional activity
  // here.
  //
  // rankWeeklyScheduleRearrangements currently evaluates the
  // Cartesian product of every participant and every candidate
  // date. Adding all optional activities here would therefore
  // cause the search space to grow exponentially.
  //
  // Optional aerial/running/substitution decisions will be
  // handled later by a bounded adaptive-search layer rather than
  // by expanding this exhaustive search.

  const supportingStrengthOccurrences =
    occurrences.filter(
      (occurrence) =>
        occurrence.activity.type ===
          "Strength" &&

        !unavailableSet.has(
          occurrence.date
        )
    );


  const participatingOccurrences =
    [
      ...requiredOccurrences,
      ...supportingStrengthOccurrences,
    ];


  // ----------------------------------------------------------
  // Build Search Options
  // ----------------------------------------------------------

  const seen =
    new Set<string>();


  return participatingOccurrences.flatMap(
    (occurrence) => {
      const key =
        [
          occurrence.activity.id,
          occurrence.originalDate,
        ].join(
          "|"
        );


      if (
        seen.has(
          key
        )
      ) {
        return [];
      }


      seen.add(
        key
      );


      return [
        {
          trainingActivityId:
            occurrence.activity.id,

          originalDate:
            occurrence.originalDate,

          candidateDates:
            availableWeekDates,
        },
      ];
    }
  );
}