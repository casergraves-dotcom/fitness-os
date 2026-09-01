"use client";

// ============================================================
// Imports
// ============================================================

import {
  useMemo,
  useState,
} from "react";

import {
  useMorningCheckIn,
} from "@/features/recovery/hooks/useMorningCheckIn";

import {
  calculateReadiness,
} from "@/features/recovery/utils/readiness";

import MeasurementTrendChart from "./MeasurementTrendChart";

import ProgressChartRangeSelect from "./ProgressChartRangeSelect";

import {
  getProgressChartRangeStartDate,
  isDateInProgressChartRange,
} from "../utils/progressChartRange";

import type {
  ProgressChartRange,
} from "../utils/progressChartRange";


// ============================================================
// Helpers
// ============================================================

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
    new Date(
      `${date}T12:00:00`
    )
  );
}


function formatScore(
  score: number
) {
  return score.toFixed(1);
}


// ============================================================
// Recovery Progress
// ============================================================

export default function RecoveryProgress() {

  const [
    chartRange,
    setChartRange,
  ] =
    useState<ProgressChartRange>(
      "3m"
    );

  const {
    history,
    loaded,
  } = useMorningCheckIn();


  // ----------------------------------------------------------
  // Completed Check-Ins
  // ----------------------------------------------------------

  const completedCheckIns =
    useMemo(
      () =>
        history
          .filter(
            (record) =>
              calculateReadiness(
                record.ratings
              ) !== null
          )
          .sort(
            (a, b) =>
              b.date.localeCompare(
                a.date
              )
          ),
      [history]
    );


  const chartRangeStartDate =
    getProgressChartRangeStartDate(
      completedCheckIns[0]
        ?.date,
      chartRange
    );


  const readinessTrendData =
    useMemo(
      () =>
        completedCheckIns
          .filter(
            (
              record
            ) =>
              isDateInProgressChartRange(
                record.date,
                chartRangeStartDate
              )
          )
          .map(
            (
              record
            ) => ({
              date:
                record.date,

              value:
                calculateReadiness(
                  record.ratings
                )!.score,
            })
          )
          .reverse(),
      [
        completedCheckIns,
        chartRangeStartDate,
      ]
    );


  // ----------------------------------------------------------
  // Summary
  // ----------------------------------------------------------

  const summary =
    useMemo(() => {

      if (
        completedCheckIns.length ===
        0
      ) {
        return null;
      }


      // ------------------------------------------------------
      // Latest
      // ------------------------------------------------------

      const latest =
        completedCheckIns[0];

      const latestReadiness =
        calculateReadiness(
          latest.ratings
        );

      if (!latestReadiness) {
        return null;
      }


      // ------------------------------------------------------
      // Readiness History
      // ------------------------------------------------------

      const readinessResults =
        completedCheckIns
          .map(
            (record) =>
              calculateReadiness(
                record.ratings
              )
          )
          .filter(
            (
              result
            ): result is NonNullable<
              ReturnType<
                typeof calculateReadiness
              >
            > =>
              result !== null
          );


      const averageReadiness =
        readinessResults.reduce(
          (
            total,
            result
          ) =>
            total +
            result.score,
          0
        ) /
        readinessResults.length;


      // ------------------------------------------------------
      // Sleep
      // ------------------------------------------------------

      const averageSleep =
        completedCheckIns.reduce(
          (
            total,
            record
          ) =>
            total +
            record.ratings.Sleep,
          0
        ) /
        completedCheckIns.length;


      // ------------------------------------------------------
      // Stress
      // ------------------------------------------------------

      const averageStress =
        completedCheckIns.reduce(
          (
            total,
            record
          ) =>
            total +
            record.ratings.Stress,
          0
        ) /
        completedCheckIns.length;


      return {
        latest,
        latestReadiness,
        averageReadiness,
        averageSleep,
        averageStress,
      };

    }, [
      completedCheckIns,
    ]);


  // ==========================================================
  // Loading
  // ==========================================================

  if (!loaded) {
    return (
      <div className="py-8 text-center text-slate-500">
        Loading recovery progress...
      </div>
    );
  }


  // ==========================================================
  // Empty State
  // ==========================================================

  if (!summary) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-center shadow-sm">

        <p className="font-semibold">
          No Recovery Data Yet
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Complete all six Morning Check-In ratings to begin tracking recovery.
        </p>

      </div>
    );
  }


  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div className="space-y-4">

      {/* ======================================================
          Summary
      ======================================================= */}

      <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">

        <div>

          <h2 className="text-lg font-bold sm:text-xl">
            Readiness
          </h2>

        </div>


        <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-4">

          {/* --------------------------------------------------
              Current Readiness
          --------------------------------------------------- */}

          <div className="rounded-xl bg-slate-50 p-3">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Today
            </p>

            <p className="mt-2 text-xl font-bold">

              {formatScore(
                summary
                  .latestReadiness
                  .score
              )}

              <span className="ml-1 text-sm font-medium text-slate-500">
                / 5
              </span>

            </p>

            <p className="mt-1 text-xs font-medium text-slate-500">
              {
                summary
                  .latestReadiness
                  .label
              }
            </p>

          </div>


          {/* --------------------------------------------------
              Average Readiness
          --------------------------------------------------- */}

          <div className="rounded-xl bg-slate-50 p-3">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Average
            </p>

            <p className="mt-2 text-xl font-bold">

              {formatScore(
                summary.averageReadiness
              )}

              <span className="ml-1 text-sm font-medium text-slate-500">
                / 5
              </span>

            </p>

            <p className="mt-1 text-xs text-slate-500">
              Readiness
            </p>

          </div>


          {/* --------------------------------------------------
              Average Sleep
          --------------------------------------------------- */}

          <div className="rounded-xl bg-slate-50 p-3">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Sleep
            </p>

            <p className="mt-2 text-xl font-bold">

              {formatScore(
                summary.averageSleep
              )}

              <span className="ml-1 text-sm font-medium text-slate-500">
                / 5
              </span>

            </p>

            <p className="mt-1 text-xs text-slate-500">
              Average
            </p>

          </div>


          {/* --------------------------------------------------
              Average Stress
          --------------------------------------------------- */}

          <div className="rounded-xl bg-slate-50 p-3">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Stress
            </p>

            <p className="mt-2 text-xl font-bold">

              {formatScore(
                summary.averageStress
              )}

              <span className="ml-1 text-sm font-medium text-slate-500">
                / 5
              </span>

            </p>

            <p className="mt-1 text-xs text-slate-500">
              Average
            </p>

          </div>

        </div>

      </div>


      {/* ======================================================
          Readiness Trend
      ======================================================= */}

      <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">

        <div className="flex flex-wrap items-end justify-between gap-4">

          <div>

            <p className="text-sm font-semibold text-slate-500">
              RECENT TREND
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Readiness Over Time
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review calculated readiness across completed check-ins. Complete recovery history remains preserved.
            </p>

          </div>


          <ProgressChartRangeSelect
            value={
              chartRange
            }
            onChange={
              setChartRange
            }
          />

        </div>


        <div className="mt-5">

          <MeasurementTrendChart
            data={
              readinessTrendData
            }
            unit="/ 5"
            label="Readiness"
            emptyMessage="Complete recovery check-ins on at least two dates in this range to chart readiness."
          />

        </div>

      </div>


      {/* ======================================================
          Recent Check-Ins
      ======================================================= */}

      <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">

        <p className="text-sm font-semibold text-slate-500">
          RECENT CHECK-INS
        </p>

        <h2 className="mt-1 text-xl font-bold">
          Recovery History
        </h2>


        <div className="mt-5 space-y-2">

          {completedCheckIns
            .slice(
              0,
              7
            )
            .map(
              (record) => {

                const readiness =
                  calculateReadiness(
                    record.ratings
                  );


                return (
                  <div
                    key={
                      record.date
                    }
                    className="rounded-xl bg-slate-50 px-4 py-3"
                  >

                    <div className="flex items-center justify-between gap-4">

                      <div>

                        <p className="font-medium">
                          {formatDate(
                            record.date
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">

                          Energy{" "}
                          {
                            record.ratings
                              .Energy
                          }

                          {" · "}

                          Sleep{" "}
                          {
                            record.ratings
                              .Sleep
                          }

                          {" · "}

                          Mood{" "}
                          {
                            record.ratings
                              .Mood
                          }

                        </p>

                      </div>


                      <div className="text-right">

                        <p className="font-semibold">

                          {readiness
                            ? `${formatScore(
                                readiness.score
                              )} / 5`
                            : "—"}

                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {readiness?.label ??
                            "Incomplete"}
                        </p>

                      </div>

                    </div>


                    <p className="mt-2 text-xs text-slate-500">

                      Stress{" "}
                      {
                        record.ratings
                          .Stress
                      }

                      {" · "}

                      Upper soreness{" "}
                      {
                        record.ratings
                          .UpperBodySoreness
                      }

                      {" · "}

                      Lower soreness{" "}
                      {
                        record.ratings
                          .LowerBodySoreness
                      }

                    </p>

                  </div>
                );
              }
            )}

        </div>

      </div>

    </div>
  );
}
