"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  StrengthProgressChart,
} from "@/features/progress";

import { Select } from "@/components/ui/select";

import {
  useExerciseProgress,
} from "../hooks/useExerciseProgress";


export default function StrengthRetentionSummary() {
  const [
    selectedExercise,
    setSelectedExercise,
  ] =
    useState<string>();

  const {
    loaded,
    exercises,
    progress,
  } =
    useExerciseProgress(
      selectedExercise
    );


  useEffect(() => {
    if (
      !selectedExercise &&
      exercises.length >
      0
    ) {
      setSelectedExercise(
        exercises[0]
      );
    }
  }, [
    exercises,
    selectedExercise,
  ]);


  const summary =
    useMemo(
      () => {
        if (
          progress.length ===
          0
        ) {
          return null;
        }

        const first =
          progress[0];

        const current =
          progress[
            progress.length -
            1
          ];

        const best =
          progress.reduce(
            (
              bestEntry,
              entry
            ) =>
              entry.estimatedOneRepMax >
              bestEntry.estimatedOneRepMax
                ? entry
                : bestEntry
          );

        const change =
          current.estimatedOneRepMax -
          first.estimatedOneRepMax;

        const percentChange =
          first.estimatedOneRepMax ===
          0
            ? 0
            : (
                change /
                first.estimatedOneRepMax
              ) *
              100;

        return {
          current,
          best,
          change,
          percentChange,
        };
      },
      [
        progress,
      ]
    );


  if (
    !loaded
  ) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <p className="text-sm text-slate-500">
          Loading strength progress...
        </p>

      </div>
    );
  }


  if (
    exercises.length ===
    0
  ) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <h3 className="text-lg font-bold text-slate-900">
          Strength Retention
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Track whether strength is being maintained while body composition changes.
        </p>

        <div className="mt-5 rounded-xl bg-slate-50 p-5 text-center">

          <p className="font-semibold text-slate-700">
            No weighted exercise history yet
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div>

          <h3 className="text-lg font-bold text-slate-900">
            Strength Retention
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Compare body-composition progress against estimated strength performance.
          </p>

        </div>


        <label className="min-w-64">

          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Exercise
          </span>

          <Select
            value={
              selectedExercise ??
              ""
            }
            onChange={
              (
                event
              ) =>
                setSelectedExercise(
                  event.target.value
                )
            }
            className="mt-1"
          >

            {exercises.map(
              (
                exercise
              ) => (
                <option
                  key={
                    exercise
                  }
                  value={
                    exercise
                  }
                >
                  {exercise}
                </option>
              )
            )}

          </Select>

        </label>

      </div>


      {summary && (
        <div className="mt-5 grid grid-cols-3 gap-3">

          <Metric
            label="Current"
            value={
              Math.round(
                summary.current
                  .estimatedOneRepMax
              )
            }
          />

          <Metric
            label="Best"
            value={
              Math.round(
                summary.best
                  .estimatedOneRepMax
              )
            }
          />

          <Metric
            label="Change"
            value={
              Math.round(
                summary.change
              )
            }
            signed
            detail={
              `${summary.percentChange > 0 ? "+" : ""}${summary.percentChange.toFixed(
                1
              )}% since first`
            }
          />

        </div>
      )}


      <div className="mt-5">

        <StrengthProgressChart
          progress={
            progress
          }
        />

      </div>

    </div>
  );
}


function Metric({
  label,
  value,
  signed = false,
  detail,
}: {
  label:
    string;

  value:
    number;

  signed?:
    boolean;

  detail?:
    string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-900">
        {signed &&
        value >
        0
          ? "+"
          : ""}
        {value}
        <span className="ml-1 text-sm font-medium">
          lb
        </span>
      </p>

      {detail && (
        <p className="mt-1 text-xs text-slate-500">
          {detail}
        </p>
      )}

    </div>
  );
}
