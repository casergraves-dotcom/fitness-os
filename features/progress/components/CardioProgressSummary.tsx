"use client";

import {
  useMemo,
} from "react";

import {
  useRunSession,
} from "@/features/running";


// ============================================================
// Helpers
// ============================================================

function formatPace(
  paceMinutesPerMile:
    number
) {
  if (
    !Number.isFinite(
      paceMinutesPerMile
    ) ||
    paceMinutesPerMile <=
    0
  ) {
    return "—";
  }

  let minutes =
    Math.floor(
      paceMinutesPerMile
    );

  let seconds =
    Math.round(
      (
        paceMinutesPerMile -
        minutes
      ) *
      60
    );

  if (
    seconds ===
    60
  ) {
    minutes +=
      1;

    seconds =
      0;
  }

  return `${minutes}:${seconds
    .toString()
    .padStart(
      2,
      "0"
    )}`;
}


// ============================================================
// Cardio Progress Summary
// ============================================================

export default function CardioProgressSummary() {
  const {
    history,
    loaded,
  } =
    useRunSession();


  const summary =
    useMemo(
      () => {
        if (
          history.length ===
          0
        ) {
          return null;
        }

        const runsWithPace =
          history.filter(
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
          );

        const totalDistance =
          history.reduce(
            (
              total,
              run
            ) =>
              total +
              (
                run.distanceMiles ??
                0
              ),
            0
          );

        const totalMinutes =
          history.reduce(
            (
              total,
              run
            ) =>
              total +
              (
                run.durationMinutes ??
                0
              ),
            0
          );

        const averagePace =
          totalDistance >
            0 &&
          totalMinutes >
            0
            ? totalMinutes /
              totalDistance
            : null;

        const bestPaceRun =
          runsWithPace.length >
          0
            ? runsWithPace.reduce(
                (
                  best,
                  run
                ) => {
                  const runPace =
                    run.durationMinutes! /
                    run.distanceMiles!;

                  const bestPace =
                    best.durationMinutes! /
                    best.distanceMiles!;

                  return runPace <
                    bestPace
                    ? run
                    : best;
                }
              )
            : null;

        return {
          totalRuns:
            history.length,

          totalDistance,

          averagePace,

          bestPaceRun,
        };
      },
      [
        history,
      ]
    );


  if (
    !loaded
  ) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <p className="text-sm text-slate-500">
          Loading cardio progress...
        </p>

      </div>
    );
  }


  if (
    !summary
  ) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <h3 className="text-lg font-bold text-slate-900">
          Running / Cardio
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Track whether cardio performance is being maintained or improved alongside body-composition progress.
        </p>

        <div className="mt-5 rounded-xl bg-slate-50 p-5 text-center">

          <p className="font-semibold text-slate-700">
            No running data yet
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <h3 className="text-lg font-bold text-slate-900">
        Running / Cardio
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Running performance context alongside body-composition progress.
      </p>


      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">

        <Metric
          label="Runs"
          value={
            String(
              summary.totalRuns
            )
          }
          detail="Completed"
        />

        <Metric
          label="Distance"
          value={
            `${summary.totalDistance.toFixed(
              1
            )} mi`
          }
          detail="Total"
        />

        <Metric
          label="Avg Pace"
          value={
            summary.averagePace !==
            null
              ? formatPace(
                  summary.averagePace
                )
              : "—"
          }
          detail="min / mi"
        />

        <Metric
          label="Best Pace"
          value={
            summary.bestPaceRun
              ? formatPace(
                  summary
                    .bestPaceRun
                    .durationMinutes! /
                  summary
                    .bestPaceRun
                    .distanceMiles!
                )
              : "—"
          }
          detail="min / mi"
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