"use client";

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
  useRunSession,
} from "@/features/running/hooks/useRunSession";

import {
  getCurrentWeeklyProgress,
} from "@/features/today/utils/getCurrentWeeklyProgress";

import {
  useMorningCheckIn,
} from "@/features/recovery/hooks/useMorningCheckIn";

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
// Helpers
// ============================================================

function getBodyCompositionMessage(
  status:
    string
) {
  switch (
    status
  ) {
    case "OnTrack":
      return "Body-composition progress is moving in the intended direction.";

    case "FasterThanExpected":
      return "Body-composition progress is moving faster than planned.";

    case "SlowerThanExpected":
      return "Body-composition progress is moving toward the goal, but slower than planned.";

    case "Plateau":
      return "The recent body-composition trend appears relatively flat.";

    case "MovingAwayFromGoal":
      return "The recent body-composition trend is moving away from the current goal.";

    default:
      return "There is not enough body-composition trend data yet to judge progress confidently.";
  }
}


// ============================================================
// Progress Outcome Summary
// ============================================================

export default function ProgressOutcomeSummary() {
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


  const {
    exercises,
  } =
    useExerciseProgress();

  const primaryExercise =
    exercises[0];

  const {
    progress:
      strengthProgress,
  } =
    useExerciseProgress(
      primaryExercise
    );


  const strengthChange =
    useMemo(
      () => {
        if (
          strengthProgress.length <
          2
        ) {
          return undefined;
        }

        const first =
          strengthProgress[0]
            .estimatedOneRepMax;

        const latest =
          strengthProgress[
            strengthProgress.length -
            1
          ].estimatedOneRepMax;

        if (
          first ===
          0
        ) {
          return undefined;
        }

        return (
          (
            latest -
            first
          ) /
          first
        ) *
          100;
      },
      [
        strengthProgress,
      ]
    );


  const {
    history:
      runHistory,

    loaded:
      runHistoryLoaded,
  } =
    useRunSession();


  const runsWithPace =
    useMemo(
      () =>
        runHistory.filter(
          (
            run
          ) =>
            run.durationMinutes !==
              undefined &&
            run.durationMinutes >
              0 &&
            run.distanceMiles !==
              undefined &&
            run.distanceMiles >
              0
        ),
      [
        runHistory,
      ]
    );


  const paceChange =
    useMemo(
      () => {
        if (
          runsWithPace.length <
          2
        ) {
          return undefined;
        }

        const chronological =
          [
            ...runsWithPace,
          ].sort(
            (
              a,
              b
            ) =>
              (
                a.completedAt ??
                a.startedAt
              ).localeCompare(
                b.completedAt ??
                b.startedAt
              )
          );

        const first =
          chronological[0];

        const latest =
          chronological[
            chronological.length -
            1
          ];

        const firstPace =
          first.durationMinutes! /
          first.distanceMiles!;

        const latestPace =
          latest.durationMinutes! /
          latest.distanceMiles!;

        if (
          firstPace ===
          0
        ) {
          return undefined;
        }

        return (
          (
            firstPace -
            latestPace
          ) /
          firstPace
        ) *
          100;
      },
      [
        runsWithPace,
      ]
    );


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


  const adherenceLoaded =
    trainingPlanStateLoaded &&
    trainingActivityCompletionsLoaded &&
    morningCheckInLoaded &&
    workoutHistoryLoaded &&
    runHistoryLoaded;


  const weeklyProgress =
    adherenceLoaded
      ? getCurrentWeeklyProgress(
          trainingPlanState,
          trainingActivityCompletions,
          new Date(),
          morningCheckInHistory,
          workoutHistory,
          runHistory
        )
      : null;


  if (
    !measurementsLoaded ||
    !adherenceLoaded
  ) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <p className="text-sm text-slate-500">
          Evaluating current progress...
        </p>

      </div>
    );
  }


  const bodyCompositionPositive =
    goalProgress.status ===
      "OnTrack" ||
    goalProgress.status ===
      "FasterThanExpected" ||
    goalProgress.status ===
      "SlowerThanExpected";

  const strengthPositive =
    strengthChange ===
      undefined ||
    strengthChange >=
      -5;

  const cardioPositive =
    paceChange ===
      undefined ||
    paceChange >=
      -5;

  const adherencePositive =
    weeklyProgress?.evaluationReady
      ? weeklyProgress
          .adherence
          .adherenceRate >=
        0.75
      : true;


  const enoughEvidence =
    goalProgress.status !==
    "InsufficientData";


  const working =
    enoughEvidence &&
    bodyCompositionPositive &&
    strengthPositive &&
    cardioPositive &&
    adherencePositive;


  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
        Current Approach
      </p>

      <h3 className="mt-1 text-lg font-bold text-slate-900">
        {
          !enoughEvidence
            ? "Not enough evidence yet"
            : working
              ? "The current approach appears to be working"
              : "The current approach may need attention"
        }
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {
          getBodyCompositionMessage(
            goalProgress.status
          )
        }
      </p>


      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

        <Signal
          label="Body Composition"
          value={
            bodyCompositionPositive
              ? "Positive"
              : "Needs attention"
          }
        />

        <Signal
          label="Strength"
          value={
            strengthChange ===
            undefined
              ? "Not enough data"
              : strengthPositive
                ? "Maintained"
                : "Declining"
          }
        />

        <Signal
          label="Cardio"
          value={
            paceChange ===
            undefined
              ? "Not enough data"
              : cardioPositive
                ? "Maintained"
                : "Declining"
          }
        />

        <Signal
          label="Adherence"
          value={
            weeklyProgress?.adherence
              ? `${Math.round(
                  weeklyProgress
                    .adherence
                    .adherenceRate *
                  100
                )}%`
              : "Not enough data"
          }
        />

      </div>


      <p className="mt-4 text-xs leading-5 text-slate-500">
        This summary uses longer-term body-composition trend data and supporting
        training context. It should not trigger automatic training changes from
        a single measurement or short-term fluctuation.
      </p>

    </div>
  );
}


// ============================================================
// Signal
// ============================================================

function Signal({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-900">
        {value}
      </p>

    </div>
  );
}