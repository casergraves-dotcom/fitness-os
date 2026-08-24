import type {
  TrainingActivity,
  TrainingPlanState,
} from "../types";

import {
  getResolvedWeeklyActivityOccurrences,
} from "./getResolvedWeeklyActivityOccurrences";

import type {
  WeeklyScheduleRearrangementEvaluation,
} from "./evaluateWeeklyScheduleRearrangement";


// ============================================================
// Types
// ============================================================

export type OptionalScheduleAdjustmentAction =
  | "Substitute"
  | "Skip";


export interface OptionalScheduleAdjustmentRecommendation {
  action:
    OptionalScheduleAdjustmentAction;

  date:
    string;

  dayLabel:
    string;

  substitutionGroup?:
    string;

  conflictingActivities:
    TrainingActivity[];

  replacementActivity?:
    TrainingActivity;

  reason:
    string;
}


export interface RecommendOptionalScheduleAdjustmentsInput {
  state:
    TrainingPlanState;

  weekStartDate:
    string;

  evaluation:
    WeeklyScheduleRearrangementEvaluation;
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


function getDayLabel(
  value: string
) {
  const date =
    parseLocalDate(
      value
    );

  if (!date) {
    return value;
  }

  return [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ][
    date.getDay()
  ];
}


// ============================================================
// Helpers
// ============================================================

function getOptionalConflictDate(
  item:
    WeeklyScheduleRearrangementEvaluation[
      "resolvableOptionalConflicts"
    ][number],
  optionalActivityId:
    string
) {
  if (
    item.conflict.first.activity.id ===
    optionalActivityId
  ) {
    return item.conflict.first.date;
  }

  if (
    item.conflict.second.activity.id ===
    optionalActivityId
  ) {
    return item.conflict.second.date;
  }

  return "";
}


function uniqueActivities(
  activities:
    TrainingActivity[]
) {
  const byId =
    new Map<
      string,
      TrainingActivity
    >();

  for (
    const activity
    of activities
  ) {
    byId.set(
      activity.id,
      activity
    );
  }

  return Array.from(
    byId.values()
  );
}


// ============================================================
// Optional Schedule Adjustment Recommendations
// ============================================================

export function recommendOptionalScheduleAdjustments({
  state,
  weekStartDate,
  evaluation,
}: RecommendOptionalScheduleAdjustmentsInput):
  OptionalScheduleAdjustmentRecommendation[] {

  if (
    evaluation
      .resolvableOptionalConflicts
      .length ===
    0
  ) {
    return [];
  }


  const proposedOccurrences =
    getResolvedWeeklyActivityOccurrences(
      evaluation.proposedState,
      weekStartDate
    );


  if (!proposedOccurrences) {
    return [];
  }


  interface ConflictGroup {
    date:
      string;

    substitutionGroup?:
      string;

    conflictingActivities:
      TrainingActivity[];
  }


  const groups =
    new Map<
      string,
      ConflictGroup
    >();


  for (
    const item
    of evaluation
      .resolvableOptionalConflicts
  ) {
    const optionalActivity =
      item.resolution
        .optionalActivity;

    if (!optionalActivity) {
      continue;
    }


    const date =
      getOptionalConflictDate(
        item,
        optionalActivity.id
      );


    if (!date) {
      continue;
    }


    const substitutionGroup =
      item.resolution
        .substitutionGroup;


    const key =
      [
        date,
        substitutionGroup ??
          optionalActivity.id,
      ].join("|");


    const existing =
      groups.get(
        key
      );


    if (existing) {
      existing
        .conflictingActivities
        .push(
          optionalActivity
        );

      continue;
    }


    groups.set(
      key,
      {
        date,

        substitutionGroup,

        conflictingActivities: [
          optionalActivity,
        ],
      }
    );
  }


  const recommendations:
    OptionalScheduleAdjustmentRecommendation[] =
      [];


  for (
    const group
    of groups.values()
  ) {
    const conflictingActivities =
      uniqueActivities(
        group.conflictingActivities
      );


    // --------------------------------------------------------
    // Find A Safe Peer In The Same Substitution Group
    // --------------------------------------------------------
    //
    // Substitution groups already model OR choices in the
    // training plan:
    //
    // easy-cardio:
    //   Aerial OR run
    //
    // recovery-activity:
    //   Aerial OR recovery walk
    //
    // If another member of the same group is scheduled on this
    // date and is NOT itself present in the introduced optional
    // conflicts, it is a usable alternative.

    const conflictingIds =
      new Set(
        conflictingActivities.map(
          (activity) =>
            activity.id
        )
      );


    const alternatives =
      group.substitutionGroup
        ? proposedOccurrences
            .filter(
              (occurrence) =>
                occurrence.date ===
                  group.date &&

                occurrence
                  .activity
                  .optional ===
                  true &&

                occurrence
                  .activity
                  .substitutionGroup ===
                  group.substitutionGroup &&

                !conflictingIds.has(
                  occurrence
                    .activity
                    .id
                )
            )
            .map(
              (occurrence) =>
                occurrence.activity
            )
        : [];


    const replacementActivity =
      alternatives[0];


    if (replacementActivity) {
      recommendations.push({
        action:
          "Substitute",

        date:
          group.date,

        dayLabel:
          getDayLabel(
            group.date
          ),

        substitutionGroup:
          group.substitutionGroup,

        conflictingActivities,

        replacementActivity,

        reason:
          `${conflictingActivities.map(
            (activity) =>
              activity.label
          ).join(
            " / "
          )} conflicts with the proposed required training on ${getDayLabel(
            group.date
          )}. ${replacementActivity.label} is another optional choice in the same substitution group and does not appear in the introduced schedule conflicts.`,
      });

      continue;
    }


    // --------------------------------------------------------
    // No Safe Same-Group Alternative
    // --------------------------------------------------------
    //
    // Optional activities may be skipped without treating the
    // required training as missed. If every available member of
    // the substitution group conflicts, skipping the optional
    // group is preferable to weakening the required schedule
    // recommendation.

    recommendations.push({
      action:
        "Skip",

      date:
        group.date,

      dayLabel:
        getDayLabel(
          group.date
        ),

      substitutionGroup:
        group.substitutionGroup,

      conflictingActivities,

      reason:
        group.substitutionGroup
          ? `All currently available "${group.substitutionGroup}" choices on ${getDayLabel(
              group.date
            )} conflict with the proposed required training, so skipping that optional group is the cleanest resolution.`
          : `${conflictingActivities.map(
              (activity) =>
                activity.label
            ).join(
              " / "
            )} is optional and conflicts with the proposed required training, so skipping it is the cleanest resolution.`,
    });
  }


  return recommendations.sort(
    (
      first,
      second
    ) =>
      first.date.localeCompare(
        second.date
      )
  );
}
