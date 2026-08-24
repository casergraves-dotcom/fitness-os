import {
  fitnessOsTrainingPlan,
} from "../trainingPlan";

import type {
  TrainingActivity,
  TrainingDay,
  TrainingPlanState,
} from "../types";

import {
  getTrainingScheduleForDate,
} from "../utils/getTrainingScheduleForDate";


export interface ResolvedWeeklyActivityOccurrence {
  // Date on which the activity is CURRENTLY scheduled.
  //
  // This may differ from originalDate after rescheduling.
  date: string;

  // Date on which this occurrence was originally prescribed.
  //
  // This determines which calendar week owns the occurrence
  // for adherence/progression purposes.
  originalDate: string;

  // Destination weekday after any rescheduling.
  day: TrainingDay["day"];

  // Fully resolved activity prescription.
  activity: TrainingActivity;
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


function addCalendarDays(
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


function getDayName(
  date: Date
): TrainingDay["day"] {
  const days:
    TrainingDay["day"][] = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

  return days[
    date.getDay()
  ];
}


// ============================================================
// Reschedule Lookup
// ============================================================

function getRescheduleForOccurrence(
  state: TrainingPlanState,
  trainingActivityId: string,
  originalDate: string
) {
  return (
    state.activityReschedules ??
    []
  ).find(
    (item) =>
      item.trainingActivityId ===
        trainingActivityId &&
      item.originalDate ===
        originalDate
  );
}


// ============================================================
// Resolve Weekly Activity Occurrences
// ============================================================
//
// Ownership rule:
//
// An activity occurrence belongs to the calendar week in which
// it was ORIGINALLY prescribed.
//
// Rescheduling changes when that occurrence should be performed,
// but does not transfer adherence/progression ownership into the
// destination calendar week.
//
// This is particularly important for:
//
//   Sunday -> next Monday
//
// The moved Sunday activity remains part of the original week's
// adherence even though its current scheduled date is Monday.
//
// ============================================================

export function getResolvedWeeklyActivityOccurrences(
  state: TrainingPlanState,
  weekStartDate: string
): ResolvedWeeklyActivityOccurrence[] | null {
  const weekStart =
    parseLocalDate(
      weekStartDate
    );

  if (!weekStart) {
    return null;
  }

  const occurrences:
    ResolvedWeeklyActivityOccurrence[] =
      [];


  // ----------------------------------------------------------
  // Resolve Original Monday-Sunday Occurrences
  // ----------------------------------------------------------
  //
  // We intentionally resolve each ORIGINAL date with activity
  // rescheduling temporarily removed.
  //
  // That tells us which occurrences belong to this week before
  // any of them are moved elsewhere.

  const stateWithoutReschedules:
    TrainingPlanState = {
      ...state,

      activityReschedules:
        [],
    };


  for (
    let offset = 0;
    offset < 7;
    offset += 1
  ) {
    const originalDate =
      addCalendarDays(
        weekStart,
        offset
      );

    const originalDateString =
      formatLocalDate(
        originalDate
      );

    const originalSchedule =
      getTrainingScheduleForDate(
        fitnessOsTrainingPlan,
        stateWithoutReschedules,
        originalDate
      );

    if (!originalSchedule) {
      continue;
    }


    for (
      const originalActivity
      of originalSchedule
        .trainingDay
        .activities
    ) {
      const reschedule =
        getRescheduleForOccurrence(
          state,
          originalActivity.id,
          originalDateString
        );


      // --------------------------------------------------------
      // Not Rescheduled
      // --------------------------------------------------------

      if (!reschedule) {
        occurrences.push({
          date:
            originalDateString,

          originalDate:
            originalDateString,

          day:
            originalSchedule
              .dayOfWeek,

          activity:
            originalActivity,
        });

        continue;
      }


      // --------------------------------------------------------
      // Rescheduled
      // --------------------------------------------------------

      const destinationDate =
        parseLocalDate(
          reschedule.scheduledDate
        );

      if (!destinationDate) {
        // Invalid persisted destination should not silently
        // erase the original adherence requirement.
        occurrences.push({
          date:
            originalDateString,

          originalDate:
            originalDateString,

          day:
            originalSchedule
              .dayOfWeek,

          activity:
            originalActivity,
        });

        continue;
      }


      // Resolve the destination through the PUBLIC resolver.
      //
      // This lets us retrieve the exact moved occurrence after
      // all schedule overlays have been applied.

      const destinationSchedule =
        getTrainingScheduleForDate(
          fitnessOsTrainingPlan,
          state,
          destinationDate
        );

      const movedActivity =
        destinationSchedule
          ?.trainingDay
          .activities
          .find(
            (activity) =>
              activity.id ===
              originalActivity.id
          );


      // If persisted state is inconsistent for some reason,
      // preserve the original requirement rather than dropping
      // it from adherence.

      if (!movedActivity) {
        occurrences.push({
          date:
            originalDateString,

          originalDate:
            originalDateString,

          day:
            originalSchedule
              .dayOfWeek,

          activity:
            originalActivity,
        });

        continue;
      }


      occurrences.push({
        date:
          reschedule.scheduledDate,

        originalDate:
          originalDateString,

        day:
          getDayName(
            destinationDate
          ),

        activity:
          movedActivity,
      });
    }
  }


  return occurrences;
}