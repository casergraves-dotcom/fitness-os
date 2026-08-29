"use client";

// ============================================================
// Imports
// ============================================================

import {
  useEffect,
  useRef,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import AppShell from "@/components/layout/AppShell";

import RpeLegend from "../../workout/components/RpeLegend";

import {
  RPE_SCALE,
} from "../../workout/rpe";

import {
  useRunSession,
} from "../hooks/useRunSession";

import type {
  CardioIntensity,
  RunSession,
  TrainingActivity,
  TrainingPlanState,
} from "../../workout/types";

import {
  fitnessOsTrainingPlan,
} from "../../workout/trainingPlan";

import {
  getTrainingScheduleForDate,
} from "../../workout/utils/getTrainingScheduleForDate";

// ============================================================
// Storage
// ============================================================

const TRAINING_PLAN_STATE_STORAGE_KEY =
  "fitness-os-training-plan-state";


// ============================================================
// Helpers
// ============================================================

function isCardioIntensity(
  value: string | null
): value is CardioIntensity {
  return (
    value === "Easy" ||
    value === "Zone 2" ||
    value === "Intervals" ||
    value === "Adaptive"
  );
}


// ------------------------------------------------------------
// Pace
// ------------------------------------------------------------

function getPaceLabel(
  durationMinutes:
    | number
    | undefined,
  distanceMiles:
    | number
    | undefined
) {
  if (
    durationMinutes === undefined ||
    distanceMiles === undefined ||
    durationMinutes <= 0 ||
    distanceMiles <= 0
  ) {
    return "—";
  }

  const paceMinutes =
    durationMinutes /
    distanceMiles;

  let wholeMinutes =
    Math.floor(
      paceMinutes
    );

  let seconds =
    Math.round(
      (
        paceMinutes -
        wholeMinutes
      ) * 60
    );

  if (seconds === 60) {
    wholeMinutes += 1;
    seconds = 0;
  }

  return `${wholeMinutes}:${String(
    seconds
  ).padStart(2, "0")} /mi`;
}


// ------------------------------------------------------------
// Numeric Input
// ------------------------------------------------------------

function parseNumericInput(
  value: string
) {
  if (
    value.trim() === ""
  ) {
    return 0;
  }

  const parsed =
    Number(value);

  if (
    !Number.isFinite(
      parsed
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    parsed
  );
}


// ------------------------------------------------------------
// Run Date
// ------------------------------------------------------------

function getRunDateLabel(
  run: RunSession
) {
  const date =
    new Date(
      run.completedAt ??
      run.startedAt
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown date";
  }

  return date.toLocaleDateString(
    undefined,
    {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}


// ------------------------------------------------------------
// Run Time
// ------------------------------------------------------------

function getRunTimeLabel(
  run: RunSession
) {
  const date =
    new Date(
      run.startedAt
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleTimeString(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
}



// ============================================================
// Run Screen
// ============================================================

export default function RunScreen() {

  // ----------------------------------------------------------
  // Run Session
  // ----------------------------------------------------------

  const {
    session,

    loaded,
    finished,

    startRun,

    updateDuration,
    updateDistance,
    updateRpe,
    updateNotes,

    finishRun,
    cancelRun,
    dismissFinishedRun,

  } = useRunSession();


  // ----------------------------------------------------------
  // Scheduled Run Launch
  // ----------------------------------------------------------

  const searchParams =
    useSearchParams();

  const scheduledStartHandled =
    useRef(false);

  useEffect(() => {
    if (
      !loaded ||
      session ||
      finished ||
      scheduledStartHandled.current
    ) {
      return;
    }

    const start =
      searchParams.get(
        "start"
      );

    if (start !== "run") {
      return;
    }

    const requestedIntensity =
      searchParams.get(
        "intensity"
      );

    const scheduledActivityId =
      searchParams.get(
        "activityId"
      );

    const scheduledDate =
      searchParams.get(
        "date"
      );

    scheduledStartHandled.current =
      true;

        let scheduledActivity:
      TrainingActivity | undefined;

    if (
      scheduledActivityId &&
      scheduledDate
    ) {
      const savedPlanState =
        localStorage.getItem(
          TRAINING_PLAN_STATE_STORAGE_KEY
        );

      if (savedPlanState) {
        try {
          const planState:
            TrainingPlanState =
              JSON.parse(
                savedPlanState
              );

          const [
            year,
            month,
            day,
          ] =
            scheduledDate
              .split("-")
              .map(Number);

          const localDate =
            new Date(
              year,
              month - 1,
              day
            );

          const schedule =
            getTrainingScheduleForDate(
              fitnessOsTrainingPlan,
              planState,
              localDate
            );

          scheduledActivity =
            schedule?.trainingDay.activities.find(
              (activity) =>
                activity.id ===
                  scheduledActivityId &&
                activity.type ===
                  "Run"
            );
        } catch {
          // Invalid plan state should not prevent
          // the run from starting.
        }
      }
    }

    startRun({
      intensity:
        scheduledActivity
          ?.cardioIntensity ??
        (
          isCardioIntensity(
            requestedIntensity
          )
            ? requestedIntensity
            : undefined
        ),

      scheduledActivityId:
        scheduledActivityId ??
        undefined,

      scheduledDate:
        scheduledDate ??
        undefined,

      prescribedLabel:
        scheduledActivity?.label,

      prescribedDurationMin:
        scheduledActivity
          ?.durationMin,

      prescribedDurationMax:
        scheduledActivity
          ?.durationMax,

      prescribedRunIntervalMinutes:
        scheduledActivity
          ?.runIntervalMinutes,

      prescribedWalkIntervalMinutes:
        scheduledActivity
          ?.walkIntervalMinutes,

      prescribedRunProgressionRole:
        scheduledActivity
          ?.runProgressionRole,

      prescribedNote:
        scheduledActivity?.note,
    });
  }, [
    loaded,
    session,
    finished,
    searchParams,
    startRun,
  ]);


  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  if (!loaded) {
    return (
      <AppShell>

        <div className="mx-auto max-w-3xl p-6">

          <p className="text-slate-500">
            Loading run...
          </p>

        </div>

      </AppShell>
    );
  }


  // ----------------------------------------------------------
  // Finished Run
  // ----------------------------------------------------------

  if (
    finished &&
    session
  ) {
    const pace =
      getPaceLabel(
        session.durationMinutes,
        session.distanceMiles
      );

    return (
      <AppShell>

        <div className="mx-auto max-w-3xl p-6">

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Run Complete
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Nice Work
            </h1>


            <div className="mt-6 grid gap-3 sm:grid-cols-3">

              <div className="rounded-xl bg-slate-50 p-4">

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Duration
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {
                    session.durationMinutes ??
                    0
                  } min
                </p>

              </div>


              <div className="rounded-xl bg-slate-50 p-4">

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Distance
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {
                    session.distanceMiles !==
                    undefined
                      ? `${session.distanceMiles} mi`
                      : "—"
                  }
                </p>

              </div>


              <div className="rounded-xl bg-slate-50 p-4">

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pace
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {pace}
                </p>

              </div>

            </div>


            {session.intensity && (
              <div className="mt-5">

                <p className="text-sm text-slate-500">
                  Training Type
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {session.intensity}
                </p>

              </div>
            )}

                        {session.rpe && (
              <div className="mt-5">

                <p className="text-sm text-slate-500">
                  Effort
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {session.rpe} / 10
                </p>

              </div>
            )}


            {session.notes && (
              <div className="mt-5">

                <p className="text-sm text-slate-500">
                  Notes
                </p>

                <p className="mt-1 whitespace-pre-wrap text-slate-700">
                  {session.notes}
                </p>

              </div>
            )}


            <button
              type="button"
              onClick={
                dismissFinishedRun
              }
              className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Done
            </button>

          </section>

        </div>

      </AppShell>
    );
  }


  // ----------------------------------------------------------
  // Start Screen + History
  // ----------------------------------------------------------

  if (!session) {
    return (
      <AppShell>

        <div className="mx-auto max-w-3xl space-y-6 p-6">

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Running
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Start a Run
            </h1>

            <p className="mt-3 text-slate-600">
              Record your duration and distance to build your cardio history.
            </p>


            <button
              type="button"
              onClick={
                () =>
                  startRun()
              }
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Start Run
            </button>

          </section>


        </div>

      </AppShell>
    );
  }


  // ----------------------------------------------------------
  // Active Run
  // ----------------------------------------------------------

  const pace =
    getPaceLabel(
      session.durationMinutes,
      session.distanceMiles
    );

  return (
    <AppShell>

      <div className="mx-auto max-w-3xl p-6">

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          {/* ==================================================
              Header
          ================================================== */}

          <div className="flex items-start justify-between gap-4">

            <div>

              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                Active Run
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                {
                  session.intensity
                    ? `${session.intensity} Run`
                    : "Run"
                }
              </h1>

            </div>


            {session.intensity && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {session.intensity}
              </span>
            )}

          </div>

                    {/* ==================================================
              Prescription
          ================================================== */}

          {session.prescribedLabel && (
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                Today's Prescription
              </p>

              <p className="mt-1 text-lg font-bold text-slate-900">
                {session.prescribedLabel}
              </p>


              {session.prescribedDurationMin !==
                undefined && (
                <p className="mt-2 text-sm text-slate-700">

                  Duration:{" "}

                  {session.prescribedDurationMax !==
                    undefined &&
                  session.prescribedDurationMax !==
                    session.prescribedDurationMin
                    ? `${session.prescribedDurationMin}–${session.prescribedDurationMax} min`
                    : `${session.prescribedDurationMin} min`}

                </p>
              )}


              {session.prescribedRunIntervalMinutes !==
                undefined &&
                session.prescribedWalkIntervalMinutes !==
                  undefined && (
                  <p className="mt-1 text-sm text-slate-700">

                    Run{" "}
                    {
                      session.prescribedRunIntervalMinutes
                    }{" "}
                    min / Walk{" "}
                    {
                      session.prescribedWalkIntervalMinutes
                    }{" "}
                    min

                  </p>
                )}


              {session.prescribedNote && (
                <p className="mt-2 text-sm text-slate-600">
                  {session.prescribedNote}
                </p>
              )}

            </div>
          )}


          {/* ==================================================
              Results
          ================================================== */}

          <div className="mt-8 grid gap-5 sm:grid-cols-2">

            <label className="block">

              <span className="text-sm font-semibold text-slate-700">
                Duration
              </span>

              <div className="mt-2 flex items-center gap-2">

                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="decimal"
                  value={
                    session.durationMinutes ??
                    ""
                  }
                  onChange={
                    (event) =>
                      updateDuration(
                        parseNumericInput(
                          event.target.value
                        )
                      )
                  }
                  placeholder="30"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <span className="shrink-0 text-sm text-slate-500">
                  min
                </span>

              </div>

            </label>


            <label className="block">

              <span className="text-sm font-semibold text-slate-700">
                Distance
              </span>

              <div className="mt-2 flex items-center gap-2">

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={
                    session.distanceMiles ??
                    ""
                  }
                  onChange={
                    (event) =>
                      updateDistance(
                        parseNumericInput(
                          event.target.value
                        )
                      )
                  }
                  placeholder="2.50"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <span className="shrink-0 text-sm text-slate-500">
                  mi
                </span>

              </div>

            </label>

          </div>


          {/* ==================================================
              Pace
          ================================================== */}

          <div className="mt-5 rounded-xl bg-slate-50 p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Average Pace
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {pace}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Calculated automatically from duration and distance.
            </p>

          </div>

                    {/* ==================================================
              Perceived Effort
          ================================================== */}

          <div className="mt-5">

            <div className="flex items-center justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <p className="text-sm font-semibold text-slate-700">
                    Effort
                  </p>

                  <RpeLegend
                    context="CardioSession"
                  />

                </div>

                <p className="mt-1 text-xs text-slate-500">
                  How hard did this run feel?
                </p>

              </div>

              <span className="text-lg font-bold text-slate-900">
                {session.rpe ?? "—"}
                <span className="text-sm font-normal text-slate-500">
                  {" / 10"}
                </span>
              </span>

            </div>


            <div className="mt-3 grid grid-cols-10 gap-1">

              {RPE_SCALE.map(
                (
                  entry
                ) => (
                  <button
                    key={
                      entry.value
                    }
                    type="button"
                    onClick={
                      () =>
                        updateRpe(
                          entry.value
                        )
                    }
                    className={
                      session.rpe ===
                        entry.value
                        ? "rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white"
                        : "rounded-lg border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    }
                  >
                    {entry.value}
                  </button>
                )
              )}

            </div>


            <div className="mt-2 flex justify-between text-xs text-slate-500">

              <span>
                Easy
              </span>

              <span>
                Max effort
              </span>

            </div>

          </div>


          {/* ==================================================
              Notes
          ================================================== */}

          <label className="mt-5 block">

            <span className="text-sm font-semibold text-slate-700">
              Notes
            </span>

            <textarea
              value={
                session.notes ??
                ""
              }
              onChange={
                (event) =>
                  updateNotes(
                    event.target.value
                  )
              }
              rows={4}
              placeholder="How did the run feel?"
              className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </label>


          {/* ==================================================
              Actions
          ================================================== */}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">

            <button
              type="button"
              onClick={
                finishRun
              }
              disabled={
                !session.durationMinutes ||
                session.durationMinutes <= 0
              }
              className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Finish Run
            </button>


            <button
              type="button"
              onClick={
                cancelRun
              }
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel Run
            </button>

          </div>


          {!session.durationMinutes && (
            <p className="mt-3 text-xs text-slate-500">
              Enter the run duration before finishing.
            </p>
          )}

        </section>

      </div>

    </AppShell>
  );
}
