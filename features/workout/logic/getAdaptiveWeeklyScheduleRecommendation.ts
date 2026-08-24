import type {
  TrainingActivityType,
  TrainingPlanState,
} from "../types";

import {
  getResolvedWeeklyActivityOccurrences,
} from "./getResolvedWeeklyActivityOccurrences";

import {
  getWeeklyScheduleRearrangementOptions,
} from "./getWeeklyScheduleRearrangementOptions";

import {
  searchAdaptiveWeeklyRearrangements,
} from "./searchAdaptiveWeeklyRearrangements";

import type {
  WeeklyScheduleRearrangementEvaluation,
  WeeklyScheduleRearrangementStatus,
} from "./evaluateWeeklyScheduleRearrangement";

import {
  recommendOptionalScheduleAdjustments,
} from "./recommendOptionalScheduleAdjustments";

import type {
  OptionalScheduleAdjustmentAction,
} from "./recommendOptionalScheduleAdjustments";


// ============================================================
// Types
// ============================================================

export interface AdaptiveWeeklyScheduleRecommendationMove {
  trainingActivityId:
    string;

  label:
    string;

  type:
    TrainingActivityType;

  originalDate:
    string;

  scheduledDate:
    string;

  originalDayLabel:
    string;

  scheduledDayLabel:
    string;
}


export interface AdaptiveWeeklyScheduleOptionalAdjustment {
  action:
    OptionalScheduleAdjustmentAction;

  scheduledDate:
    string;

  scheduledDayLabel:
    string;

  substitutionGroup?:
    string;

  conflictingActivities: {
    trainingActivityId:
      string;

    label:
      string;

    type:
      TrainingActivityType;
  }[];

  replacementActivity?: {
    trainingActivityId:
      string;

    label:
      string;

    type:
      TrainingActivityType;
  };

  reason:
    string;
}


export interface AdaptiveWeeklyScheduleRecommendation {
  status:
    WeeklyScheduleRearrangementStatus;

  summary:
    string;

  explanation:
    string;

  moves:
    AdaptiveWeeklyScheduleRecommendationMove[];

  optionalAdjustments:
    AdaptiveWeeklyScheduleOptionalAdjustment[];

  evaluation:
    WeeklyScheduleRearrangementEvaluation;
}


