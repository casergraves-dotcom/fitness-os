"use client";

// ============================================================
// Imports
// ============================================================

import {
  useMemo,
} from "react";

import {
  useBodyCompositionGoalProgress,
} from "../hooks/useBodyCompositionGoalProgress";

import {
  useBodyCompositionGoals,
} from "../hooks/useBodyCompositionGoals";

import {
  useBodyCompositionTrends,
} from "../hooks/useBodyCompositionTrends";

import {
  useBodyMeasurements,
} from "../hooks/useBodyMeasurements";

import {
  useExerciseProgress,
} from "../hooks/useExerciseProgress";

import {
  useWeeklyReview,
} from "../hooks/useWeeklyReview";

import {
  getRecoveryProgressTrend,
} from "../utils/getRecoveryProgressTrend";

import {
  getRunningProgressTrend,
} from "../utils/getRunningProgressTrend";

import {
  getStrengthProgressTrend,
} from "../utils/getStrengthProgressTrend";

import {
  useMorningCheckIn,
} from "@/features/recovery/hooks/useMorningCheckIn";

import {
  useRunSession,
} from "@/features/running/hooks/useRunSession";

import {
  getCurrentWeeklyProgress,
} from "@/features/today/utils/getCurrentWeeklyProgress";

import {
  useTrainingActivityCompletions,
} from "@/features/workout/hooks/useTrainingActivityCompletions";

import {
  useTrainingPlanState,
} from "@/features/workout/hooks/useTrainingPlanState";

import {
  useWorkoutHistory,
} from "@/features/workout/hooks/useWorkoutHistory";

import type {
  WeeklyReviewTrainingDecision,
} from "../utils/getWeeklyReview";


// ============================================================
// Weekly Review
// ============================================================

