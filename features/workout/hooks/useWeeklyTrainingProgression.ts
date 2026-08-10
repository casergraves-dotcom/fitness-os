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
  TrainingActivityCompletion,
  TrainingPlanState,
  TrainingWeek,
} from "../types";

import {
  evaluateWeeklyAdherence,
} from "../logic/evaluateWeeklyAdherence";

import {
  getWeeklyProgressionDecision,
} from "../logic/getWeeklyProgressionDecision";

import {
  getTrainingScheduleForDate,
} from "../utils/getTrainingScheduleForDate";


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

  applyWeeklyProgressionDecision: (
    evaluatedWeekStartDate: string,
    shouldAdvance: boolean,
    repeatedWeekStartDate?: string,
    completedWeek?: TrainingWeek,
    nextWeekStartDate?: string
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


function getMonday(
  date: Date
) {
  const result =
    startOfLocalDay(
      date
    );

  const day =
    result.getDay();

  const daysSinceMonday =
    day === 0
      ? 6
      : day - 1;

  result.setDate(
    result.getDate() -
      daysSinceMonday
  );

  return result;
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
  applyWeeklyProgressionDecision,
}: WeeklyTrainingProgressionOptions) {
  useEffect(() => {
    // --------------------------------------------------------
    // Wait Until Storage Has Loaded
    // --------------------------------------------------------

    if (
      !loaded ||
      !completionsLoaded ||
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
      getMonday(
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
      getMonday(
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
          nextWeekStartDate
        );

        return;
      }


      // ------------------------------------------------------
      // Evaluate Adherence
      // ------------------------------------------------------

      const adherence =
        evaluateWeeklyAdherence(
          trainingWeek,
          weekStartDate,
          completions
        );

      if (!adherence) {
        return;
      }


      // ------------------------------------------------------
      // Progression Decision
      // ------------------------------------------------------

      const decision =
        getWeeklyProgressionDecision(
          adherence
        );


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

        nextWeekStartDate
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
    applyWeeklyProgressionDecision,
  ]);
}