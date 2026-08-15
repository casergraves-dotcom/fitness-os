import {
  STEADY_STATE_WEEKS_BEFORE_DELOAD,
} from "./applyTrainingProgression";

import type {
  TrainingPlanState,
} from "../types";


// ============================================================
// Input
// ============================================================

export interface OverrideWeeklyProgressionDecisionInput {
  state: TrainingPlanState;

  weekStartDate: string;

  finalShouldAdvance: boolean;

  overrideReason?: string;

  overriddenAt: string;
}


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


function getFollowingWeekStartDate(
  weekStartDate: string
) {
  const date =
    parseLocalDate(
      weekStartDate
    );

  if (!date) {
    return null;
  }

  date.setDate(
    date.getDate() + 7
  );

  return formatLocalDate(
    date
  );
}


// ============================================================
// Override Weekly Progression Decision
// ============================================================

export function overrideWeeklyProgressionDecision({
  state,
  weekStartDate,
  finalShouldAdvance,
  overrideReason,
  overriddenAt,
}: OverrideWeeklyProgressionDecisionInput):
  TrainingPlanState {

  const decisions =
    state.weeklyProgressionDecisions ??
    [];

  const decisionIndex =
    decisions.findIndex(
      (decision) =>
        decision.weekStartDate ===
        weekStartDate
    );

  if (decisionIndex < 0) {
    return state;
  }


  // ----------------------------------------------------------
  // Latest Decision Only
  // ----------------------------------------------------------
  //
  // Changing an older decision after later weeks have already
  // been processed could invalidate downstream holds/deloads.

  const latestDecision =
    [...decisions]
      .sort(
        (a, b) =>
          b.weekStartDate.localeCompare(
            a.weekStartDate
          )
      )[0];

  if (
    !latestDecision ||
    latestDecision.weekStartDate !==
      weekStartDate
  ) {
    return state;
  }


  const existingDecision =
    decisions[
      decisionIndex
    ];


  // ----------------------------------------------------------
  // Deload Protection
  // ----------------------------------------------------------
  //
  // Deload weeks automatically return to steady state and are
  // not ordinary advance/hold decisions.

  if (
    existingDecision.weekType ===
      "Deload"
  ) {
    return state;
  }


  if (
    existingDecision.finalShouldAdvance ===
      finalShouldAdvance
  ) {
    return state;
  }


  const followingWeekStartDate =
    getFollowingWeekStartDate(
      weekStartDate
    );

  if (!followingWeekStartDate) {
    return state;
  }


  // ----------------------------------------------------------
  // Copy Progression State
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
  // Hold -> Advance
  // ----------------------------------------------------------

  if (
    !existingDecision.finalShouldAdvance &&
    finalShouldAdvance
  ) {
    heldWeeks =
      heldWeeks.filter(
        (date) =>
          date !==
          followingWeekStartDate
      );


    if (
      existingDecision.weekType ===
        "SteadyState"
    ) {
      successfulSteadyStateWeeks +=
        1;

      if (
        successfulSteadyStateWeeks >=
          STEADY_STATE_WEEKS_BEFORE_DELOAD
      ) {
        if (
          !deloadWeeks.includes(
            followingWeekStartDate
          )
        ) {
          deloadWeeks.push(
            followingWeekStartDate
          );

          deloadWeeks.sort();
        }
      }
    }
  }


  // ----------------------------------------------------------
  // Advance -> Hold
  // ----------------------------------------------------------

  if (
    existingDecision.finalShouldAdvance &&
    !finalShouldAdvance
  ) {
    if (
      !heldWeeks.includes(
        followingWeekStartDate
      )
    ) {
      heldWeeks.push(
        followingWeekStartDate
      );

      heldWeeks.sort();
    }


    if (
      existingDecision.weekType ===
        "SteadyState"
    ) {
      successfulSteadyStateWeeks =
        Math.max(
          0,
          successfulSteadyStateWeeks -
            1
        );

      // If this successful week originally triggered the next
      // deload, reversing it removes that scheduled deload.
      deloadWeeks =
        deloadWeeks.filter(
          (date) =>
            date !==
            followingWeekStartDate
        );
    }
  }


  // ----------------------------------------------------------
  // Update Decision Record
  // ----------------------------------------------------------

  const normalizedReason =
    overrideReason?.trim();

  const updatedDecisions =
    decisions.map(
      (decision) =>
        decision.weekStartDate ===
          weekStartDate
          ? {
              ...decision,

              finalShouldAdvance,

              manuallyOverridden:
                finalShouldAdvance !==
                decision
                  .automaticShouldAdvance,

              overrideReason:
                normalizedReason ||
                undefined,

              overriddenAt,
            }
          : decision
    );


  return {
    ...state,

    heldWeekStartDates:
      heldWeeks,

    weeklyProgressionDecisions:
      updatedDecisions,

    successfulSteadyStateWeeks,

    deloadWeekStartDates:
      deloadWeeks,
  };
}