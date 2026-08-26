"use client";

import {
  useMorningCheckIn,
} from "@/features/recovery/hooks/useMorningCheckIn";

import {
  getCurrentWeeklyProgress,
} from "@/features/today/utils/getCurrentWeeklyProgress";

import {
  useRunSession,
} from "@/features/running/hooks/useRunSession";

import {
  useTrainingActivityCompletions,
} from "@/features/workout/hooks/useTrainingActivityCompletions";

import {
  useTrainingPlanState,
} from "@/features/workout/hooks/useTrainingPlanState";

import {
  useWorkoutHistory,
} from "@/features/workout/hooks/useWorkoutHistory";


// ============================================================
// Training Adherence Summary
// ============================================================

export default function TrainingAdherenceSummary() {
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


  const loaded =
    trainingPlanStateLoaded &&
    trainingActivityCompletionsLoaded &&
    morningCheckInLoaded &&
    workoutHistoryLoaded &&
    runHistoryLoaded;


  const weeklyProgress =
    loaded
      ? getCurrentWeeklyProgress(
          trainingPlanState,
          trainingActivityCompletions,
          new Date(),
          morningCheckInHistory,
          workoutHistory,
          runHistory
        )
      : null;


  const adherence =
    weeklyProgress?.adherence ??
    null;


  if (
    !loaded
  ) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <p className="text-sm text-slate-500">
          Loading training adherence...
        </p>

      </div>
    );
  }


  if (
    !adherence
  ) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <h3 className="text-lg font-bold text-slate-900">
          Training Adherence
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Track whether planned training is being completed consistently.
        </p>

        <div className="mt-5 rounded-xl bg-slate-50 p-5 text-center">

          <p className="font-semibold text-slate-700">
            No active weekly adherence data
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <h3 className="text-lg font-bold text-slate-900">
        Training Adherence
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Current-week training completion alongside body-composition progress.
      </p>


      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">

        <Metric
          label="Adherence"
          value={
            `${Math.round(
              adherence.adherenceRate *
              100
            )}%`
          }
          detail="Required work"
        />

        <Metric
          label="Required"
          value={
            `${adherence.requiredCompleted}/${adherence.requiredCount}`
          }
          detail="Completed"
        />

        <Metric
          label="Optional"
          value={
            `${adherence.optionalCompleted}/${adherence.optionalCount}`
          }
          detail="Completed"
        />

        <Metric
          label="Week Status"
          value={
            adherence.allRequiredCompleted
              ? "Complete"
              : "In progress"
          }
          detail={
            adherence.weekName
          }
        />

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
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {detail}
      </p>

    </div>
  );
}