export default function WeeklyReview() {
  // ----------------------------------------------------------
  // Goal Progress
  // ----------------------------------------------------------

  const {
    loaded:
      measurementsLoaded,

    measurements,
  } =
    useBodyMeasurements();

  const {
    currentGoal,
  } =
    useBodyCompositionGoals();

  const {
    weightTrend,
  } =
    useBodyCompositionTrends(
      measurements
    );

  const goalProgress =
    useBodyCompositionGoalProgress(
      currentGoal,
      weightTrend
    );


  // ----------------------------------------------------------
  // Current Week
  // ----------------------------------------------------------

  const {
    state:
      trainingPlanState,

    loaded:
      trainingPlanStateLoaded,
  } =
    useTrainingPlanState();

  const {
    completions:
      trainingActivityCompletions,

    loaded:
      trainingActivityCompletionsLoaded,
  } =
    useTrainingActivityCompletions();

  const {
    history:
      morningCheckInHistory,

    loaded:
      morningCheckInLoaded,
  } =
    useMorningCheckIn();

  const {
    history:
      workoutHistory,

    loaded:
      workoutHistoryLoaded,
  } =
    useWorkoutHistory();

  const {
    history:
      runHistory,

    loaded:
      runHistoryLoaded,
  } =
    useRunSession();


  // ----------------------------------------------------------
  // Strength Progress
  // ----------------------------------------------------------

  const {
    exercises:
      strengthExercises,

    loaded:
      strengthExercisesLoaded,
  } =
    useExerciseProgress();

  const primaryStrengthExercise =
    strengthExercises[0];

  const {
    progress:
      strengthProgressHistory,

    loaded:
      strengthProgressLoaded,
  } =
    useExerciseProgress(
      primaryStrengthExercise
    );


  const strengthProgressTrend =
    useMemo(
      () =>
        getStrengthProgressTrend(
          strengthProgressHistory
        ),
      [
        strengthProgressHistory,
      ]
    );


  // ----------------------------------------------------------
  // Running Progress
  // ----------------------------------------------------------

  const runningProgressTrend =
    useMemo(
      () =>
        getRunningProgressTrend(
          runHistory
        ),
      [
        runHistory,
      ]
    );


  // ----------------------------------------------------------
  // Recovery Trend
  // ----------------------------------------------------------

  const recoveryProgressTrend =
    useMemo(
      () =>
        getRecoveryProgressTrend(
          morningCheckInHistory
        ),
      [
        morningCheckInHistory,
      ]
    );


  // ----------------------------------------------------------
  // Current Weekly Progress
  // ----------------------------------------------------------

  const trainingLoaded =
    trainingPlanStateLoaded &&
    trainingActivityCompletionsLoaded &&
    morningCheckInLoaded &&
    workoutHistoryLoaded &&
    runHistoryLoaded &&
    strengthExercisesLoaded &&
    strengthProgressLoaded;


  const weeklyProgress =
    trainingLoaded
      ? getCurrentWeeklyProgress(
          trainingPlanState,
          trainingActivityCompletions,
          new Date(),
          morningCheckInHistory,
          workoutHistory,
          runHistory
        )
      : null;


  // ----------------------------------------------------------
  // Review
  // ----------------------------------------------------------

  const {
    loaded:
      reviewLoaded,

    review,
  } =
    useWeeklyReview({
      weeklyProgress,

      goalProgress,

      strengthProgressTrend,

      runningProgressTrend,

      recoveryProgressTrend,
    });


  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  if (
    !measurementsLoaded ||
    !trainingLoaded ||
    !reviewLoaded
  ) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <p className="text-sm text-slate-500">
          Preparing weekly review...
        </p>

      </div>
    );
  }


  // ----------------------------------------------------------
  // No Active Week
  // ----------------------------------------------------------

  if (!review) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Reflect
        </p>

        <h3 className="mt-1 text-lg font-bold text-slate-900">
          Weekly Review
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Start an active training plan to build a weekly review from your
          training, recovery, and goal-progress data.
        </p>

      </div>
    );
  }


  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <div className="flex flex-wrap items-start justify-between gap-3">

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Reflect
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-900">
            {review.trainingDecision.isFinal ? "Weekly Review" : "Week So Far"}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {
              review.trainingDecision.isFinal
                ? "A completed-week summary of what matters most."
                : "A current-week reflection. Final adherence and next week's decision wait until this training week closes."
            }
          </p>
        </div>


        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          {
            review.trainingDecision.isFinal
              ? "Final"
              : "In progress"
          }
        </span>

      </div>


      {/* ====================================================
          Training
      ==================================================== */}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">

        <Metric
          label="Training Adherence"
          value={
            review.training.requiredScheduled === 0
              ? "—"
              : `${Math.round(review.training.adherenceRate * 100)}%`
          }
          detail={
            `${review.training.requiredCompleted}/${review.training.requiredScheduled} required activities due so far`
          }
        />

        <Metric
          label="Strength Sessions"
          value={
            `${review.training.completedStrengthCount}/${review.training.scheduledStrengthCount}`
          }
          detail={
            `Minimum ${review.training.requiredStrengthCount} required`
          }
        />

        <Metric
          label="Next Week"
          value={
            review.trainingDecision.isFinal
              ? formatDecisionStatus(review.trainingDecision.status)
              : "Pending"
          }
          detail={
            review.trainingDecision.isFinal
              ? "Current training decision"
              : "Evaluated after the week closes"
          }
        />

      </div>


      {/* ====================================================
          Key Observations
      ==================================================== */}

      <div className="mt-6 border-t border-slate-200 pt-5">

        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          What Stands Out
        </p>

        <div className="mt-3 space-y-3">

          {review.observations.map(
            (
              observation,
              index
            ) => (
              <div
                key={
                  `${observation.type}-${index}`
                }
                className="rounded-xl bg-slate-50 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {
                    observation.type ===
                    "GoalProgress"
                      ? "Goal Progress"
                      : observation.type
                  }
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {
                    observation.message
                  }
                </p>
              </div>
            )
          )}

        </div>

      </div>


      {/* ====================================================
          Weekly Signals
      ==================================================== */}

      <div className="mt-6 border-t border-slate-200 pt-5">

        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Weekly Signals
        </p>

        <div className="mt-3 grid gap-3 lg:grid-cols-3">

          <Signal
            label="Strength Quality"
            status={
              formatStrengthStatus(
                review.strength.status
              )
            }
            message={
              review.strength.message
            }
          />

          <Signal
            label="Running / Cardio"
            status={
              formatRunningStatus(
                review.running.status
              )
            }
            message={
              review.running.message
            }
          />

          <Signal
            label="Recovery"
            status={
              formatRecoveryStatus(
                review.recovery.status
              )
            }
            message={
              review.recovery.message
            }
          />

        </div>

      </div>


      {/* ====================================================
          Data Limitations
      ==================================================== */}

      {review.dataLimitations.length >
        0 && (
        <details className="group mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 marker:hidden">
            <span className="flex items-center justify-between gap-3">
              <span>
                Still learning in {review.dataLimitations.length} {review.dataLimitations.length === 1 ? "area" : "areas"}
              </span>
              <span aria-hidden="true" className="text-slate-500 transition-transform group-open:rotate-180">
                ⌄
              </span>
            </span>
          </summary>

          <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">

            {review.dataLimitations.map(
              (
                limitation
              ) => (
                <p
                  key={
                    limitation
                  }
                  className="text-sm leading-6 text-slate-600"
                >
                  {
                    limitation
                  }
                </p>
              )
            )}

          </div>

        </details>
      )}


      {/* ====================================================
          Decision Explanation
      ==================================================== */}

      <div className="mt-5">

        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {review.trainingDecision.isFinal ? "Training Decision" : "Decision Timing"}
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-700">
          {
            review.trainingDecision.isFinal
              ? review.trainingDecision.reason
              : "The final training decision will be evaluated after this training week closes. Activities not yet due are not counted against adherence."
          }
        </p>

      </div>

    </div>
  );
}


