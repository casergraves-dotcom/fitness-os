import type {
  StrengthWorkoutType,
  TrainingActivityType,
  TrainingActivityCompletion,
  TrainingPlanState,
  WorkoutEquipment,
  WorkoutSetupCapability,
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
import { evaluateScheduleConflicts } from "./evaluateScheduleConflicts";
import { evaluateWeeklyScheduleRearrangement } from "./evaluateWeeklyScheduleRearrangement";
import { getReviewMoveCandidates } from "./getReviewMoveCandidates";
import { compareReviewMoveCandidates } from "./compareReviewMoveCandidates";

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

import {
  recommendStrengthScheduleFallback,
} from "./recommendStrengthScheduleFallback";

import type {
  StrengthScheduleDisruptionKind,
} from "./recommendStrengthScheduleFallback";


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


export interface AdaptiveWeeklyScheduleConstraint {
  date:
    string;

  kind:
    StrengthScheduleDisruptionKind;
}


export interface AdaptiveWeeklyScheduleVariantRecommendation {
  trainingActivityId:
    string;

  label:
    string;

  originalDate:
    string;

  dayLabel:
    string;

  strengthWorkout:
    StrengthWorkoutType;

  variantId:
    string;

  variantLabel:
    string;

  variantType:
    "ShortGym" | "Home";

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

  variantRecommendations:
    AdaptiveWeeklyScheduleVariantRecommendation[];

  evaluation:
    WeeklyScheduleRearrangementEvaluation;
}


export interface GetAdaptiveWeeklyScheduleRecommendationInput {
  state:
    TrainingPlanState;

  weekStartDate:
    string;

  // Backward-compatible whole-day blocks used by the existing UI.
  unavailableDates?:
    string[];

  // Richer constraints distinguish a completely unavailable day
  // from a gym-access or time constraint.
  constraints?:
    AdaptiveWeeklyScheduleConstraint[];

  availableEquipment?:
    WorkoutEquipment[];

  availableCapabilities?:
    WorkoutSetupCapability[];

  // Local YYYY-MM-DD; review must not suggest moving work into the past.
  reviewDate?: string;

  completions?: TrainingActivityCompletion[];
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

function formatLocalDate(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getConflictLoad(state: TrainingPlanState, weekStartDate: string): number {
  const occurrences = getResolvedWeeklyActivityOccurrences(state, weekStartDate) ?? [];
  return evaluateScheduleConflicts(
    occurrences
      .filter((occurrence) => occurrence.activity.type !== "Rest")
      .map((occurrence) => ({ date: occurrence.date, activity: occurrence.activity })),
  ).conflicts.reduce(
    (total, conflict) => total + (conflict.severity === "High" ? 100 : conflict.severity === "Caution" ? 25 : 5),
    0,
  );
}

function reviewExistingOverlap(
  state: TrainingPlanState,
  weekStartDate: string,
  reviewDate: string,
  completions: TrainingActivityCompletion[],
): AdaptiveWeeklyScheduleRecommendation | null {
  const weekStart = parseLocalDate(weekStartDate);
  const occurrences = getResolvedWeeklyActivityOccurrences(state, weekStartDate);
  if (!weekStart || !parseLocalDate(reviewDate) || !occurrences) return null;

  const conflicts = evaluateScheduleConflicts(
    occurrences.map((occurrence) => ({ date: occurrence.date, activity: occurrence.activity })),
  ).conflicts;
  if (conflicts.length === 0) return null;

  const baselineLoad = getConflictLoad(state, weekStartDate);
  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    return formatLocalDate(date);
  });

  const candidates = getReviewMoveCandidates(
    conflicts, occurrences, completions, weekDates, reviewDate,
  ).flatMap(({ occurrence, date }) => {
        const evaluation = evaluateWeeklyScheduleRearrangement({
          state,
          weekStartDate,
          moves: [{
            trainingActivityId: occurrence.activity.id,
            originalDate: occurrence.originalDate,
            scheduledDate: date,
          }],
        });
        if (!evaluation || evaluation.hasHighConflict || evaluation.unavailableViolations.length > 0) return [];
        const remainingLoad = getConflictLoad(evaluation.proposedState, weekStartDate);
        if (remainingLoad >= baselineLoad) return [];
        return [{ occurrence, date, evaluation, remainingLoad,
          preferencePenalty: evaluation.preferencePenalty }];
  }).sort(compareReviewMoveCandidates);

  const best = candidates[0];
  if (!best) return null;
  const { occurrence, date, evaluation } = best;
  return {
    status: evaluation.status,
    summary: `Move ${occurrence.activity.label} to ${getDayLabel(date)} to reduce the training overlap.`,
    explanation: `This keeps completed activities and fixed commitments in place, and reduces the week's detected training-load overlap. Review the proposed move before applying it.`,
    moves: [{
      trainingActivityId: occurrence.activity.id,
      label: occurrence.activity.label,
      type: occurrence.activity.type,
      originalDate: occurrence.originalDate,
      scheduledDate: date,
      originalDayLabel: getDayLabel(occurrence.date),
      scheduledDayLabel: getDayLabel(date),
    }],
    optionalAdjustments: [],
    variantRecommendations: [],
    evaluation,
  };
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
  unavailableDates = [],
  constraints = [],
  availableEquipment = [],
  availableCapabilities = [],
  reviewDate,
  completions = [],
}: GetAdaptiveWeeklyScheduleRecommendationInput):
  AdaptiveWeeklyScheduleRecommendation | null {

  const normalizedConstraints:
    AdaptiveWeeklyScheduleConstraint[] = [
      ...unavailableDates.map(
        (date) => ({
          date,
          kind:
            "DayUnavailable" as const,
        })
      ),
      ...constraints,
    ];


  if (
    normalizedConstraints.length ===
    0
  ) {
    return reviewDate
      ? reviewExistingOverlap(state, weekStartDate, reviewDate, completions)
      : null;
  }


  const dayUnavailableDates =
    Array.from(
      new Set(
        normalizedConstraints
          .filter(
            (constraint) =>
              constraint.kind ===
              "DayUnavailable"
          )
          .map(
            (constraint) =>
              constraint.date
          )
      )
    );


  const occurrences =
    getResolvedWeeklyActivityOccurrences(
      state,
      weekStartDate
    );


  if (!occurrences) {
    return null;
  }


  const variantRecommendations:
    AdaptiveWeeklyScheduleVariantRecommendation[] =
      normalizedConstraints.flatMap(
        (constraint) => {
          if (
            constraint.kind ===
            "DayUnavailable"
          ) {
            return [];
          }


          return occurrences.flatMap(
            (occurrence) => {
              if (
                occurrence.date !==
                  constraint.date ||
                occurrence.activity.type !==
                  "Strength" ||
                !occurrence.activity
                  .strengthWorkout
              ) {
                return [];
              }


              const decision =
                recommendStrengthScheduleFallback({
                  strengthWorkout:
                    occurrence.activity
                      .strengthWorkout,

                  disruption:
                    constraint.kind,

                  availableEquipment,

                  availableCapabilities,
                });


              if (
                decision.action ===
                  "Move" ||
                !decision.preferredVariant
              ) {
                return [];
              }


              return [
                {
                  trainingActivityId:
                    occurrence.activity.id,

                  label:
                    occurrence.activity.label,

                  originalDate:
                    occurrence.originalDate,

                  dayLabel:
                    getDayLabel(
                      occurrence.date
                    ),

                  strengthWorkout:
                    occurrence.activity
                      .strengthWorkout,

                  variantId:
                    decision
                      .preferredVariant.id,

                  variantLabel:
                    decision
                      .preferredVariant.label,

                  variantType:
                    decision
                      .preferredVariant
                      .variantType as
                        "ShortGym" | "Home",

                  reason:
                    decision.reason,
                },
              ];
            }
          );
        }
      );


  const fallbackMoveDates =
    normalizedConstraints.flatMap(
      (constraint) => {
        if (
          constraint.kind ===
          "DayUnavailable"
        ) {
          return [
            constraint.date,
          ];
        }


        const hasVariant =
          variantRecommendations.some(
            (recommendation) =>
              recommendation.originalDate ===
                constraint.date
          );


        return hasVariant
          ? []
          : [
              constraint.date,
            ];
      }
    );


  const effectiveUnavailableDates =
    Array.from(
      new Set([
        ...dayUnavailableDates,
        ...fallbackMoveDates,
      ])
    );


  // A viable same-day variant can completely resolve the request
  // without rearranging the week.
  if (
    effectiveUnavailableDates.length ===
      0 &&
    variantRecommendations.length >
      0
  ) {
    return {
      status:
        "Recommended",

      summary:
        variantRecommendations.length ===
        1
          ? `Keep ${variantRecommendations[0].label} on ${variantRecommendations[0].dayLabel} and use ${variantRecommendations[0].variantLabel}.`
          : `Keep the affected strength sessions on their planned days using appropriate workout variants.`,

      explanation:
        variantRecommendations
          .map(
            (item) =>
              item.reason
          )
          .join(" "),

      moves:
        [],

      optionalAdjustments:
        [],

      variantRecommendations,

      evaluation:
        {
          proposedState:
            state,

          moves:
            [],

          conflicts:
            [],

          resolvableOptionalConflicts:
            [],

          unavailableViolations:
            [],

          status:
            "Recommended",

          score:
            0,

          hasHighConflict:
            false,

          hasAnyConflict:
            false,

          reason:
            "The affected strength session can remain on its planned day using an executable workout variant.",
        },
    };
  }


  const activities =
    getWeeklyScheduleRearrangementOptions({
      state,
      weekStartDate,
      unavailableDates:
        effectiveUnavailableDates,
      includeReviewActivities:
        effectiveUnavailableDates.length === 0,
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
      unavailableDates:
        effectiveUnavailableDates,

      // These settings intentionally match the bounded search
      // configuration validated by the adaptive-search tests.
      beamWidth:
        5,

      maxEvaluations:
        effectiveUnavailableDates.length === 0
          ? 180
          : 120,

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
        effectiveUnavailableDates,
        best.status
      ),

    explanation:
      buildExplanation(
        best,
        optionalAdjustments.length
      ),

    moves,

    optionalAdjustments,

    variantRecommendations,

    evaluation:
      best,
  };
}
