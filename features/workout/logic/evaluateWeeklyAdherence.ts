import type {
  TrainingActivity,
  TrainingActivityCompletion,
  TrainingDay,
  TrainingWeek,
} from "../types";

import type {
  ResolvedWeeklyActivityOccurrence,
} from "./getResolvedWeeklyActivityOccurrences";


// ============================================================
// Types
// ============================================================

export interface ScheduledActivityAdherence {
  date: string;

  day: TrainingDay["day"];

  activity: TrainingActivity;

  required: boolean;

  completed: boolean;

  completion?:
    TrainingActivityCompletion;
}


export interface SubstitutionGroupAdherence {
  group: string;

  activities:
    ScheduledActivityAdherence[];

  completed: boolean;
}


export interface WeeklyAdherenceResult {
  weekNumber: number;

  weekName: string;

  requiredCount: number;

  requiredCompleted: number;

  optionalCount: number;

  optionalCompleted: number;

  substitutionGroupCount: number;

  substitutionGroupsCompleted: number;

  adherenceRate: number;

  allRequiredCompleted: boolean;

  activities:
    ScheduledActivityAdherence[];

  substitutionGroups:
    SubstitutionGroupAdherence[];
}


// ============================================================
// Constants
// ============================================================

const DAY_OFFSETS:
  Record<TrainingDay["day"], number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };


// ============================================================
// Date Helpers
// ============================================================

function parseLocalDate(
  dateString: string
): Date | null {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      dateString
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
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
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
    result.getDate() + days
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
// Completion Matching
// ============================================================

function findCompletion(
  activity: TrainingActivity,
  date: string,
  completions:
    TrainingActivityCompletion[]
) {
  return completions.find(
    (completion) =>
      completion.trainingActivityId ===
        activity.id &&
      completion.date ===
        date
  );
}


// ============================================================
// Evaluate Weekly Adherence
// ============================================================

export function evaluateWeeklyAdherence(
  week: TrainingWeek,
  weekStartDate: string,
  completions:
    TrainingActivityCompletion[],
  resolvedOccurrences?:
    ResolvedWeeklyActivityOccurrence[]
): WeeklyAdherenceResult | null {
  // ----------------------------------------------------------
  // Individual Scheduled Activities
  // ----------------------------------------------------------
  //
  // When resolvedOccurrences is supplied, adherence follows the
  // current scheduled date of each occurrence while preserving
  // ownership by its original calendar week.
  //
  // Without resolvedOccurrences, retain the legacy static-week
  // behavior for backward compatibility with existing callers.

  const activities:
    ScheduledActivityAdherence[] = [];

  if (resolvedOccurrences) {
    for (
      const occurrence
      of resolvedOccurrences
    ) {
      const activity =
        occurrence.activity;

      const completion =
        findCompletion(
          activity,
          occurrence.date,
          completions
        );

      const belongsToSubstitutionGroup =
        Boolean(
          activity.substitutionGroup
        );

      const required =
        activity.optional !== true &&
        activity.type !== "Recovery" &&
        activity.type !== "Rest" &&
        !belongsToSubstitutionGroup;

      activities.push({
        date:
          occurrence.date,

        day:
          occurrence.day,

        activity,

        required,

        completed:
          completion !==
          undefined,

        completion,
      });
    }
  } else {
    const startDate =
      parseLocalDate(
        weekStartDate
      );

    if (!startDate) {
      return null;
    }

    for (
      const trainingDay
      of week.days
    ) {
      const dayOffset =
        DAY_OFFSETS[
          trainingDay.day
        ];

      const activityDate =
        formatLocalDate(
          addCalendarDays(
            startDate,
            dayOffset
          )
        );

      for (
        const activity
        of trainingDay.activities
      ) {
        const completion =
          findCompletion(
            activity,
            activityDate,
            completions
          );

        const belongsToSubstitutionGroup =
          Boolean(
            activity.substitutionGroup
          );

        const required =
          activity.optional !== true &&
          activity.type !== "Recovery" &&
          activity.type !== "Rest" &&
          !belongsToSubstitutionGroup;

        activities.push({
          date:
            activityDate,

          day:
            trainingDay.day,

          activity,

          required,

          completed:
            completion !==
            undefined,

          completion,
        });
      }
    }
  }


  // ----------------------------------------------------------
  // Substitution Groups
  // ----------------------------------------------------------
  //
  // Every unique substitutionGroup represents ONE training
  // requirement.
  //
  // Completing any activity in that group satisfies the group.

  const substitutionGroupMap =
    new Map<
      string,
      ScheduledActivityAdherence[]
    >();


  for (
    const item
    of activities
  ) {
    const group =
      item.activity
        .substitutionGroup;

    if (!group) {
      continue;
    }

    const existing =
      substitutionGroupMap.get(
        group
      ) ?? [];

    existing.push(item);

    substitutionGroupMap.set(
      group,
      existing
    );
  }


  const substitutionGroups:
    SubstitutionGroupAdherence[] =
    Array.from(
      substitutionGroupMap.entries()
    ).map(
      ([
        group,
        groupActivities,
      ]) => ({
        group,

        activities:
          groupActivities,

        completed:
          groupActivities.some(
            (item) =>
              item.completed
          ),
      })
    );


  // ----------------------------------------------------------
  // Required Individual Activities
  // ----------------------------------------------------------

  const requiredActivities =
    activities.filter(
      (item) =>
        item.required
    );

  const requiredActivitiesCompleted =
    requiredActivities.filter(
      (item) =>
        item.completed
    ).length;


  // ----------------------------------------------------------
  // Substitution Requirements
  // ----------------------------------------------------------

  const substitutionGroupCount =
    substitutionGroups.length;

  const substitutionGroupsCompleted =
    substitutionGroups.filter(
      (group) =>
        group.completed
    ).length;


  // ----------------------------------------------------------
  // Total Required Adherence
  // ----------------------------------------------------------
  //
  // A substitution group counts as ONE requirement regardless
  // of how many interchangeable activities are inside it.

  const requiredCount =
    requiredActivities.length +
    substitutionGroupCount;

  const requiredCompleted =
    requiredActivitiesCompleted +
    substitutionGroupsCompleted;


  // ----------------------------------------------------------
  // Optional Activities
  // ----------------------------------------------------------
  //
  // Only optional activities that are NOT members of a
  // substitution group count as ordinary optional work.

  const optionalActivities =
    activities.filter(
      (item) =>
        !item.required &&
        item.activity.optional ===
          true &&
        !item.activity
          .substitutionGroup
    );

  const optionalCompleted =
    optionalActivities.filter(
      (item) =>
        item.completed
    ).length;


  // ----------------------------------------------------------
  // Adherence Rate
  // ----------------------------------------------------------

  const adherenceRate =
    requiredCount === 0
      ? 1
      : requiredCompleted /
        requiredCount;


  // ----------------------------------------------------------
  // Result
  // ----------------------------------------------------------

  return {
    weekNumber:
      week.weekNumber,

    weekName:
      week.name,

    requiredCount,

    requiredCompleted,

    optionalCount:
      optionalActivities.length,

    optionalCompleted,

    substitutionGroupCount,

    substitutionGroupsCompleted,

    adherenceRate,

    allRequiredCompleted:
      requiredCompleted ===
      requiredCount,

    activities,

    substitutionGroups,
  };
}
