"use client";

// ============================================================
// Imports
// ============================================================

import {
  useState,
} from "react";

import {
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";

import AppShell from "@/components/layout/AppShell";

import {
  useWorkoutHistory,
} from "../hooks/useWorkoutHistory";

import {
  exerciseLibrary,
} from "../exerciseLibrary";

import {
  getWorkoutSessionLabel,
} from "../utils/getWorkoutSessionLabel";

import {
  useRunSession,
} from "../../running/hooks/useRunSession";


// ============================================================
// Helpers
// ============================================================

function formatActivityDate(
  date: string
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(
    new Date(date)
  );
}


// ------------------------------------------------------------
// Strength Workout Duration
// ------------------------------------------------------------

function formatWorkoutDuration(
  startedAt: string,
  completedAt?: string
) {
  if (!completedAt) {
    return "—";
  }

  const milliseconds =
    new Date(
      completedAt
    ).getTime() -
    new Date(
      startedAt
    ).getTime();

  const totalMinutes =
    Math.max(
      0,
      Math.floor(
        milliseconds / 60000
      )
    );

  const hours =
    Math.floor(
      totalMinutes / 60
    );

  const minutes =
    totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  return `${hours} hr ${minutes} min`;
}


// ------------------------------------------------------------
// Run Pace
// ------------------------------------------------------------

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


// ------------------------------------------------------------
// Strength Set Performance
// ------------------------------------------------------------

function formatStrengthSetPerformance(
  exerciseDefinitionId: string | undefined,
  weight: number,
  reps: number
) {
  const definition =
    exerciseDefinitionId
      ? exerciseLibrary.find(
          (item) =>
            item.id ===
            exerciseDefinitionId
        )
      : undefined;

  const resistanceType =
    definition?.resistanceType;

  const performanceType =
    definition?.performanceType;

  const repCounting =
    definition?.repCounting;

  const repsLabel =
    repCounting === "PerSide"
      ? `${reps} reps / side`
      : `${reps} reps`;

  if (
    performanceType ===
    "Duration"
  ) {
    if (
      resistanceType ===
      "Weight"
    ) {
      return `${weight} lb × ${reps} sec`;
    }

    return `${reps} sec`;
  }

  if (
    resistanceType ===
    "Band"
  ) {
    return `${weight} lb band × ${repsLabel}`;
  }

  if (
    resistanceType ===
    "Assistance"
  ) {
    return `${weight} lb assist × ${repsLabel}`;
  }

  if (
    resistanceType ===
    "Weight"
  ) {
    return `${weight} lb × ${repsLabel}`;
  }

  return repsLabel;
}


// ============================================================
// Activity History Screen
// ============================================================

export default function WorkoutHistoryScreen() {

  // ----------------------------------------------------------
  // Strength History
  // ----------------------------------------------------------

  const {
    history: workoutHistory,
    loaded: workoutsLoaded,
    deleteWorkout,
  } = useWorkoutHistory();


  // ----------------------------------------------------------
  // Run History
  // ----------------------------------------------------------

  const {
    history: runHistory,
    loaded: runsLoaded,
    deleteRun,
  } = useRunSession();


  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  const loaded =
    workoutsLoaded &&
    runsLoaded;


  // ----------------------------------------------------------
  // Unified Activity History
  // ----------------------------------------------------------

  const activities = [
    ...workoutHistory.map(
      (workout) => ({
        kind:
          "workout" as const,

        startedAt:
          workout.startedAt,

        data:
          workout,
      })
    ),

    ...runHistory.map(
      (run) => ({
        kind:
          "run" as const,

        startedAt:
          run.startedAt,

        data:
          run,
      })
    ),
  ].sort(
    (a, b) =>
      new Date(
        b.startedAt
      ).getTime() -
      new Date(
        a.startedAt
      ).getTime()
  );


  // ----------------------------------------------------------
  // Expanded Activity
  // ----------------------------------------------------------

  const [
    expandedActivityId,
    setExpandedActivityId,
  ] = useState<string | null>(
    null
  );


  // ==========================================================
  // Loading State
  // ==========================================================

  if (!loaded) {
    return (
      <AppShell>

        <div className="py-12 text-center text-slate-500">
          Loading history...
        </div>

      </AppShell>
    );
  }


  // ==========================================================
  // Empty State
  // ==========================================================

  if (
    activities.length === 0
  ) {
    return (
      <AppShell>

        <div className="rounded-2xl border bg-white p-6 text-center shadow-sm">

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            History
          </p>

          <h1 className="mt-2 text-2xl font-bold">
            No Activities Yet
          </h1>

          <p className="mt-2 text-slate-500">
            Completed workouts and runs will appear here.
          </p>

        </div>

      </AppShell>
    );
  }


  // ==========================================================
  // History
  // ==========================================================

  return (
    <AppShell>

      <div className="space-y-4">

        {/* ====================================================
            Page Header
        ===================================================== */}

        <div>

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            History
          </p>

          <h1 className="mt-1 text-2xl font-bold">
            Activity History
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {activities.length} completed{" "}
            {activities.length === 1
              ? "activity"
              : "activities"}
          </p>

        </div>


        {/* ====================================================
            Activities
        ===================================================== */}

        <div className="space-y-3">

          {activities.map(
            (activity) => {

              // ==================================================
              // Strength Workout
              // ==================================================

              if (
                activity.kind ===
                "workout"
              ) {
                const workout =
                  activity.data;

                const completedSets =
                  workout.exercises.reduce(
                    (
                      total,
                      exercise
                    ) =>
                      total +
                      exercise.sets.length,
                    0
                  );

                const expanded =
                  expandedActivityId ===
                  workout.id;

                return (
                  <div
                    key={
                      `workout-${workout.id}`
                    }
                    className="overflow-hidden rounded-2xl border bg-white shadow-sm"
                  >

                    {/* ------------------------------------------
                        Workout Summary
                    ------------------------------------------- */}

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedActivityId(
                          expanded
                            ? null
                            : workout.id
                        )
                      }
                      className="w-full p-5 text-left"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                            Strength
                          </p>

                          <p className="mt-1 text-lg font-semibold">
                            {
                              getWorkoutSessionLabel(
                                workout
                              )
                            }
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {formatActivityDate(
                              workout.startedAt
                            )}
                          </p>

                        </div>


                        <div className="flex items-start gap-3">

                          <div className="text-right">

                            <p className="font-medium">
                              {completedSets}{" "}
                              {completedSets ===
                              1
                                ? "set"
                                : "sets"}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {formatWorkoutDuration(
                                workout.startedAt,
                                workout.completedAt
                              )}
                            </p>

                          </div>


                          <div className="mt-1 text-slate-400">

                            {expanded ? (
                              <ChevronUp
                                size={20}
                              />
                            ) : (
                              <ChevronDown
                                size={20}
                              />
                            )}

                          </div>

                        </div>

                      </div>


                      <div className="mt-4 border-t pt-4">

                        <p className="text-sm text-slate-600">
                          {
                            workout.exercises
                              .length
                          }{" "}
                          {workout.exercises
                            .length === 1
                            ? "exercise"
                            : "exercises"}
                        </p>

                      </div>

                    </button>


                    {/* ------------------------------------------
                        Workout Details
                    ------------------------------------------- */}

                    {expanded && (
                      <div className="border-t bg-slate-50 px-5 py-5">

                        <div className="space-y-6">

                          {workout.exercises.map(
                            (
                              exercise
                            ) => (
                              <div
                                key={
                                  exercise.id
                                }
                              >

                                <h3 className="font-semibold">
                                  {
                                    exercise.name
                                  }
                                </h3>


                                <div className="mt-3 space-y-2">

                                  {exercise.sets.map(
                                    (
                                      set,
                                      index
                                    ) => (
                                      <div
                                        key={
                                          set.id
                                        }
                                        className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
                                      >

                                        <span className="text-slate-500">
                                          Set{" "}
                                          {index +
                                            1}
                                        </span>

                                        <span className="font-medium">
                                          {formatStrengthSetPerformance(
                                            exercise.exerciseDefinitionId,
                                            set.weight,
                                            set.reps
                                          )}

                                          {set.rpe !== undefined && (
                                            <span className="ml-2 text-slate-500">
                                              · RPE {set.rpe}
                                            </span>
                                          )}
                                        </span>

                                      </div>
                                    )
                                  )}

                                </div>

                              </div>
                            )
                          )}

                        </div>


                        {/* --------------------------------------
                            Delete Workout
                        --------------------------------------- */}

                        <div className="mt-6 border-t pt-4">

                          <button
                            type="button"
                            onClick={() => {
                              const confirmed =
                                window.confirm(
                                  `Delete this ${getWorkoutSessionLabel(
                                    workout
                                  )} workout? This cannot be undone.`
                                );

                              if (
                                confirmed
                              ) {
                                deleteWorkout(
                                  workout.id
                                );

                                setExpandedActivityId(
                                  null
                                );
                              }
                            }}
                            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                          >

                            <Trash2
                              size={16}
                            />

                            Delete Workout

                          </button>

                        </div>

                      </div>
                    )}

                  </div>
                );
              }


              // ==================================================
              // Run
              // ==================================================

              const run =
                activity.data;

              const expanded =
                expandedActivityId ===
                run.id;

              const pace =
                run.durationMinutes &&
                run.distanceMiles
                  ? run.durationMinutes /
                    run.distanceMiles
                  : null;


              return (
                <div
                  key={
                    `run-${run.id}`
                  }
                  className="overflow-hidden rounded-2xl border bg-white shadow-sm"
                >

                  {/* --------------------------------------------
                      Run Summary
                  --------------------------------------------- */}

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedActivityId(
                        expanded
                          ? null
                          : run.id
                      )
                    }
                    className="w-full p-5 text-left"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                          Run
                        </p>

                        <p className="mt-1 text-lg font-semibold">
                          {run.prescribedLabel ??
                            run.intensity ??
                            "Run"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {formatActivityDate(
                            run.startedAt
                          )}
                        </p>

                      </div>


                      <div className="flex items-start gap-3">

                        <div className="text-right">

                          <p className="font-medium">
                            {run.distanceMiles !==
                            undefined
                              ? `${run.distanceMiles.toFixed(
                                  2
                                )} mi`
                              : "—"}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {run.durationMinutes !==
                            undefined
                              ? `${run.durationMinutes} min`
                              : "—"}
                          </p>

                        </div>


                        <div className="mt-1 text-slate-400">

                          {expanded ? (
                            <ChevronUp
                              size={20}
                            />
                          ) : (
                            <ChevronDown
                              size={20}
                            />
                          )}

                        </div>

                      </div>

                    </div>


                    <div className="mt-4 border-t pt-4">

                      <p className="text-sm text-slate-600">
                        {pace !== null
                          ? `${formatPace(
                              pace
                            )} / mi`
                          : "Pace —"}
                      </p>

                    </div>

                  </button>


                  {/* --------------------------------------------
                      Run Details
                  --------------------------------------------- */}

                  {expanded && (
                    <div className="border-t bg-slate-50 px-5 py-5">

                      {/* ----------------------------------------
                          Performance
                      ----------------------------------------- */}

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                        <div className="rounded-xl bg-white p-3">

                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Duration
                          </p>

                          <p className="mt-1 font-semibold text-slate-900">
                            {run.durationMinutes !==
                            undefined
                              ? `${run.durationMinutes} min`
                              : "—"}
                          </p>

                        </div>


                        <div className="rounded-xl bg-white p-3">

                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Distance
                          </p>

                          <p className="mt-1 font-semibold text-slate-900">
                            {run.distanceMiles !==
                            undefined
                              ? `${run.distanceMiles.toFixed(
                                  2
                                )} mi`
                              : "—"}
                          </p>

                        </div>


                        <div className="rounded-xl bg-white p-3">

                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Pace
                          </p>

                          <p className="mt-1 font-semibold text-slate-900">
                            {pace !== null
                              ? `${formatPace(
                                  pace
                                )} / mi`
                              : "—"}
                          </p>

                        </div>


                        <div className="rounded-xl bg-white p-3">

                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            RPE
                          </p>

                          <p className="mt-1 font-semibold text-slate-900">
                            {run.rpe !==
                            undefined
                              ? `${run.rpe} / 10`
                              : "—"}
                          </p>

                        </div>

                      </div>


                      {/* ----------------------------------------
                          Prescription
                      ----------------------------------------- */}

                      {run.prescribedLabel && (
                        <div className="mt-5">

                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Prescription
                          </p>

                          <p className="mt-1 font-semibold text-slate-900">
                            {
                              run.prescribedLabel
                            }
                          </p>


                          {run.prescribedDurationMin !==
                            undefined && (
                            <p className="mt-1 text-sm text-slate-600">

                              Duration:{" "}

                              {run.prescribedDurationMax !==
                                undefined &&
                              run.prescribedDurationMax !==
                                run.prescribedDurationMin
                                ? `${run.prescribedDurationMin}–${run.prescribedDurationMax} min`
                                : `${run.prescribedDurationMin} min`}

                            </p>
                          )}


                          {run.prescribedRunIntervalMinutes !==
                            undefined &&
                            run.prescribedWalkIntervalMinutes !==
                              undefined && (
                              <p className="mt-1 text-sm text-slate-600">

                                Run{" "}
                                {
                                  run.prescribedRunIntervalMinutes
                                }{" "}
                                min / Walk{" "}
                                {
                                  run.prescribedWalkIntervalMinutes
                                }{" "}
                                min

                              </p>
                            )}


                          {run.prescribedNote && (
                            <p className="mt-2 text-sm text-slate-600">
                              {
                                run.prescribedNote
                              }
                            </p>
                          )}

                        </div>
                      )}


                      {/* ----------------------------------------
                          Notes
                      ----------------------------------------- */}

                      {run.notes && (
                        <div className="mt-5">

                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Notes
                          </p>

                          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                            {run.notes}
                          </p>

                        </div>
                      )}


                      {/* ----------------------------------------
                          Delete Run
                      ----------------------------------------- */}

                      <div className="mt-6 border-t pt-4">

                        <button
                          type="button"
                          onClick={() => {
                            const confirmed =
                              window.confirm(
                                "Delete this run? This cannot be undone."
                              );

                            if (
                              confirmed
                            ) {
                              deleteRun(
                                run.id
                              );

                              setExpandedActivityId(
                                null
                              );
                            }
                          }}
                          className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >

                          <Trash2
                            size={16}
                          />

                          Delete Run

                        </button>

                      </div>

                    </div>
                  )}

                </div>
              );
            }
          )}

        </div>

      </div>

    </AppShell>
  );
}
