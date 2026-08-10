"use client";

// ============================================================
// Imports
// ============================================================

import {
  useEffect,
  useState,
} from "react";

import type {
  CardioIntensity,
  RunSession,
  TrainingPlanState,
} from "../../workout/types";

import {
  fitnessOsTrainingPlan,
} from "../../workout/trainingPlan";

import {
  getTrainingScheduleForDate,
} from "../../workout/utils/getTrainingScheduleForDate";

import {
  recordTrainingActivityCompletion,
  removeTrainingActivityCompletionsByWorkoutSessionId,
} from "../../workout/utils/trainingActivityCompletionStorage";


// ============================================================
// Storage
// ============================================================

const ACTIVE_RUN_STORAGE_KEY =
  "fitness-os-active-run";

const RUN_HISTORY_STORAGE_KEY =
  "fitness-os-run-history";

const TRAINING_PLAN_STATE_STORAGE_KEY =
  "fitness-os-training-plan-state";


// ============================================================
// Helpers
// ============================================================

function createId() {
  return [
    Date.now(),
    Math.random()
      .toString(36)
      .slice(2),
  ].join("-");
}


// ------------------------------------------------------------
// Validate Run Session
// ------------------------------------------------------------

function isRunSession(
  value: unknown
): value is RunSession {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const candidate =
    value as Partial<RunSession>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.startedAt === "string"
  );
}


// ------------------------------------------------------------
// Parse Local Training Date
// ------------------------------------------------------------

