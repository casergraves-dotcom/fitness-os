"use client";

// ============================================================
// Imports
// ============================================================

import {
  useMemo,
  useState,
} from "react";

import {
  useRunSession,
} from "@/features/running";

import {
  getProgressChartRangeStartDate,
  isDateInProgressChartRange,
} from "../utils/progressChartRange";
import type { ProgressChartRange } from "../utils/progressChartRange";
import ProgressChartRangeSelect from "./ProgressChartRangeSelect";
import RunningPaceTrendChart from "./RunningPaceTrendChart";


// ============================================================
// Helpers
// ============================================================

function formatPace(
  paceMinutesPerMile: number
) {
  if (
    !Number.isFinite(
      paceMinutesPerMile
    ) ||
    paceMinutesPerMile <= 0
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
      ) * 60
    );

  if (seconds === 60) {
    minutes += 1;
    seconds = 0;
  }

  return `${minutes}:${seconds
    .toString()
    .padStart(
      2,
      "0"
    )}`;
}


function formatDate(
  date: string
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  ).format(
    new Date(date)
  );
}


// ============================================================
// Running Progress
// ============================================================

export default function RunningProgress() {

  const [
    chartRange,
    setChartRange,
  ] = useState<ProgressChartRange>("6m");

  const {
    history,
    loaded,
  } = useRunSession();


  // ----------------------------------------------------------
  // Completed Runs With Pace Data
  // ----------------------------------------------------------

  const runsWithPace =
    useMemo(
      () =>
        history.filter(
          (run) =>
            run.durationMinutes !==
              undefined &&
            run.durationMinutes > 0 &&
            run.distanceMiles !==
              undefined &&
            run.distanceMiles > 0
        ),
      [history]
    );

  const visibleRunsWithPace =
    useMemo(() => {
      const latestDate = runsWithPace.reduce<string | undefined>(
        (latest, run) => {
          const date = (run.completedAt ?? run.startedAt).slice(0, 10);
          return !latest || date > latest ? date : latest;
        },
        undefined
      );
      const rangeStartDate = getProgressChartRangeStartDate(
        latestDate,
        chartRange
      );

      return runsWithPace.filter((run) =>
        isDateInProgressChartRange(
          (run.completedAt ?? run.startedAt).slice(0, 10),
          rangeStartDate
        )
      );
    }, [chartRange, runsWithPace]);


  // ----------------------------------------------------------
  // Summary
  // ----------------------------------------------------------

  const summary =
    useMemo(() => {

      if (
        history.length === 0
      ) {
        return null;
      }

      const totalDistance =
        history.reduce(
          (total, run) =>
            total +
            (
              run.distanceMiles ??
              0
            ),
          0
        );

      const totalMinutes =
        history.reduce(
          (total, run) =>
            total +
            (
              run.durationMinutes ??
              0
            ),
          0
        );

      const averagePace =
        totalDistance > 0 &&
        totalMinutes > 0
          ? totalMinutes /
            totalDistance
          : null;

      const bestPaceRun =
        runsWithPace.reduce(
          (
            best,
            run
          ) => {
            if (!best) {
              return run;
            }

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
          },
          runsWithPace[0]
        );

      return {
        totalRuns:
          history.length,

        totalDistance,

        totalMinutes,

        averagePace,

        bestPaceRun,
      };

    }, [
      history,
      runsWithPace,
    ]);


  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  if (!loaded) {
    return (
      <div className="py-8 text-center text-slate-500">
        Loading running progress...
      </div>
    );
  }


  // ----------------------------------------------------------
  // Empty State
  // ----------------------------------------------------------

  if (!summary) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-center shadow-sm">

        <p className="font-semibold">
          No Running Data Yet
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Complete a run to begin tracking running progress.
        </p>

      </div>
    );
  }


  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <div className="space-y-4">

      {/* ======================================================
          Summary
      ======================================================= */}

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <div>

          <p className="text-sm font-semibold text-slate-500">
            RUNNING
          </p>

          <h2 className="mt-1 text-xl font-bold">
            Running Progress
          </h2>

        </div>


        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">

          {/* Runs */}

          <div className="rounded-xl bg-slate-50 p-3">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Runs
            </p>

            <p className="mt-2 text-xl font-bold">
              {summary.totalRuns}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Completed
            </p>

          </div>


          {/* Distance */}

          <div className="rounded-xl bg-slate-50 p-3">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Distance
            </p>

            <p className="mt-2 text-xl font-bold">
              {summary.totalDistance.toFixed(
                1
              )}

              <span className="ml-1 text-sm font-medium text-slate-500">
                mi
              </span>

            </p>

            <p className="mt-1 text-xs text-slate-500">
              Total
            </p>

          </div>


          {/* Average Pace */}

          <div className="rounded-xl bg-slate-50 p-3">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Avg Pace
            </p>

            <p className="mt-2 text-xl font-bold">

              {summary.averagePace !==
              null
                ? formatPace(
                    summary.averagePace
                  )
                : "—"}

            </p>

            <p className="mt-1 text-xs text-slate-500">
              min / mi
            </p>

          </div>


          {/* Best Pace */}

          <div className="rounded-xl bg-slate-50 p-3">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Best Pace
            </p>

            <p className="mt-2 text-xl font-bold">

              {summary.bestPaceRun
                ? formatPace(
                    summary
                      .bestPaceRun
                      .durationMinutes! /
                    summary
                      .bestPaceRun
                      .distanceMiles!
                  )
                : "—"}

            </p>

            <p className="mt-1 text-xs text-slate-500">
              min / mi
            </p>

          </div>

        </div>

      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-500">PACE TREND</p>
            <h2 className="mt-1 text-xl font-bold">Pace Over Time</h2>
            <p className="mt-2 text-sm text-slate-500">
              Lower pace is faster. The display range only changes this chart.
            </p>
          </div>
          <ProgressChartRangeSelect
            value={chartRange}
            onChange={setChartRange}
          />
        </div>

        <div className="mt-5">
          <RunningPaceTrendChart
            runs={visibleRunsWithPace}
            hasHistoricalData={runsWithPace.length >= 2}
          />
        </div>
      </div>


      {/* ======================================================
          Recent Performance
      ======================================================= */}

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <p className="text-sm font-semibold text-slate-500">
          RECENT PERFORMANCE
        </p>

        <h2 className="mt-1 text-xl font-bold">
          Runs
        </h2>


        <div className="mt-5 space-y-2">

          {history
            .slice(0, 5)
            .map(
              (run) => {

                const pace =
                  run.durationMinutes &&
                  run.distanceMiles
                    ? run.durationMinutes /
                      run.distanceMiles
                    : null;

                return (
                  <div
                    key={
                      run.id
                    }
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                  >

                    <div>

                      <p className="font-medium">
                        {formatDate(
                          run.completedAt ??
                            run.startedAt
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {run.distanceMiles !==
                        undefined
                          ? `${run.distanceMiles.toFixed(
                              2
                            )} mi`
                          : "Distance —"}

                        {" · "}

                        {run.durationMinutes !==
                        undefined
                          ? `${run.durationMinutes} min`
                          : "Duration —"}
                      </p>

                    </div>


                    <div className="text-right">

                      <p className="font-semibold">

                        {pace !== null
                          ? `${formatPace(
                              pace
                            )} / mi`
                          : "—"}

                      </p>

                      {run.rpe !==
                        undefined && (
                        <p className="mt-1 text-xs text-slate-500">
                          RPE{" "}
                          {run.rpe}/10
                        </p>
                      )}

                    </div>

                  </div>
                );
              }
            )}

        </div>

      </div>

    </div>
  );
}
