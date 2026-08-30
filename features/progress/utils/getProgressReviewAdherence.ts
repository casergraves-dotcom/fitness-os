import type {
  MorningCheckInRecord,
} from "@/features/recovery/hooks/useMorningCheckIn";

import {
  getCurrentWeeklyProgress,
} from "@/features/today/utils/getCurrentWeeklyProgress";

import type {
  RunSession,
  TrainingActivityCompletion,
  TrainingPlanState,
  WorkoutSession,
} from "@/features/workout/types";

import type {
  ProgressReviewPeriod,
} from "./getProgressReviewPeriod";
import {
  getTrainingWeekStartOnOrAfter,
} from "@/lib/date/trainingWeek";


// ============================================================
// Types
// ============================================================

export interface ProgressReviewAdherenceWeek {
  weekStartDate: string;

  weekType:
    NonNullable<
      ReturnType<
        typeof getCurrentWeeklyProgress
      >
    >["weekType"];

  requiredScheduled: number;

  requiredCompleted: number;

  adherenceRate: number;

  decisionStatus:
    NonNullable<
      ReturnType<
        typeof getCurrentWeeklyProgress
      >
    >["decision"]["status"];
}


export interface ProgressReviewAdherence {
  period:
    ProgressReviewPeriod;

  evaluatedWeekCount: number;

  requiredScheduled: number;

  requiredCompleted: number;

  adherenceRate:
    number | null;

  averageWeeklyAdherenceRate:
    number | null;

  weeks:
    ProgressReviewAdherenceWeek[];

  reason: string;
}


// ============================================================
// Date Helpers
// ============================================================

function parseLocalDate(
  value:
    string
) {
  const date =
    new Date(
      `${value}T12:00:00`
    );

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
}


function formatLocalDate(
  date:
    Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() +
        1
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

  return (
    `${year}-${month}-${day}`
  );
}


function addDays(
  date:
    Date,
  dayCount:
    number
) {
  const result =
    new Date(
      date
    );

  result.setDate(
    result.getDate() +
      dayCount
  );

  return result;
}


function getWeekStartOnOrAfter(
  date:
    Date
) {
  return getTrainingWeekStartOnOrAfter(date);
}


// ============================================================
// Progress Review Adherence
// ============================================================

export function getProgressReviewAdherence({
  period,
  trainingPlanState,
  completions,
  recoveryCheckIns,
  workoutHistory,
  runHistory,
}: {
  period:
    ProgressReviewPeriod;

  trainingPlanState:
    TrainingPlanState | null;

  completions:
    TrainingActivityCompletion[];

  recoveryCheckIns:
    MorningCheckInRecord[];

  workoutHistory:
    WorkoutSession[];

  runHistory:
    RunSession[];
}): ProgressReviewAdherence {
  if (
    !trainingPlanState
  ) {
    return {
      period,

      evaluatedWeekCount:
        0,

      requiredScheduled:
        0,

      requiredCompleted:
        0,

      adherenceRate:
        null,

      averageWeeklyAdherenceRate:
        null,

      weeks:
        [],

      reason:
        "There is no active training plan with weekly adherence to review.",
    };
  }

  const planStart =
    parseLocalDate(
      trainingPlanState
        .startDate
    );

  const periodEnd =
    parseLocalDate(
      period.endDate
    );

  const periodStart =
    period.startDate
      ? parseLocalDate(
          period.startDate
        )
      : planStart;

  if (
    !planStart ||
    !periodStart ||
    !periodEnd
  ) {
    return {
      period,

      evaluatedWeekCount:
        0,

      requiredScheduled:
        0,

      requiredCompleted:
        0,

      adherenceRate:
        null,

      averageWeeklyAdherenceRate:
        null,

      weeks:
        [],

      reason:
        "The selected review period or training-plan start date is invalid.",
    };
  }


  // ----------------------------------------------------------
  // Full Weeks Within the Selected Period
  // ----------------------------------------------------------

  const effectiveStart =
    periodStart >
    planStart
      ? periodStart
      : planStart;

  let weekStart =
    getWeekStartOnOrAfter(
      effectiveStart
    );

  const weeks:
    ProgressReviewAdherenceWeek[] = [];

  while (
    weekStart <=
    periodEnd
  ) {
    const weekEnd =
      addDays(
        weekStart,
        6
      );

    // Only complete weeks fully contained by the selected period
    // belong in the longer-term adherence average.
    if (
      weekEnd >
      periodEnd
    ) {
      break;
    }

    const weeklyProgress =
      getCurrentWeeklyProgress(
        trainingPlanState,
        completions,
        weekEnd,
        recoveryCheckIns,
        workoutHistory,
        runHistory
      );

    if (
      weeklyProgress &&
      weeklyProgress
        .evaluationReady
    ) {
      weeks.push({
        weekStartDate:
          weeklyProgress
            .weekStartDate,

        weekType:
          weeklyProgress
            .weekType,

        requiredScheduled:
          weeklyProgress
            .adherence
            .requiredCount,

        requiredCompleted:
          weeklyProgress
            .adherence
            .requiredCompleted,

        adherenceRate:
          weeklyProgress
            .adherence
            .adherenceRate,

        decisionStatus:
          weeklyProgress
            .decision
            .status,
      });
    }

    weekStart =
      addDays(
        weekStart,
        7
      );
  }


  // ----------------------------------------------------------
  // Aggregate
  // ----------------------------------------------------------

  const requiredScheduled =
    weeks.reduce(
      (
        total,
        week
      ) =>
        total +
        week.requiredScheduled,
      0
    );

  const requiredCompleted =
    weeks.reduce(
      (
        total,
        week
      ) =>
        total +
        week.requiredCompleted,
      0
    );

  const adherenceRate =
    requiredScheduled >
    0
      ? requiredCompleted /
        requiredScheduled
      : null;

  const averageWeeklyAdherenceRate =
    weeks.length >
    0
      ? weeks.reduce(
          (
            total,
            week
          ) =>
            total +
            week.adherenceRate,
          0
        ) /
        weeks.length
      : null;


  // ----------------------------------------------------------
  // Result
  // ----------------------------------------------------------

  return {
    period,

    evaluatedWeekCount:
      weeks.length,

    requiredScheduled,

    requiredCompleted,

    adherenceRate,

    averageWeeklyAdherenceRate,

    weeks,

    reason:
      weeks.length >
      0
        ? "Longer-term adherence uses complete evaluated training weeks fully contained by the selected review period."
        : "No complete evaluated training weeks fall fully within the selected review period yet.",
  };
}
