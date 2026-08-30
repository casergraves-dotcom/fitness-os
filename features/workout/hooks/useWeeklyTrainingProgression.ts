"use client";

// ============================================================
// Imports
// ============================================================

import {
  useEffect,
} from "react";

import {
  deloadWeek,
  fitnessOsTrainingPlan,
} from "../trainingPlan";

import type {
  RunProgressionPrescription,
  RunProgressionRole,
  RunSession,
  TrainingActivityCompletion,
  TrainingPlanState,
  TrainingWeek,
  WeeklyProgressionDecisionRecord,
  WorkoutSession,
} from "../types";

import {
  evaluateWeeklyAdherence,
} from "../logic/evaluateWeeklyAdherence";

import {
  getWeeklyProgressionDecision,
} from "../logic/getWeeklyProgressionDecision";

import {
  evaluateWeeklyRecovery,
} from "../logic/evaluateWeeklyRecovery";

import type {
  WeeklyRecoveryCheckIn,
} from "../logic/evaluateWeeklyRecovery";

import {
  evaluateWeeklyStrengthQuality,
} from "../logic/evaluateWeeklyStrengthQuality";

import {
  evaluateWeeklyRunningLoad,
} from "../logic/evaluateWeeklyRunningLoad";

import {
  evaluateWeeklyAerialLoad,
} from "../logic/evaluateWeeklyAerialLoad";

import {
  getWeeklyRunningProgressionUpdates,
} from "../logic/getWeeklyRunningProgressionUpdates";

import {
  getTrainingScheduleForDate,
} from "../utils/getTrainingScheduleForDate";

import {
  getResolvedWeeklyActivityOccurrences,
} from "../logic/getResolvedWeeklyActivityOccurrences";
import {
  getTrainingWeekStart,
} from "@/lib/date/trainingWeek";


// ============================================================
// Types
// ============================================================

interface WeeklyTrainingProgressionOptions {
  state:
    TrainingPlanState | null;

  loaded:
    boolean;

  completions:
    TrainingActivityCompletion[];

  completionsLoaded:
    boolean;

  recoveryCheckIns:
    WeeklyRecoveryCheckIn[];

  recoveryLoaded:
    boolean;

  workoutHistory:
    WorkoutSession[];

  workoutHistoryLoaded:
    boolean;

  runHistory:
    RunSession[];

  runHistoryLoaded:
    boolean;

  applyWeeklyProgressionDecision: (
    evaluatedWeekStartDate: string,
    shouldAdvance: boolean,
    repeatedWeekStartDate?: string,
    completedWeek?: TrainingWeek,
    nextWeekStartDate?: string,
    decisionRecord?: WeeklyProgressionDecisionRecord,
    runningProgressionUpdates?: Partial<
      Record<
        RunProgressionRole,
        RunProgressionPrescription
      >
    >
  ) => void;
}


// ============================================================
// Date Helpers
// ============================================================

function startOfLocalDay(
  date: Date
) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}


