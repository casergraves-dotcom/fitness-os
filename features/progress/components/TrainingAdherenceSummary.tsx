"use client";

import { useMemo, useState } from "react";

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

import {
  getProgressReviewAdherence,
} from "../utils/getProgressReviewAdherence";
import { getRequiredAdherenceToDate } from "../utils/getRequiredAdherenceToDate";
import {
  getProgressReviewPeriod,
} from "../utils/getProgressReviewPeriod";
import {
  getProgressChartRangeStartDate,
  isDateInProgressChartRange,
} from "../utils/progressChartRange";
import type { ProgressChartRange } from "../utils/progressChartRange";
import ProgressChartRangeSelect from "./ProgressChartRangeSelect";
import TrainingAdherenceTrendChart from "./TrainingAdherenceTrendChart";


// ============================================================
// Training Adherence Summary
// ============================================================

export default function TrainingAdherenceSummary() {
  const [chartRange, setChartRange] =
    useState<ProgressChartRange>("6m");
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

  const today = new Date();
  const currentDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const requiredToDate =
    adherence
      ? getRequiredAdherenceToDate(adherence, currentDate)
      : null;

  const optionalToDate =
    adherence
      ? adherence.activities.filter(
          (item) =>
            !item.required &&
            item.activity.optional === true &&
            !item.activity.substitutionGroup &&
            item.date <= currentDate
        )
      : [];

  const adherenceHistory = useMemo(() => {
    if (!loaded) {
      return null;
    }

    return getProgressReviewAdherence({
      period: getProgressReviewPeriod({
        range: "All",
        earliestAvailableDate: trainingPlanState?.startDate ?? null,
      }),
      trainingPlanState,
      completions: trainingActivityCompletions,
      recoveryCheckIns: morningCheckInHistory,
      workoutHistory,
      runHistory,
    });
  }, [
    loaded,
    morningCheckInHistory,
    runHistory,
    trainingActivityCompletions,
    trainingPlanState,
    workoutHistory,
  ]);

  const visibleAdherenceWeeks = useMemo(() => {
    const weeks = adherenceHistory?.weeks ?? [];
    const latestDate = weeks.at(-1)?.weekStartDate;
    const rangeStartDate = getProgressChartRangeStartDate(
      latestDate,
      chartRange
    );

    return weeks.filter((week) =>
      isDateInProgressChartRange(week.weekStartDate, rangeStartDate)
    );
  }, [adherenceHistory, chartRange]);


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
        Current-week completion and historical consistency for required training.
      </p>


      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">

        <Metric
          label="Adherence"
          value={
            requiredToDate && requiredToDate.requiredScheduled > 0
              ? `${Math.round(requiredToDate.adherenceRate * 100)}%`
              : "—"
          }
          detail="Required work due so far"
        />

        <Metric
          label="Required"
          value={
            `${requiredToDate?.requiredCompleted ?? 0}/${requiredToDate?.requiredScheduled ?? 0}`
          }
          detail="Due so far"
        />

        <Metric
          label="Optional"
          value={
            `${optionalToDate.filter((item) => item.completed).length}/${optionalToDate.length}`
          }
          detail="Available so far"
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

      <div className="mt-6 border-t border-slate-200 pt-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Complete-Week Trend
            </p>
            <p className="mt-1 text-xs text-slate-500">
              The current partial week is intentionally excluded from this chart.
            </p>
          </div>
          <ProgressChartRangeSelect
            value={chartRange}
            onChange={setChartRange}
          />
        </div>

        <div className="mt-5">
          <TrainingAdherenceTrendChart
            weeks={visibleAdherenceWeeks}
            hasHistoricalData={(adherenceHistory?.weeks.length ?? 0) > 0}
          />
        </div>
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
