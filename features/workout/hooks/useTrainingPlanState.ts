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
  applyTrainingActivityReschedule,
} from "../logic/applyTrainingActivityReschedule";

import {
  applyAdaptiveScheduleRecommendation as applyAdaptiveScheduleRecommendationTransition,
} from "../logic/applyAdaptiveScheduleRecommendation";

import {
  overrideWeeklyProgressionDecision,
} from "../logic/overrideWeeklyProgressionDecision";
import {
  normalizeTrainingPlanWeekStarts,
} from "../logic/normalizeTrainingPlanWeekStarts";
import {
  normalizeLegacyTrainingWeekStartDate,
} from "@/lib/date/trainingWeek";

import type {
  AerialSessionPreference,
  RunningPreference,
  TrainingEquipmentProfile,
  TrainingSessionDurationPreference,
  RunProgressionPrescription,
  RunProgressionRole,
  TrainingDayOfWeek,
  TrainingInterruptionReason,
  TrainingModality,
  TrainingPlanState,
  TrainingParticipationPreference,
  TrainingWeek,
  WorkoutEnvironment,
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

const PREFERENCES_STORAGE_KEY =
  "fitness-os-training-preferences";

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}


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

function isTrainingPreferenceHistory(
  value: unknown
): value is TrainingParticipationPreference[] {
  return Array.isArray(value) && value.every((record) => {
    if (typeof record !== "object" || record === null) return false;
    const candidate = record as Partial<TrainingParticipationPreference>;
    return (
      typeof candidate.effectiveDate === "string" &&
      Array.isArray(candidate.enabledModalities) &&
      typeof candidate.createdAt === "string" &&
      typeof candidate.updatedAt === "string"
    );
  });
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
    trainingPreferences,
    setTrainingPreferences,
  ] = useState<TrainingParticipationPreference[]>([]);

  const [
    loaded,
    setLoaded,
  ] = useState(false);


  // ----------------------------------------------------------
  // Load
  // ----------------------------------------------------------

  useEffect(() => {
    let preferenceHistory: TrainingParticipationPreference[] = [];
    let hasPreferenceStore = false;
    const savedPreferences = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (savedPreferences) {
      try {
        const parsedPreferences: unknown = JSON.parse(savedPreferences);
        if (isTrainingPreferenceHistory(parsedPreferences)) {
          preferenceHistory = parsedPreferences;
          hasPreferenceStore = true;
        }
      } catch {
        localStorage.removeItem(PREFERENCES_STORAGE_KEY);
      }
    }

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
          const normalized = normalizeTrainingPlanWeekStarts(parsed);
          if (!hasPreferenceStore && normalized.trainingParticipationPreferences) {
            preferenceHistory = normalized.trainingParticipationPreferences;
            setFitnessOsStorage(
              PREFERENCES_STORAGE_KEY,
              JSON.stringify(preferenceHistory)
            );
          }
          const withPreferences = {
            ...normalized,
            trainingParticipationPreferences: preferenceHistory,
          };
          setState(withPreferences);
          if (JSON.stringify(withPreferences) !== JSON.stringify(parsed)) {
            setFitnessOsStorage(STORAGE_KEY, JSON.stringify(withPreferences));
          }
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

    setTrainingPreferences(preferenceHistory);

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
      startDate: normalizeLegacyTrainingWeekStartDate(startDate),

      heldWeekStartDates: [],

      evaluatedWeekStartDates: [],

      weeklyProgressionDecisions: [],

      successfulSteadyStateWeeks:
        0,

      deloadWeekStartDates: [],

      trainingParticipationPreferences: trainingPreferences,
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
    // They represent the same following calendar Sunday, so
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
  // Reschedule Training Activity
  // ----------------------------------------------------------
  //
  // Moves one specific scheduled activity occurrence without
  // mutating the underlying TrainingPlan template.
  //
  // Moving the same occurrence again replaces its destination.
  // Moving it back to originalDate removes the reschedule.

  function rescheduleTrainingActivity(
    trainingActivityId: string,
    originalDate: string,
    scheduledDate: string
  ) {
    if (!state) {
      return;
    }

    const nextState =
      applyTrainingActivityReschedule({
        state,

        trainingActivityId,

        originalDate,

        scheduledDate,

        rescheduledAt:
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
  // Reschedule Multiple Training Activities
  // ----------------------------------------------------------
  //
  // Applies a coordinated set of activity moves as one state
  // transition so later moves cannot overwrite earlier ones.

  function rescheduleTrainingActivities(
    moves: {
      trainingActivityId: string;
      originalDate: string;
      scheduledDate: string;
    }[]
  ) {
    if (
      !state ||
      moves.length === 0
    ) {
      return;
    }

    const rescheduledAt =
      new Date().toISOString();

    let nextState =
      state;

    for (
      const move
      of moves
    ) {
      nextState =
        applyTrainingActivityReschedule({
          state:
            nextState,

          trainingActivityId:
            move.trainingActivityId,

          originalDate:
            move.originalDate,

          scheduledDate:
            move.scheduledDate,

          rescheduledAt,
        });
    }

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
  // Apply Adaptive Schedule Recommendation
  // ----------------------------------------------------------
  //
  // The complete recommendation is produced by one pure state
  // transition. The hook is responsible only for persistence.

  function applyAdaptiveScheduleRecommendation(
    moves: {
      trainingActivityId: string;
      originalDate: string;
      scheduledDate: string;
    }[],
    adjustments: {
      trainingActivityId: string;
      originalDate: string;
      action: "Skip" | "Substitute";
      substituteTrainingActivityId?: string;
    }[],
    variantOverrides: {
      trainingActivityId: string;
      originalDate: string;
      strengthWorkoutVariantId: string;
    }[] = []
  ) {
    if (
      !state ||
      (
        moves.length === 0 &&
        adjustments.length === 0 &&
        variantOverrides.length === 0
      )
    ) {
      return;
    }


    const nextState =
      applyAdaptiveScheduleRecommendationTransition({
        state,

        moves,

        adjustments,

        variantOverrides,

        appliedAt:
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
  // Public API
  // ----------------------------------------------------------

  function setTrainingParticipationPreferences(
    enabledModalities: TrainingModality[],
    preferredDaysByModality: Partial<
      Record<TrainingModality, TrainingDayOfWeek[]>
    > = {},
    aerialSessions: AerialSessionPreference[] = [],
    runningPreference: RunningPreference = {
      environment: "Either",
      format: "Either",
    },
    equipmentProfiles: Partial<
      Record<WorkoutEnvironment, TrainingEquipmentProfile>
    > = {},
    sessionDurationByModality: Partial<
      Record<TrainingModality, TrainingSessionDurationPreference>
    > = {},
    effectiveDate = formatLocalDate(new Date())
  ) {
    const now = new Date().toISOString();
    const existing = trainingPreferences;
    const priorForDate = existing.find(
      (record) => record.effectiveDate === effectiveDate
    );
    const record = {
      effectiveDate,
      enabledModalities: [...enabledModalities],
      preferredDaysByModality,
      aerialSessions,
      runningPreference,
      equipmentProfiles,
      sessionDurationByModality,
      createdAt: priorForDate?.createdAt ?? now,
      updatedAt: now,
    };

    const nextPreferences = [
      ...existing.filter((item) => item.effectiveDate !== effectiveDate),
      record,
    ].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));

    setTrainingPreferences(nextPreferences);
    setFitnessOsStorage(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify(nextPreferences)
    );

    if (state) {
      saveState({
        ...state,
        trainingParticipationPreferences: nextPreferences,
      });
    }
  }

  return {
    state,
    trainingPreferences,
    loaded,

    startTrainingPlan,

    holdTrainingWeek,

    markWeekEvaluated,

    applyWeeklyProgressionDecision,

    overrideProgressionDecision,

    applyTrainingInterruptionDecision,

    rescheduleTrainingActivity,

    rescheduleTrainingActivities,

    applyAdaptiveScheduleRecommendation,

    setTrainingParticipationPreferences,

    clearTrainingPlan,
  };
}
