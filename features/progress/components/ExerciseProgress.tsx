"use client";

import { useMemo, useState } from "react";

import { useExerciseProgress } from "../hooks/useExerciseProgress";
import {
  getProgressChartRangeStartDate,
  isDateInProgressChartRange,
} from "../utils/progressChartRange";
import type { ProgressChartRange } from "../utils/progressChartRange";
import ProgressChartRangeSelect from "./ProgressChartRangeSelect";
import StrengthProgressChart from "./StrengthProgressChart";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export default function ExerciseProgress() {
  const [selectedExercise, setSelectedExercise] = useState<string>();
  const [chartRange, setChartRange] =
    useState<ProgressChartRange>("6m");
  const { loaded, exercises, progress } =
    useExerciseProgress(selectedExercise);

  const visibleProgress = useMemo(() => {
    const latestDate = progress.at(-1)?.date;
    const rangeStartDate = getProgressChartRangeStartDate(
      latestDate,
      chartRange
    );

    return progress.filter((entry) =>
      isDateInProgressChartRange(entry.date, rangeStartDate)
    );
  }, [chartRange, progress]);

  const summary = useMemo(() => {
    if (progress.length === 0) {
      return null;
    }

    const first = progress[0];
    const current = progress[progress.length - 1];
    const best = progress.reduce((bestEntry, entry) =>
      entry.estimatedOneRepMax > bestEntry.estimatedOneRepMax
        ? entry
        : bestEntry
    );
    const change =
      current.estimatedOneRepMax - first.estimatedOneRepMax;
    const percentChange =
      first.estimatedOneRepMax === 0
        ? 0
        : (change / first.estimatedOneRepMax) * 100;

    return { current, best, change, percentChange };
  }, [progress]);

  if (!loaded) {
    return (
      <div className="py-8 text-center text-slate-500">
        Loading progress...
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-center shadow-sm">
        <h2 className="font-semibold">No Exercise Data Yet</h2>
        <p className="mt-2 text-sm text-slate-500">
          Complete a weighted exercise to begin tracking progress.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <label htmlFor="exercise-progress" className="text-sm font-semibold">
          Exercise
        </label>
        <select
          id="exercise-progress"
          value={selectedExercise ?? ""}
          onChange={(event) => setSelectedExercise(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
        >
          <option value="">
            Choose exercise
          </option>

          {exercises.map((exercise) => (
            <option key={exercise} value={exercise}>
              {exercise}
            </option>
          ))}
        </select>
      </div>

      {selectedExercise ? (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-500">PERFORMANCE</p>
        <h2 className="mt-1 text-xl font-bold">{selectedExercise}</h2>

        {summary && (
          <div className="mt-5 grid grid-cols-3 gap-2">
            <Metric label="Current" value={summary.current.estimatedOneRepMax} />
            <Metric label="Best" value={summary.best.estimatedOneRepMax} />
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Change
              </p>
              <p
                className={`mt-2 text-xl font-bold ${
                  summary.change > 0
                    ? "text-green-600"
                    : summary.change < 0
                      ? "text-red-600"
                      : ""
                }`}
              >
                {summary.change > 0 ? "+" : ""}
                {Math.round(summary.change)}
                <span className="ml-1 text-sm font-medium">lb</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {summary.percentChange > 0 ? "+" : ""}
                {summary.percentChange.toFixed(1)}% since first
              </p>
            </div>
          </div>
        )}

        <div className="mt-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Strength Trend
              </p>
              <p className="mt-1 text-xs text-slate-500">
                The display range only changes the chart. Complete performance history remains below.
              </p>
            </div>
            <ProgressChartRangeSelect
              value={chartRange}
              onChange={setChartRange}
            />
          </div>
          <StrengthProgressChart
            progress={visibleProgress}
            hasHistoricalData={progress.length >= 2}
          />
        </div>

        <div className="mt-5 space-y-2">
          {progress.map((entry) => (
            <div
              key={entry.workoutId}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
            >
              <div>
                <p className="font-medium">{formatDate(entry.date)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Estimated 1RM: {Math.round(entry.estimatedOneRepMax)} lb
                </p>
              </div>
              <p className="font-semibold">
                {entry.weight} lb × {entry.reps}
              </p>
            </div>
          ))}
        </div>
        </div>
      ) : (
        <div className="rounded-2xl border bg-white p-6 text-center shadow-sm">
          <h2 className="font-semibold text-slate-900">
            Choose an exercise to review
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Select an exercise above to review its estimated-strength history. At least two completed performances are needed to identify a trend.
          </p>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-bold">
        {Math.round(value)}
        <span className="ml-1 text-sm font-medium text-slate-500">lb</span>
      </p>
      <p className="mt-1 text-xs text-slate-500">Estimated 1RM</p>
    </div>
  );
}
