"use client";

// ============================================================
// Imports
// ============================================================

import {
  useMemo,
} from "react";

import {
  useDailySteps,
  useStepTargets,
} from "@/features/dailyActivity";

import MeasurementTrendChart from "./MeasurementTrendChart";


// ============================================================
// Constants
// ============================================================

const RECENT_DAY_WINDOW =
  14;


// ============================================================
// Helpers
// ============================================================

function formatLocalDate(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


function getRecentDateRange(
  currentDate: Date,
  dayCount: number
) {
  const dates:
    string[] = [];

  for (
    let offset = dayCount - 1;
    offset >= 0;
    offset -= 1
  ) {
    const date =
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() -
          offset
      );

    dates.push(
      formatLocalDate(
        date
      )
    );
  }

  return dates;
}


// ============================================================
// Daily Activity Progress
// ============================================================

export default function DailyActivityProgress() {
  const {
    loaded:
      stepsLoaded,

    records,
  } =
    useDailySteps();

  const {
    loaded:
      targetsLoaded,

    currentTarget,
  } =
    useStepTargets();

  const loaded =
    stepsLoaded &&
    targetsLoaded;


  // ----------------------------------------------------------
  // Recent Window
  // ----------------------------------------------------------

  const recentSummary =
    useMemo(
      () => {
        const dates =
          getRecentDateRange(
            new Date(),
            RECENT_DAY_WINDOW
          );

        const recentRecords =
          dates
            .map(
              (
                date
              ) =>
                records.find(
                  (
                    record
                  ) =>
                    record.date ===
                    date
                ) ??
                null
            )
            .filter(
              (
                record
              ) =>
                record !==
                null
            );

        const loggedDays =
          recentRecords.length;

        const averageSteps =
          loggedDays >
          0
            ? Math.round(
                recentRecords.reduce(
                  (
                    total,
                    record
                  ) =>
                    total +
                    record.steps,
                  0
                ) /
                loggedDays
              )
            : null;

        const coveragePercent =
          Math.round(
            (
              loggedDays /
              RECENT_DAY_WINDOW
            ) *
              100
          );

        const target =
          currentTarget
            ?.dailyStepTarget;

        const daysMeetingTarget =
          target !==
            undefined
            ? recentRecords.filter(
                (
                  record
                ) =>
                  record.steps >=
                  target
              ).length
            : null;

        return {
          loggedDays,

          averageSteps,

          coveragePercent,

          daysMeetingTarget,
        };
      },
      [
        records,
        currentTarget,
      ]
    );


  // ----------------------------------------------------------
  // Trend Data
  // ----------------------------------------------------------

  const trendData =
    useMemo(
      () =>
        records
          .slice(
            0,
            RECENT_DAY_WINDOW
          )
          .reverse()
          .map(
            (
              record
            ) => ({
              date:
                record.date,

              value:
                record.steps,
            })
          ),
      [
        records,
      ]
    );


  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  if (
    !loaded
  ) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-sm text-slate-500">
          Loading daily-activity progress...
        </p>
      </div>
    );
  }


  // ----------------------------------------------------------
  // Empty State
  // ----------------------------------------------------------

  if (
    records.length ===
    0
  ) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">

        <p className="font-semibold text-slate-900">
          No Step History Yet
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Log daily steps from Today to begin tracking general-activity trends.
        </p>

      </div>
    );
  }


  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <div className="space-y-4">

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div>
          <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
            Step Progress
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Review recent daily movement without treating individual low-step days as meaningful by themselves.
          </p>
        </div>


        <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3 lg:grid-cols-4">

          <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Current Target
            </p>

            <p className="mt-1 text-lg font-bold text-slate-900">
              {currentTarget
                ? `${currentTarget.dailyStepTarget.toLocaleString()} steps`
                : "Not set"}
            </p>
          </div>


          <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              14-Day Average
            </p>

            <p className="mt-1 text-lg font-bold text-slate-900">
              {recentSummary.averageSteps !==
              null
                ? `${recentSummary.averageSteps.toLocaleString()} steps`
                : "No data"}
            </p>
          </div>


          <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Logged Days
            </p>

            <p className="mt-1 text-lg font-bold text-slate-900">
              {recentSummary.loggedDays}/
              {RECENT_DAY_WINDOW}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {recentSummary.coveragePercent}% coverage
            </p>
          </div>


          <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Days Meeting Target
            </p>

            <p className="mt-1 text-lg font-bold text-slate-900">
              {recentSummary.daysMeetingTarget !==
              null
                ? `${recentSummary.daysMeetingTarget}/${recentSummary.loggedDays}`
                : "Target not set"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Logged days only
            </p>
          </div>

        </div>

      </div>


      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Recent Trend
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-900">
            Daily Steps
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Recent logged step totals over time.
          </p>
        </div>


        <div className="mt-5">
          <MeasurementTrendChart
            data={
              trendData
            }
            unit="steps"
            label="Steps"
            emptyMessage="Log steps on at least two days to begin showing a step trend."
          />
        </div>

      </div>

    </div>
  );
}
