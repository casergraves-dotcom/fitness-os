"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  applyTrainingProgression,
} from "../logic/applyTrainingProgression";

import {
  applyTrainingInterruption,
} from "../logic/applyTrainingInterruption";

import {
  overrideWeeklyProgressionDecision,
} from "../logic/overrideWeeklyProgressionDecision";

import type {
  RunProgressionPrescription,
  RunProgressionRole,
  TrainingInterruptionReason,
  TrainingPlanState,
  TrainingWeek,
  WeeklyProgressionDecisionRecord,
} from "../types";

import {
  removeFitnessOsStorage,
  setFitnessOsStorage,
} from "@/lib/storage/fitnessOsStorage";


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

    setFitnessOsStorage(
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

      weeklyProgressionDecisions: [],

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

    removeFitnessOsStorage(
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
    nextWeekStartDate?: string,
    decisionRecord?: WeeklyProgressionDecisionRecord,
    runningProgressionUpdates?: Partial<
      Record<
        RunProgressionRole,
        RunProgressionPrescription
      >
    >
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

        decisionRecord,

        completedWeek,

        nextWeekStartDate:
          followingWeekStartDate,

        runningProgressionUpdates,
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
  // Override Weekly Progression Decision
  // ----------------------------------------------------------

  function overrideProgressionDecision(
    weekStartDate: string,
    finalShouldAdvance: boolean,
    overrideReason?: string
  ) {
    if (!state) {
      return;
    }

    const nextState =
      overrideWeeklyProgressionDecision({
        state,

        weekStartDate,

        finalShouldAdvance,

        overrideReason,

        overriddenAt:
          new Date().toISOString(),
      });

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
  // Apply Training Interruption
  // ----------------------------------------------------------
  //
  // Records a completed interruption and, when necessary,
  // activates the temporary return-to-training ramp selected by
  // the pure decision engine.
  //
  // The pure transition preserves the original plan start date,
  // weekly progression history, adaptive running progression,
  // and deload-cycle state.

  function applyTrainingInterruptionDecision(
    startedAt: string,
    resumedAt: string,
    reason: TrainingInterruptionReason,
    returnWeekStartDate: string
  ) {
    if (!state) {
      return;
    }

    const nextState =
      applyTrainingInterruption({
        state,

        startedAt,

        resumedAt,

        reason,

        returnWeekStartDate,
      });

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

    overrideProgressionDecision,

    applyTrainingInterruptionDecision,

    clearTrainingPlan,
  };
}
