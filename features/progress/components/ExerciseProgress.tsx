"use client";

// ============================================================
// Imports
// ============================================================

import { useEffect, useMemo, useState } from "react";

import { useExerciseProgress } from "../hooks/useExerciseProgress";

import StrengthProgressChart from "./StrengthProgressChart";

// ============================================================
// Helpers
// ============================================================

function formatDate(date: string) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  ).format(new Date(date));
}

// ============================================================
// Exercise Progress
// ============================================================

export default function ExerciseProgress() {
  // ----------------------------------------------------------
  // Selected Exercise
  // ----------------------------------------------------------

  const [
    selectedExercise,
    setSelectedExercise,
  ] = useState<string>();

  const {
    loaded,
    exercises,
    progress,
  } = useExerciseProgress(
    selectedExercise
  );

  // ----------------------------------------------------------
  // Select First Exercise Automatically
  // ----------------------------------------------------------

  useEffect(() => {
    if (
      !selectedExercise &&
      exercises.length > 0
    ) {
      setSelectedExercise(
        exercises[0]
      );
    }
  }, [
    exercises,
    selectedExercise,
  ]);

  // ----------------------------------------------------------
  // Progress Summary
  // ----------------------------------------------------------

  const summary = useMemo(() => {
    if (progress.length === 0) {
      return null;
    }

    // Progress is stored oldest -> newest.
    const first = progress[0];

    const current =
      progress[progress.length - 1];

    // Find the highest estimated 1RM ever recorded
    // for this exercise.
    const best = progress.reduce(
      (bestEntry, entry) =>
        entry.estimatedOneRepMax >
        bestEntry.estimatedOneRepMax
          ? entry
          : bestEntry
    );

    // Overall estimated strength change from the first
    // logged workout to the most recent workout.
    const change =
      current.estimatedOneRepMax -
      first.estimatedOneRepMax;

    // Percentage change gives us a useful comparison
    // between exercises with very different weights.
    const percentChange =
      first.estimatedOneRepMax === 0
        ? 0
        : (change /
            first.estimatedOneRepMax) *
          100;

    return {
      current,
      best,
      change,
      percentChange,
    };
  }, [progress]);

  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  if (!loaded) {
    return (
      <div className="py-8 text-center text-slate-500">
        Loading progress...
      </div>
    );
  }

  // ----------------------------------------------------------
  // Empty State
  // ----------------------------------------------------------

  if (exercises.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-center shadow-sm">
        <h2 className="font-semibold">
          No Exercise Data Yet
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Complete a workout to begin tracking progress.
        </p>
      </div>
    );
  }

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* ----------------------------------------------------
          Exercise Selector
      ----------------------------------------------------- */}

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <label
          htmlFor="exercise-progress"
          className="text-sm font-semibold"
        >
          Exercise
        </label>

        <select
          id="exercise-progress"
          value={
            selectedExercise ?? ""
          }
          onChange={(event) =>
            setSelectedExercise(
              event.target.value
            )
          }
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
        >
          {exercises.map((exercise) => (
            <option
              key={exercise}
              value={exercise}
            >
              {exercise}
            </option>
          ))}
        </select>
      </div>

      {/* ----------------------------------------------------
          Performance
      ----------------------------------------------------- */}

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            PERFORMANCE
          </p>

          <h2 className="mt-1 text-xl font-bold">
            {selectedExercise}
          </h2>
        </div>

        {/* --------------------------------------------------
            Summary Metrics
        --------------------------------------------------- */}

        {summary && (
          <div className="mt-5 grid grid-cols-3 gap-2">
            {/* Current Strength */}
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Current
              </p>

              <p className="mt-2 text-xl font-bold">
                {Math.round(
                  summary.current
                    .estimatedOneRepMax
                )}
                <span className="ml-1 text-sm font-medium text-slate-500">
                  lb
                </span>
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Estimated 1RM
              </p>
            </div>

            {/* All-Time Best */}
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Best
              </p>

              <p className="mt-2 text-xl font-bold">
                {Math.round(
                  summary.best
                    .estimatedOneRepMax
                )}
                <span className="ml-1 text-sm font-medium text-slate-500">
                  lb
                </span>
              </p>

              <p className="mt-1 text-xs text-slate-500">
                All-time e1RM
              </p>
            </div>

            {/* Overall Change */}
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
                {summary.change > 0
                  ? "+"
                  : ""}
                {Math.round(
                  summary.change
                )}

                <span className="ml-1 text-sm font-medium">
                  lb
                </span>
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {summary.percentChange > 0
                  ? "+"
                  : ""}
                {summary.percentChange.toFixed(
                  1
                )}
                % since first
              </p>
            </div>
          </div>
        )}

        {/* --------------------------------------------------
            Strength Progress Chart
        --------------------------------------------------- */}

        <div className="mt-6">
          <StrengthProgressChart
            progress={progress}
          />
        </div>

        {/* --------------------------------------------------
            Performance History
        --------------------------------------------------- */}

        <div className="mt-5 space-y-2">
          {progress.map((entry) => (
            <div
              key={entry.workoutId}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
            >
              <div>
                <p className="font-medium">
                  {formatDate(
                    entry.date
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Estimated 1RM:{" "}
                  {Math.round(
                    entry.estimatedOneRepMax
                  )}{" "}
                  lb
                </p>
              </div>

              <p className="font-semibold">
                {entry.weight} lb ×{" "}
                {entry.reps}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}