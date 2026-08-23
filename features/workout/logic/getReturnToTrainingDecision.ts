import type {
  TrainingInterruptionReason,
} from "../types";


// ============================================================
// Types
// ============================================================

export interface ReturnToTrainingDecision {
  interruptionDays: number;

  returnRampWeek: number;

  reason: string;
}


// ============================================================
// Helpers
// ============================================================

function parseLocalDate(
  value: string
): Date {
  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}


function getCalendarDayDifference(
  startedAt: string,
  resumedAt: string
): number {
  const start =
    parseLocalDate(
      startedAt
    );

  const resume =
    parseLocalDate(
      resumedAt
    );

  const millisecondsPerDay =
    24 * 60 * 60 * 1000;

  return Math.max(
    0,
    Math.round(
      (
        resume.getTime() -
        start.getTime()
      ) /
        millisecondsPerDay
    )
  );
}


// ============================================================
// Return-to-Training Decision
// ============================================================
//
// Selects an existing ramp week as the appropriate re-entry
// point after an interruption.
//
// This function deliberately does NOT:
// - modify TrainingPlanState
// - inspect workout history
// - delete progression data
// - change the original training-plan start date
//
// It only answers:
//
// "Given this interruption, where should the existing ramp
// resume?"
//
// Illness is retained as decision context but does not
// automatically force a more conservative ramp position.
// Recovery/readiness can be incorporated separately without
// encoding medical assumptions into calendar-duration logic.

export function getReturnToTrainingDecision(
  startedAt: string,
  resumedAt: string,
  reason:
    TrainingInterruptionReason
): ReturnToTrainingDecision {

  const interruptionDays =
    getCalendarDayDifference(
      startedAt,
      resumedAt
    );


  // ----------------------------------------------------------
  // Up to 7 Days
  // ----------------------------------------------------------
  //
  // A normal short disruption does not require a re-ramp.
  //
  // Week 7 represents normal steady-state training.

  if (
    interruptionDays <= 7
  ) {
    return {
      interruptionDays,

      returnRampWeek: 7,

      reason:
        "The interruption was short enough to resume normal steady-state training.",
    };
  }


  // ----------------------------------------------------------
  // 8–14 Days
  // ----------------------------------------------------------
  //
  // Week 4 restores the three-day strength structure while
  // keeping aerobic work below the full steady-state demand.

  if (
    interruptionDays <= 14
  ) {
    return {
      interruptionDays,

      returnRampWeek: 4,

      reason:
        "The interruption warrants a short re-ramp beginning with the Add Volume week.",
    };
  }


  // ----------------------------------------------------------
  // 15–21 Days
  // ----------------------------------------------------------
  //
  // Week 2 restores normal working-set volume while retaining
  // a reduced weekly structure and gradual run progression.

  if (
    interruptionDays <= 21
  ) {
    return {
      interruptionDays,

      returnRampWeek: 2,

      reason:
        "The interruption warrants rebuilding consistency before returning to the full weekly structure.",
    };
  }


  // ----------------------------------------------------------
  // 22–42 Days
  // ----------------------------------------------------------
  //
  // Week 1 explicitly re-establishes training rhythm with
  // reduced strength volume and conservative running.

  if (
    interruptionDays <= 42
  ) {
    return {
      interruptionDays,

      returnRampWeek: 1,

      reason:
        "The longer interruption warrants restarting the structured ramp near its beginning.",
    };
  }


  // ----------------------------------------------------------
  // More Than 42 Days
  // ----------------------------------------------------------
  //
  // Use the most conservative existing return week.

  return {
    interruptionDays,

    returnRampWeek: 0,

    reason:
      reason === "Illness"
        ? "The prolonged interruption warrants restarting with the most conservative return week; readiness should also be considered before normal progression."
        : "The prolonged interruption warrants restarting with the most conservative return week.",
  };
}