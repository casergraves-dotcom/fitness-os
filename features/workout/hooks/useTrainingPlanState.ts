"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  applyTrainingProgression,
} from "../logic/applyTrainingProgression";

import type {
  TrainingPlanState,
  TrainingWeek,
} from "../types";


// ============================================================
// Storage
// ============================================================

const STORAGE_KEY =
  "fitness-os-training-plan-state";


// ============================================================
// Helpers
// ============================================================

function isTrainingPlanState(
  value: unknown
): value is TrainingPlanState {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const candidate =
    value as Partial<TrainingPlanState>;

  return (
    typeof candidate.trainingPlanId ===
      "string" &&
    typeof candidate.startDate ===
      "string"
  );
}


// ============================================================
// Training Plan State Hook
// ============================================================

export function useTrainingPlanState() {
  const [
    state,
    setState,
  ] = useState<TrainingPlanState | null>(
    null
  );

  const [
    loaded,
    setLoaded,
  ] = useState(false);


  // ----------------------------------------------------------
  // Load
  // ----------------------------------------------------------

  useEffect(() => {
    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (saved) {
      try {
        const parsed: unknown =
          JSON.parse(saved);

        if (
          isTrainingPlanState(
            parsed
          )
        ) {
          setState(parsed);
        } else {
          localStorage.removeItem(
            STORAGE_KEY
          );
        }
      } catch {
        localStorage.removeItem(
          STORAGE_KEY
        );
      }
    }

    setLoaded(true);
  }, []);


  // ----------------------------------------------------------
  // Save
  // ----------------------------------------------------------

  function saveState(
    nextState: TrainingPlanState
  ) {
    setState(nextState);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextState)
    );
  }


  // ----------------------------------------------------------
  // Start Training Plan
  // ----------------------------------------------------------

  function startTrainingPlan(
    trainingPlanId: string,
    startDate: string
  ) {
    saveState({
      trainingPlanId,
      startDate,

      heldWeekStartDates: [],

      evaluatedWeekStartDates: [],

      successfulSteadyStateWeeks:
        0,

      deloadWeekStartDates: [],
    });
  }


  // ----------------------------------------------------------
  // Clear Training Plan
  // ----------------------------------------------------------

  function clearTrainingPlan() {
    setState(null);

    localStorage.removeItem(
      STORAGE_KEY
    );
  }


  // ----------------------------------------------------------
  // Hold Training Week
  // ----------------------------------------------------------
  //
  // Retained as a lower-level utility while the progression
  // system is being built.
  //
  // Normal automatic progression should use
  // applyWeeklyProgressionDecision() instead.

  function holdTrainingWeek(
    repeatedWeekStartDate: string
  ) {
    if (!state) {
      return;
    }

    const existing =
      state.heldWeekStartDates ??
      [];

    if (
      existing.includes(
        repeatedWeekStartDate
      )
    ) {
      return;
    }

    saveState({
      ...state,

      heldWeekStartDates: [
        ...existing,
        repeatedWeekStartDate,
      ].sort(),
    });
  }


  // ----------------------------------------------------------
  // Mark Week Evaluated
  // ----------------------------------------------------------

  function markWeekEvaluated(
    weekStartDate: string
  ) {
    if (!state) {
      return;
    }

    const existing =
      state.evaluatedWeekStartDates ??
      [];

    if (
      existing.includes(
        weekStartDate
      )
    ) {
      return;
    }

    saveState({
      ...state,

      evaluatedWeekStartDates: [
        ...existing,
        weekStartDate,
      ].sort(),
    });
  }


  // ----------------------------------------------------------
  // Apply Weekly Progression Decision
  // ----------------------------------------------------------

  function applyWeeklyProgressionDecision(
    evaluatedWeekStartDate: string,
    shouldAdvance: boolean,
    repeatedWeekStartDate?: string,
    completedWeek?: TrainingWeek,
    nextWeekStartDate?: string
  ) {
    if (!state) {
      return;
    }


    // The existing caller supplies repeatedWeekStartDate when
    // holding and nextWeekStartDate for normal progression.
    //
    // They represent the same following calendar Monday, so
    // normalize them before passing the transition to the pure
    // progression engine.
    const followingWeekStartDate =
      nextWeekStartDate ??
      repeatedWeekStartDate;


    const nextState =
      applyTrainingProgression({
        state,

        evaluatedWeekStartDate,

        shouldAdvance,

        completedWeek,

        nextWeekStartDate:
          followingWeekStartDate,
      });


    // The pure function returns the exact same object when the
    // week was already evaluated.
    if (
      nextState === state
    ) {
      return;
    }


    saveState(
      nextState
    );
  }


  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  return {
    state,
    loaded,

    startTrainingPlan,

    holdTrainingWeek,

    markWeekEvaluated,

    applyWeeklyProgressionDecision,

    clearTrainingPlan,
  };
}