export interface GetAdaptiveWeeklyScheduleRecommendationInput {
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
// Recommendation Helpers
// ============================================================

function getOccurrenceKey(
  trainingActivityId:
    string,
  originalDate:
    string
) {
  return [
    trainingActivityId,
    originalDate,
  ].join("|");
}


function buildSummary(
  unavailableDates:
    string[],
  status:
    WeeklyScheduleRearrangementStatus
) {
  const unavailableLabel =
    unavailableDates.length ===
    1
      ? "the unavailable day"
      : `${unavailableDates.length} unavailable days`;

  if (
    status ===
    "Recommended"
  ) {
    return `I found a recommended way to rearrange this week around ${unavailableLabel}.`;
  }

  if (
    status ===
    "Acceptable"
  ) {
    return `I found a workable way to rearrange this week around ${unavailableLabel}.`;
  }

  if (
    status ===
    "Caution"
  ) {
    return `I found a possible rearrangement for ${unavailableLabel}, but it still needs caution.`;
  }

  return `I could not find a safe rearrangement for ${unavailableLabel}.`;
}


function buildExplanation(
  evaluation:
    WeeklyScheduleRearrangementEvaluation,
  optionalAdjustmentCount:
    number
) {
  if (
    evaluation.status ===
    "Recommended"
  ) {
    return "This plan clears the unavailable date without introducing a blocking training-load conflict and keeps the required schedule changes small.";
  }

  if (
    evaluation.status ===
      "Acceptable" &&
    optionalAdjustmentCount >
      0
  ) {
    const label =
      optionalAdjustmentCount ===
      1
        ? "1 optional session"
        : `${optionalAdjustmentCount} optional sessions`;

    return `This plan preserves the required training structure without a blocking conflict. I also found a concrete adjustment for ${label}.`;
  }

  return evaluation.reason;
}


// ============================================================
// Adaptive Weekly Schedule Recommendation
// ============================================================

export function getAdaptiveWeeklyScheduleRecommendation({
  state,
  weekStartDate,
  unavailableDates,
}: GetAdaptiveWeeklyScheduleRecommendationInput):
  AdaptiveWeeklyScheduleRecommendation | null {

  if (
    unavailableDates.length ===
    0
  ) {
    return null;
  }


  const activities =
    getWeeklyScheduleRearrangementOptions({
      state,
      weekStartDate,
      unavailableDates,
    });


  if (
    activities.length ===
    0
  ) {
    return null;
  }


  const ranked =
    searchAdaptiveWeeklyRearrangements({
      state,
      weekStartDate,
      activities,
      unavailableDates,

      // These settings intentionally match the bounded search
      // configuration validated by the adaptive-search tests.
      beamWidth:
        5,

      maxEvaluations:
        120,

      maxResults:
        5,
    });


  const best =
    ranked.find(
      (candidate) =>
        candidate.status !==
          "Avoid" &&

        candidate
          .unavailableViolations
          .length ===
          0 &&

        !candidate
          .hasHighConflict
    );


  if (!best) {
    return null;
  }


  const occurrences =
    getResolvedWeeklyActivityOccurrences(
      state,
      weekStartDate
    );


  if (!occurrences) {
    return null;
  }


  const occurrenceByKey =
    new Map(
      occurrences.map(
        (occurrence) => [
          getOccurrenceKey(
            occurrence.activity.id,
            occurrence.originalDate
          ),
          occurrence,
        ])
    );


  const moves:
    AdaptiveWeeklyScheduleRecommendationMove[] =
      best.moves.flatMap(
        (move) => {
          const occurrence =
            occurrenceByKey.get(
              getOccurrenceKey(
                move.trainingActivityId,
                move.originalDate
              )
            );

          if (!occurrence) {
            return [];
          }

          return [
            {
              trainingActivityId:
                move.trainingActivityId,

              label:
                occurrence.activity.label,

              type:
                occurrence.activity.type,

              originalDate:
                move.originalDate,

              scheduledDate:
                move.scheduledDate,

              originalDayLabel:
                getDayLabel(
                  move.originalDate
                ),

              scheduledDayLabel:
                getDayLabel(
                  move.scheduledDate
                ),
            },
          ];
        }
      );


  const optionalAdjustments:
    AdaptiveWeeklyScheduleOptionalAdjustment[] =
      recommendOptionalScheduleAdjustments({
        state,

        weekStartDate,

        evaluation:
          best,
      }).map(
        (adjustment) => ({
          action:
            adjustment.action,

          scheduledDate:
            adjustment.date,

          scheduledDayLabel:
            adjustment.dayLabel,

          substitutionGroup:
            adjustment.substitutionGroup,

          conflictingActivities:
            adjustment
              .conflictingActivities
              .map(
                (activity) => ({
                  trainingActivityId:
                    activity.id,

                  label:
                    activity.label,

                  type:
                    activity.type,
                })
              ),

          replacementActivity:
            adjustment.replacementActivity
              ? {
                  trainingActivityId:
                    adjustment
                      .replacementActivity
                      .id,

                  label:
                    adjustment
                      .replacementActivity
                      .label,

                  type:
                    adjustment
                      .replacementActivity
                      .type,
                }
              : undefined,

          reason:
            adjustment.reason,
        })
      );


  return {
    status:
      best.status,

    summary:
      buildSummary(
        unavailableDates,
        best.status
      ),

    explanation:
      buildExplanation(
        best,
        optionalAdjustments.length
      ),

    moves,

    optionalAdjustments,

    evaluation:
      best,
  };
}