// ============================================================
// Metric
// ============================================================

function Metric({
  label,
  value,
  detail,
}: {
  label:
    string;

  value:
    string;

  detail:
    string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {
          label
        }
      </p>

      <p className="mt-1 text-lg font-bold text-slate-900">
        {
          value
        }
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {
          detail
        }
      </p>

    </div>
  );
}


// ============================================================
// Signal
// ============================================================

function Signal({
  label,
  status,
  message,
}: {
  label:
    string;

  status:
    string;

  message:
    string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <div className="flex items-start justify-between gap-3">

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {
            label
          }
        </p>

        <span className="text-xs font-medium text-slate-600">
          {
            status
          }
        </span>

      </div>

      <p className="mt-2 text-sm leading-6 text-slate-700">
        {
          message
        }
      </p>

    </div>
  );
}


// ============================================================
// Decision Status
// ============================================================

function formatDecisionStatus(
  status:
    WeeklyReviewTrainingDecision["status"]
) {
  switch (status) {
    case "Advance":
      return "Advance";

    case "AdvanceWithWarning":
      return "Advance carefully";

    case "Hold":
      return "Hold";
  }
}


// ============================================================
// Strength Status
// ============================================================

function formatStrengthStatus(
  status:
    "NoData" |
    "Supported" |
    "Limited" |
    "Poor"
) {
  switch (status) {
    case "NoData":
      return "No data";

    case "Supported":
      return "Supported";

    case "Limited":
      return "Limited";

    case "Poor":
      return "Poor";
  }
}


// ============================================================
// Running Status
// ============================================================

function formatRunningStatus(
  status:
    "NoData" |
    "Supportive" |
    "Limited" |
    "Poor"
) {
  switch (status) {
    case "NoData":
      return "No data";

    case "Supportive":
      return "Supportive";

    case "Limited":
      return "Limited";

    case "Poor":
      return "Poor";
  }
}


// ============================================================
// Recovery Status
// ============================================================

function formatRecoveryStatus(
  status:
    "NoData" |
    "Supported" |
    "Limited" |
    "Poor"
) {
  switch (status) {
    case "NoData":
      return "No data";

    case "Supported":
      return "Supported";

    case "Limited":
      return "Limited";

    case "Poor":
      return "Poor";
  }
}