function addDays(
  date: Date,
  days: number
) {
  const result =
    startOfLocalDay(
      date
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


// ============================================================
// Resolve Training Week
// ============================================================

function resolveTrainingWeek(
  phaseId: string
): TrainingWeek | undefined {
  if (
    phaseId ===
    deloadWeek.id
  ) {
    return deloadWeek;
  }

  return (
    fitnessOsTrainingPlan.weeks.find(
      (week) =>
        week.id ===
        phaseId
    )
  );
}


// ============================================================
// Weekly Training Progression
// ============================================================

export function useWeeklyTrainingProgression({
  state,
  loaded,
  completions,
  completionsLoaded,
  recoveryCheckIns,
  recoveryLoaded,
  workoutHistory,
  workoutHistoryLoaded,
  runHistory,
  runHistoryLoaded,
  applyWeeklyProgressionDecision,
}: WeeklyTrainingProgressionOptions) {
  useEffect(() => {
    // --------------------------------------------------------
    // Wait Until Storage Has Loaded
    // --------------------------------------------------------

    if (
      !loaded ||
      !completionsLoaded ||
      !recoveryLoaded ||
      !workoutHistoryLoaded ||
      !runHistoryLoaded ||
      !state
    ) {
      return;
    }


    // --------------------------------------------------------
    // Current Calendar Week
    // --------------------------------------------------------

    const today =
      new Date();

    const currentWeekStart =
      getTrainingWeekStart(
        today
      );


    // --------------------------------------------------------
    // Training Plan Start
    // --------------------------------------------------------

    const planStart =
      new Date(
        `${state.startDate}T00:00:00`
      );

    if (
      Number.isNaN(
        planStart.getTime()
      )
    ) {
      return;
    }

    const firstWeekStart =
      getTrainingWeekStart(
        planStart
      );


    // --------------------------------------------------------
    // Nothing To Evaluate Yet
    // --------------------------------------------------------

    if (
      currentWeekStart <=
      firstWeekStart
    ) {
      return;
    }


    // --------------------------------------------------------
    // Find Unevaluated Completed Weeks
    // --------------------------------------------------------

    const evaluatedWeeks =
      state.evaluatedWeekStartDates ??
      [];

    let weekStart =
      firstWeekStart;


    while (
      weekStart <
      currentWeekStart
    ) {
      const weekStartDate =
        formatLocalDate(
          weekStart
        );


      // ------------------------------------------------------
      // Skip Already Evaluated Week
      // ------------------------------------------------------

      if (
        evaluatedWeeks.includes(
          weekStartDate
        )
      ) {
        weekStart =
          addDays(
            weekStart,
            7
          );

        continue;
      }


      // ------------------------------------------------------
      // Resolve Schedule
      // ------------------------------------------------------

      const schedule =
        getTrainingScheduleForDate(
          fitnessOsTrainingPlan,
          state,
          weekStart
        );

      if (!schedule) {
        weekStart =
          addDays(
            weekStart,
            7
          );

        continue;
      }


      // ------------------------------------------------------
      // Resolve Full Training Week
      // ------------------------------------------------------

      const trainingWeek =
        resolveTrainingWeek(
          schedule.phaseId
        );

      if (!trainingWeek) {
        return;
      }


      // ------------------------------------------------------
      // Following Calendar Week
      // ------------------------------------------------------

      const nextWeekStart =
        addDays(
          weekStart,
          7
        );

      const nextWeekStartDate =
        formatLocalDate(
          nextWeekStart
        );


      // ------------------------------------------------------
      // Deload
      // ------------------------------------------------------
      //
      // Deload is recovery by design.
      //
      // We record the week as evaluated and automatically
      // advance back into steady-state training regardless of
      // adherence.

      if (
        schedule.weekType ===
          "Deload"
      ) {
        applyWeeklyProgressionDecision(
          weekStartDate,
          true,
          undefined,
          trainingWeek,
          nextWeekStartDate,
          {
            weekStartDate,

            weekType:
              trainingWeek.weekType,

            automaticStatus:
              "Advance",

            automaticShouldAdvance:
              true,

            automaticReason:
              "The scheduled deload week is complete, so the plan returns to steady-state training.",

            automaticFactors: [
              "This was a planned deload week focused on recovery rather than normal progression criteria.",
            ],

            finalShouldAdvance:
              true,

            manuallyOverridden:
              false,

            decidedAt:
              new Date().toISOString(),
          }
        );

        return;
      }


      // ------------------------------------------------------
      // Evaluate Adherence
      // ------------------------------------------------------

      const resolvedOccurrences =
        getResolvedWeeklyActivityOccurrences(
          state,
          weekStartDate
        );

      if (!resolvedOccurrences) {
        return;
      }

      const adherence =
        evaluateWeeklyAdherence(
          trainingWeek,
          weekStartDate,
          completions,
          resolvedOccurrences
        );

      if (!adherence) {
        return;
      }


      // ------------------------------------------------------
      // Progression Decision
      // ------------------------------------------------------

      const decision =
        getWeeklyProgressionDecision(
          adherence,
          evaluateWeeklyRecovery(
            weekStartDate,
            recoveryCheckIns
          ),
          evaluateWeeklyStrengthQuality(
            weekStartDate,
            workoutHistory
          ),
          evaluateWeeklyRunningLoad(
            weekStartDate,
            runHistory
          ),
          evaluateWeeklyAerialLoad(
            adherence
          )
        );


      // ------------------------------------------------------
      // Running Progression Updates
      // ------------------------------------------------------
      //
      // Run-specific progression is independent from the
      // overall weekly advance/hold decision. Only normal
      // steady-state weeks are allowed to update the persistent
      // Development / Endurance prescriptions here.

      const runningProgressionUpdates =
        trainingWeek.weekType ===
          "SteadyState"
          ? getWeeklyRunningProgressionUpdates(
              weekStartDate,
              runHistory
            )
          : undefined;


      // ------------------------------------------------------
      // Apply Decision
      // ------------------------------------------------------

      applyWeeklyProgressionDecision(
        weekStartDate,

        decision.shouldAdvance,

        decision.shouldAdvance
          ? undefined
          : nextWeekStartDate,

        trainingWeek,

        nextWeekStartDate,

        {
          weekStartDate,

          weekType:
            trainingWeek.weekType,

          automaticStatus:
            decision.status,

          automaticShouldAdvance:
            decision.shouldAdvance,

          automaticReason:
            decision.reason,

          automaticFactors: [
            ...decision.factors,
          ],

          finalShouldAdvance:
            decision.shouldAdvance,

          manuallyOverridden:
            false,

          decidedAt:
            new Date().toISOString(),
        },

        runningProgressionUpdates
      );


      // ------------------------------------------------------
      // Important
      // ------------------------------------------------------
      //
      // Apply only one decision per render.
      //
      // The state update triggers another render, at which
      // point the next completed calendar week can be evaluated
      // using the updated hold/deload state.

      return;
    }
  }, [
    state,
    loaded,
    completions,
    completionsLoaded,
    recoveryCheckIns,
    recoveryLoaded,
    workoutHistory,
    workoutHistoryLoaded,
    runHistory,
    runHistoryLoaded,
    applyWeeklyProgressionDecision,
  ]);
}