function parseLocalTrainingDate(
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
    Number(
      match[1]
    );

  const month =
    Number(
      match[2]
    );

  const day =
    Number(
      match[3]
    );

  const date =
    new Date(
      year,
      month - 1,
      day
    );

  if (
    date.getFullYear() !== year ||
    date.getMonth() !==
      month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}


// ============================================================
// Record Scheduled Run Completion
// ============================================================

function recordScheduledRunCompletion(
  run: RunSession
) {
  // ----------------------------------------------------------
  // Completed Run Required
  // ----------------------------------------------------------

  if (!run.completedAt) {
    return;
  }

  const completedAt =
    new Date(
      run.completedAt
    );

  if (
    Number.isNaN(
      completedAt.getTime()
    )
  ) {
    return;
  }


  // ----------------------------------------------------------
  // Training Plan State
  // ----------------------------------------------------------

  const savedPlanState =
    localStorage.getItem(
      TRAINING_PLAN_STATE_STORAGE_KEY
    );

  if (!savedPlanState) {
    return;
  }

  let planState:
    TrainingPlanState;

  try {
    planState =
      JSON.parse(
        savedPlanState
      );
  } catch {
    return;
  }


  // ----------------------------------------------------------
  // Explicit Scheduled Context
  // ----------------------------------------------------------
  //
  // Runs launched from Today carry the exact scheduled
  // activity ID and scheduled calendar date.
  //
  // Prefer this over the completion timestamp so a run that
  // crosses midnight still satisfies the activity that
  // actually launched it.

  if (
    run.scheduledActivityId &&
    run.scheduledDate
  ) {
    const scheduledDate =
      parseLocalTrainingDate(
        run.scheduledDate
      );

    if (scheduledDate) {
      const schedule =
        getTrainingScheduleForDate(
          fitnessOsTrainingPlan,
          planState,
          scheduledDate
        );

      const scheduledActivity =
        schedule?.trainingDay.activities.find(
          (activity) =>
            activity.id ===
              run.scheduledActivityId &&
            activity.type ===
              "Run"
        );

      if (scheduledActivity) {
        recordTrainingActivityCompletion(
          scheduledActivity,
          {
            date:
              scheduledDate,

            completedAt,

            workoutSessionId:
              run.id,
          }
        );

        return;
      }
    }
  }


  // ----------------------------------------------------------
  // Completion-Date Fallback
  // ----------------------------------------------------------
  //
  // Manually started runs do not have scheduled context.
  //
  // If today's schedule contains a Run activity, allow this
  // completed run to satisfy it.

  const schedule =
    getTrainingScheduleForDate(
      fitnessOsTrainingPlan,
      planState,
      completedAt
    );

  if (!schedule) {
    return;
  }

  const scheduledActivity =
    schedule.trainingDay.activities.find(
      (activity) =>
        activity.type ===
        "Run"
    );

  if (!scheduledActivity) {
    return;
  }

  recordTrainingActivityCompletion(
    scheduledActivity,
    {
      date:
        completedAt,

      completedAt,

      workoutSessionId:
        run.id,
    }
  );
}


// ============================================================
// Run Session Hook
// ============================================================

export function useRunSession() {

  // ----------------------------------------------------------
  // State
  // ----------------------------------------------------------

  const [
    session,
    setSession,
  ] = useState<RunSession | null>(
    null
  );

  const [
    history,
    setHistory,
  ] = useState<RunSession[]>(
    []
  );

  const [
    loaded,
    setLoaded,
  ] = useState(false);

  const [
    finished,
    setFinished,
  ] = useState(false);


  // ----------------------------------------------------------
  // Load
  // ----------------------------------------------------------

  useEffect(() => {
    const savedSession =
      localStorage.getItem(
        ACTIVE_RUN_STORAGE_KEY
      );

    if (savedSession) {
      try {
        const parsed: unknown =
          JSON.parse(
            savedSession
          );

        if (
          isRunSession(
            parsed
          )
        ) {
          setSession(
            parsed
          );
        } else {
          localStorage.removeItem(
            ACTIVE_RUN_STORAGE_KEY
          );
        }
      } catch {
        localStorage.removeItem(
          ACTIVE_RUN_STORAGE_KEY
        );
      }
    }


    const savedHistory =
      localStorage.getItem(
        RUN_HISTORY_STORAGE_KEY
      );

    if (savedHistory) {
      try {
        const parsed: unknown =
          JSON.parse(
            savedHistory
          );

        if (
          Array.isArray(
            parsed
          )
        ) {
          const validHistory =
            parsed.filter(
              isRunSession
            );

          setHistory(
            validHistory
          );

          if (
            validHistory.length !==
            parsed.length
          ) {
            localStorage.setItem(
              RUN_HISTORY_STORAGE_KEY,
              JSON.stringify(
                validHistory
              )
            );
          }
        } else {
          localStorage.removeItem(
            RUN_HISTORY_STORAGE_KEY
          );
        }
      } catch {
        localStorage.removeItem(
          RUN_HISTORY_STORAGE_KEY
        );
      }
    }


    setLoaded(
      true
    );
  }, []);


  // ----------------------------------------------------------
  // Persist Active Run
  // ----------------------------------------------------------

  useEffect(() => {
    if (
      !loaded ||
      !session ||
      finished
    ) {
      return;
    }

    localStorage.setItem(
      ACTIVE_RUN_STORAGE_KEY,
      JSON.stringify(
        session
      )
    );
  }, [
    session,
    loaded,
    finished,
  ]);


  // ----------------------------------------------------------
  // Start Run
  // ----------------------------------------------------------

  function startRun(
    options?: {
      intensity?: CardioIntensity;

      scheduledActivityId?: string;
      scheduledDate?: string;

      prescribedLabel?: string;

      prescribedDurationMin?: number;
      prescribedDurationMax?: number;

      prescribedRunIntervalMinutes?: number;
      prescribedWalkIntervalMinutes?: number;

      prescribedNote?: string;
    }
  ) {
    const newSession:
      RunSession = {
      id:
        createId(),

      startedAt:
        new Date()
          .toISOString(),

      intensity:
        options?.intensity,

      scheduledActivityId:
        options?.scheduledActivityId,

      scheduledDate:
        options?.scheduledDate,

      prescribedLabel:
        options?.prescribedLabel,

      prescribedDurationMin:
        options?.prescribedDurationMin,

      prescribedDurationMax:
        options?.prescribedDurationMax,

      prescribedRunIntervalMinutes:
        options?.prescribedRunIntervalMinutes,

      prescribedWalkIntervalMinutes:
        options?.prescribedWalkIntervalMinutes,

      prescribedNote:
        options?.prescribedNote,
    };

    setFinished(
      false
    );

    setSession(
      newSession
    );

    localStorage.setItem(
      ACTIVE_RUN_STORAGE_KEY,
      JSON.stringify(
        newSession
      )
    );

    return newSession;
  }


  // ----------------------------------------------------------
  // Update Duration
  // ----------------------------------------------------------

  function updateDuration(
    durationMinutes: number
  ) {
    const safeDuration =
      Number.isFinite(
        durationMinutes
      )
        ? Math.max(
            0,
            durationMinutes
          )
        : 0;

    setSession(
      (previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,

          durationMinutes:
            safeDuration,
        };
      }
    );
  }


  // ----------------------------------------------------------
  // Update Distance
  // ----------------------------------------------------------

  function updateDistance(
    distanceMiles: number
  ) {
    const safeDistance =
      Number.isFinite(
        distanceMiles
      )
        ? Math.max(
            0,
            distanceMiles
          )
        : 0;

    setSession(
      (previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,

          distanceMiles:
            safeDistance,
        };
      }
    );
  }

  // ----------------------------------------------------------
  // Update RPE
  // ----------------------------------------------------------

  function updateRpe(
    rpe: number
  ) {
    const safeRpe =
      Number.isFinite(
        rpe
      )
        ? Math.min(
            10,
            Math.max(
              1,
              Math.round(rpe)
            )
          )
        : 1;

    setSession(
      (previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          rpe:
            safeRpe,
        };
      }
    );
  }


  // ----------------------------------------------------------
  // Update Notes
  // ----------------------------------------------------------

  function updateNotes(
    notes: string
  ) {
    setSession(
      (previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          notes,
        };
      }
    );
  }


  // ----------------------------------------------------------
  // Finish Run
  // ----------------------------------------------------------

  function finishRun() {
    if (!session) {
      return null;
    }

    const completedRun:
      RunSession = {
      ...session,

      completedAt:
        new Date()
          .toISOString(),
    };


    // --------------------------------------------------------
    // Save Run History
    // --------------------------------------------------------

    const updatedHistory = [
      completedRun,
      ...history,
    ];

    localStorage.setItem(
      RUN_HISTORY_STORAGE_KEY,
      JSON.stringify(
        updatedHistory
      )
    );


    // --------------------------------------------------------
    // Record Scheduled Activity Completion
    // --------------------------------------------------------
    //
    // Only do this after the run has successfully been written
    // to history.

    recordScheduledRunCompletion(
      completedRun
    );


    // --------------------------------------------------------
    // Synchronize React State
    // --------------------------------------------------------

    setHistory(
      updatedHistory
    );

    localStorage.removeItem(
      ACTIVE_RUN_STORAGE_KEY
    );

    setSession(
      completedRun
    );

    setFinished(
      true
    );

    return completedRun;
  }


  // ----------------------------------------------------------
  // Cancel Run
  // ----------------------------------------------------------

  function cancelRun() {
    localStorage.removeItem(
      ACTIVE_RUN_STORAGE_KEY
    );

    setSession(
      null
    );

    setFinished(
      false
    );
  }


  // ----------------------------------------------------------
  // Dismiss Finished Run
  // ----------------------------------------------------------

  function dismissFinishedRun() {
    setSession(
      null
    );

    setFinished(
      false
    );
  }


// ----------------------------------------------------------
// Delete Run
// ----------------------------------------------------------

function deleteRun(
  runId: string
) {
  setHistory(
    (previous) => {
      const runExists =
        previous.some(
          (run) =>
            run.id === runId
        );

      if (!runExists) {
        return previous;
      }

      const updated =
        previous.filter(
          (run) =>
            run.id !==
            runId
        );

      // Keep training-plan completion state synchronized
      // with run history. A scheduled run records its run ID
      // as the completion's workoutSessionId.
      removeTrainingActivityCompletionsByWorkoutSessionId(
        runId
      );

      localStorage.setItem(
        RUN_HISTORY_STORAGE_KEY,
        JSON.stringify(
          updated
        )
      );

      return updated;
    }
  );
}


  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  return {
    session,
    history,

    loaded,
    finished,

    startRun,

    updateDuration,
    updateDistance,
    updateRpe,
    updateNotes,

    finishRun,
    cancelRun,
    dismissFinishedRun,

    deleteRun,
  };
}