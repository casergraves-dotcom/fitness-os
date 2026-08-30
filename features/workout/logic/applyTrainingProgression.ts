import type {
  RunProgressionPrescription,
  RunProgressionRole,
  TrainingPlanState,
  TrainingWeek,
  WeeklyProgressionDecisionRecord,
} from "../types";


// ============================================================
// Configuration
// ============================================================

export const STEADY_STATE_WEEKS_BEFORE_DELOAD =
  7;


// ============================================================
// Input
// ============================================================

export interface ApplyTrainingProgressionInput {
  state: TrainingPlanState;

  // Start date of the calendar week that just ended.
  evaluatedWeekStartDate: string;

  // Whether the adherence/progression engine decided that
  // this week successfully progresses.
  shouldAdvance: boolean;

  // Full audit record for the weekly decision being applied.
  decisionRecord?: WeeklyProgressionDecisionRecord;

  // Full template for the week that was just completed.
  completedWeek?: TrainingWeek;

  // Sunday start of the following calendar week.
  nextWeekStartDate?: string;

  // Role-specific running prescriptions produced from runs
  // completed during the evaluated week.
  //
  // A missing role means its current prescription is retained.
  runningProgressionUpdates?: Partial<
    Record<
      RunProgressionRole,
      RunProgressionPrescription
    >
  >;
}


// ============================================================
// Helpers
// ============================================================

function addUniqueSorted(
  values: string[],
  value?: string
) {
  if (
    !value ||
    values.includes(value)
  ) {
    return values;
  }

  return [
    ...values,
    value,
  ].sort();
}


// ============================================================
// Apply Training Progression
// ============================================================
//
// Pure state-transition function.
//
// This function:
// - does not use React
// - does not use localStorage
// - does not mutate the incoming state
//
// Given the same input, it always produces the same result.

export function applyTrainingProgression({
  state,
  evaluatedWeekStartDate,
  shouldAdvance,
  decisionRecord,
  completedWeek,
  nextWeekStartDate,
  runningProgressionUpdates,
}: ApplyTrainingProgressionInput):
  TrainingPlanState {

  // ----------------------------------------------------------
  // Existing Evaluation State
  // ----------------------------------------------------------

  const evaluatedWeeks =
    state.evaluatedWeekStartDates ??
    [];


  // ----------------------------------------------------------
  // Idempotency
  // ----------------------------------------------------------
  //
  // If this calendar week has already been processed, return
  // the exact same state object.
  //
  // This prevents React rerenders or reopening Today from
  // applying the same weekly decision twice.

  if (
    evaluatedWeeks.includes(
      evaluatedWeekStartDate
    )
  ) {
    return state;
  }


  // ----------------------------------------------------------
  // Copy Existing State
  // ----------------------------------------------------------

  let heldWeeks = [
    ...(
      state.heldWeekStartDates ??
      []
    ),
  ];

  let deloadWeeks = [
    ...(
      state.deloadWeekStartDates ??
      []
    ),
  ];

  let successfulSteadyStateWeeks =
    state.successfulSteadyStateWeeks ??
    0;


  // ----------------------------------------------------------
  // Hold / Repeat
  // ----------------------------------------------------------
  //
  // A failed Ramp or Steady-State week causes the following
  // calendar week to repeat the same program week.
  //
  // Deload weeks should never fail progression because the
  // weekly progression hook automatically advances them.

  if (
    !shouldAdvance &&
    nextWeekStartDate
  ) {
    heldWeeks =
      addUniqueSorted(
        heldWeeks,
        nextWeekStartDate
      );
  }


  // ----------------------------------------------------------
  // Successful Week Behavior
  // ----------------------------------------------------------

  if (
    shouldAdvance &&
    completedWeek
  ) {
    switch (
      completedWeek.weekType
    ) {
      // ------------------------------------------------------
      // Ramp
      // ------------------------------------------------------
      //
      // Nothing additional needs to be stored.
      //
      // Calendar progression minus held weeks already
      // determines the next ramp week.

      case "Ramp": {
        break;
      }


      // ------------------------------------------------------
      // Steady State
      // ------------------------------------------------------

      case "SteadyState": {
        successfulSteadyStateWeeks +=
          1;


        // Seven successful steady-state weeks trigger a deload
        // during the following calendar week.
        if (
          successfulSteadyStateWeeks >=
            STEADY_STATE_WEEKS_BEFORE_DELOAD &&
          nextWeekStartDate
        ) {
          deloadWeeks =
            addUniqueSorted(
              deloadWeeks,
              nextWeekStartDate
            );
        }

        break;
      }


      // ------------------------------------------------------
      // Deload
      // ------------------------------------------------------
      //
      // Deload lasts exactly one calendar week.
      //
      // Once that week ends, begin a fresh steady-state cycle.

      case "Deload": {
        successfulSteadyStateWeeks =
          0;

        break;
      }
    }
  }


  // ----------------------------------------------------------
  // Decision History
  // ----------------------------------------------------------

  const existingDecisionRecords =
    state.weeklyProgressionDecisions ??
    [];

  const weeklyProgressionDecisions =
    decisionRecord
      ? [
          ...existingDecisionRecords.filter(
            (record) =>
              record.weekStartDate !==
              evaluatedWeekStartDate
          ),
          decisionRecord,
        ].sort(
          (a, b) =>
            a.weekStartDate.localeCompare(
              b.weekStartDate
            )
        )
      : existingDecisionRecords;


  // ----------------------------------------------------------
  // Running Progression
  // ----------------------------------------------------------
  //
  // Running progresses independently from the overall weekly
  // advance/hold result.
  //
  // For example, a strong endurance run may legitimately
  // progress even if the overall training week repeats because
  // another required activity was missed.

  const existingRunningProgression =
    state.runningProgression ??
    {};

  const runningProgression =
    runningProgressionUpdates
      ? {
          ...existingRunningProgression,
          ...runningProgressionUpdates,
        }
      : existingRunningProgression;


  // ----------------------------------------------------------
  // Result
  // ----------------------------------------------------------

  return {
    ...state,

    heldWeekStartDates:
      heldWeeks,

    evaluatedWeekStartDates:
      addUniqueSorted(
        evaluatedWeeks,
        evaluatedWeekStartDate
      ),

    weeklyProgressionDecisions,

    successfulSteadyStateWeeks,

    deloadWeekStartDates:
      deloadWeeks,

    runningProgression,
  };
}
