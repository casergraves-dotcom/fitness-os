"use client";

// ============================================================
// Imports
// ============================================================

import AppShell from "@/components/layout/AppShell";

import {
  AddExercise,
  ExerciseCard,
  WorkoutHeader,
} from "@/features/workout";

import {
  Check,
  ChevronRight,
  Dumbbell,
  TrendingUp,
} from "lucide-react";

import { useWorkoutSession } from "../hooks/useWorkoutSession";

import {
  useExerciseLibrary,
} from "../hooks/useExerciseLibrary";

import {
  getExerciseTarget,
} from "../getExerciseTarget";

import {
  useEffect,
  useRef,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

// ============================================================
// Helpers
// ============================================================

function formatDuration(
  startedAt: string,
  completedAt?: string
) {
  const start =
    new Date(startedAt).getTime();

  const end =
    completedAt
      ? new Date(completedAt).getTime()
      : Date.now();

  const totalMinutes =
    Math.max(
      0,
      Math.round(
        (end - start) / 60000
      )
    );

  // Workouts shorter than one minute should not
  // display as "0 min".
  if (totalMinutes < 1) {
    return "<1 min";
  }

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours =
    Math.floor(
      totalMinutes / 60
    );

  const minutes =
    totalMinutes % 60;

  if (minutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
}

function formatNumber(
  value: number
) {
  return new Intl.NumberFormat(
    "en-US"
  ).format(
    Math.round(value)
  );
}

// ============================================================
// Workout Screen
// ============================================================

export default function WorkoutScreen() {
  // ----------------------------------------------------------
  // Workout Session
  // ----------------------------------------------------------

  const {
    session,
    loaded,
    finished,

    startWorkout,
    finishWorkout,
    cancelWorkout,
    dismissFinishedWorkout,

    toggleSet,
    updateSet,
    addSet,
    removeSet,

    addExercise,
    replaceExercise,
    removeExercise,
    undoRemoveExercise,
    removedExercise,

    getPreviousExercise,
  } = useWorkoutSession();

  // ----------------------------------------------------------
  // Exercise Library
  // ----------------------------------------------------------

  const {
    exercises: exerciseLibrary,
  } = useExerciseLibrary();

  // ----------------------------------------------------------
// Scheduled Workout Launch
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

  const requestedWorkout =
    searchParams.get("start");

  const scheduledActivityId =
  searchParams.get(
    "activityId"
  );

const scheduledDate =
  searchParams.get(
    "date"
  );

  if (
    requestedWorkout !== "Gym A" &&
    requestedWorkout !== "Gym B" &&
    requestedWorkout !== "Gym C"
  ) {
    return;
  }

  scheduledStartHandled.current =
    true;

if (
  scheduledActivityId &&
  scheduledDate
) {
  startWorkout(
    requestedWorkout,
    {
      activityId:
        scheduledActivityId,

      date:
        scheduledDate,
    }
  );

  return;
}

startWorkout(
  requestedWorkout
);
}, [
  loaded,
  session,
  finished,
  searchParams,
  startWorkout,
]);

  // ----------------------------------------------------------
  // Loading State
  // ----------------------------------------------------------

  if (!loaded) {
    return (
      <AppShell>
        <div className="py-12 text-center text-slate-500">
          Loading workout...
        </div>
      </AppShell>
    );
  }

  // ----------------------------------------------------------
  // Completed Workout State
  // ----------------------------------------------------------

  if (finished && session) {
    // Only completed sets count toward the summary.
    const completedExercises =
      session.exercises
        .map(
          (exercise) => ({
            ...exercise,

            sets:
              exercise.sets.filter(
                (set) =>
                  set.completed
              ),
          })
        )
        .filter(
          (exercise) =>
            exercise.sets.length > 0
        );

    const completedSetCount =
      completedExercises.reduce(
        (sum, exercise) =>
          sum +
          exercise.sets.length,
        0
      );

    // --------------------------------------------------------
    // Training Volume
    // --------------------------------------------------------

    // Count external-load volume only.
    //
    // Assistance exercises are excluded because their
    // "weight" represents assistance rather than resistance.
    //
    // Rep/bodyweight and duration exercises are also excluded
    // when their progression definition does not represent
    // conventional external load.
    const totalVolume =
      completedExercises.reduce(
        (
          workoutTotal,
          exercise
        ) => {
          const definition =
            exerciseLibrary.find(
              (item) =>
                item.id ===
                  exercise.exerciseDefinitionId ||
                (
                  !exercise.exerciseDefinitionId &&
                  item.name.toLowerCase() ===
                    exercise.name.toLowerCase()
                )
            );

          if (
            definition?.progressionType ===
              "Assistance" ||
            definition?.progressionType ===
              "Reps" ||
            definition?.performanceType ===
              "Duration" ||
            definition?.progressionType ===
              "Duration"
          ) {
            return workoutTotal;
          }

          const exerciseVolume =
            exercise.sets.reduce(
              (setTotal, set) =>
                setTotal +
                set.weight *
                  set.reps,
              0
            );

          return (
            workoutTotal +
            exerciseVolume
          );
        },
        0
      );

    // --------------------------------------------------------
    // Progression Results
    // --------------------------------------------------------

    const progressionResults =
      completedExercises
        .map((exercise) => {
          const definition =
            exerciseLibrary.find(
              (item) =>
                item.id ===
                  exercise.exerciseDefinitionId ||
                (
                  !exercise.exerciseDefinitionId &&
                  item.name.toLowerCase() ===
                    exercise.name.toLowerCase()
                )
            );

          const target =
            getExerciseTarget(
              definition,
              exercise
            );

          return {
            exercise,
            definition,
            target,
          };
        })
        .filter(
          ({ target }) =>
            target.action !==
            "no-progression"
        );

    return (
      <AppShell>
        <div className="mx-auto w-full max-w-4xl space-y-5">
          {/* ==================================================
              Completion Header
          =================================================== */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Check size={24} />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-green-600">
                  Workout Complete
                </p>

                <h1 className="mt-1 text-2xl font-bold">
                  {session.workoutType} Workout
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Nice work. Your completed sets have been saved to history.
                </p>
              </div>
            </div>

            {/* ================================================
                Workout Stats
            ================================================= */}

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Sets
                </p>

                <p className="mt-1 text-xl font-bold">
                  {completedSetCount}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Exercises
                </p>

                <p className="mt-1 text-xl font-bold">
                  {completedExercises.length}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Volume
                </p>

                <p className="mt-1 text-xl font-bold">
                  {formatNumber(
                    totalVolume
                  )}
                </p>

                <p className="text-xs text-slate-400">
                  lb
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Duration
                </p>

                <p className="mt-1 text-xl font-bold">
                  {formatDuration(
                    session.startedAt,
                    session.completedAt
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              Progression
          =================================================== */}

          {progressionResults.length >
            0 && (
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <TrendingUp
                    size={19}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                    Progression
                  </p>

                  <h2 className="mt-0.5 text-xl font-bold">
                    Next Workout Targets
                  </h2>
                </div>
              </div>

              <div className="mt-5 divide-y">
                {progressionResults.map(
                  ({
                    exercise,
                    definition,
                    target,
                  }) => {
                    const reps =
                      exercise.sets
                        .map(
                          (set) =>
                            set.reps
                        )
                        .join(" / ");

                    const weight =
                      exercise.sets[0]
                        ?.weight ?? 0;

const progressionType =
  definition?.progressionType;

const performanceType =
  definition?.performanceType;

const resistanceType =
  definition?.resistanceType;

// ----------------------------------------
// Performance Display
// ----------------------------------------

let performanceText: string;

// Weight + Duration
if (
  resistanceType === "Weight" &&
  performanceType === "Duration"
) {
  performanceText =
    `${weight} lb × ${reps} sec`;
}

// Bodyweight / Unweighted Duration
else if (
  performanceType === "Duration" ||
  progressionType === "Duration"
) {
  performanceText =
    `${reps} sec`;
}

// Assistance + Reps
else if (
  progressionType === "Assistance"
) {
  performanceText =
    `${weight} lb assist × ${reps}`;
}

// Bodyweight / Unweighted Reps
else if (
  progressionType === "Reps"
) {
  performanceText =
    `${reps} reps`;
}

// Traditional Weight + Reps
else {
  performanceText =
    weight > 0
      ? `${weight} lb × ${reps}`
      : `${reps} reps`;
}

                    let actionText =
                      target.message;

                    let actionClass =
                      "text-slate-600";

                    // ----------------------------------------
                    // Increase Load
                    // ----------------------------------------

                    if (
                      target.action ===
                      "increase-load"
                    ) {
                      actionText =
                        `Increase to ${target.targetWeight} lb next time`;

                      actionClass =
                        "font-semibold text-green-600";
                    }

                    // ----------------------------------------
                    // Reduce Assistance
                    // ----------------------------------------

                    if (
                      target.action ===
                      "reduce-assistance"
                    ) {
                      actionText =
                        `Reduce assistance to ${target.targetWeight} lb next time`;

                      actionClass =
                        "font-semibold text-green-600";
                    }

                    // ----------------------------------------
                    // Build Reps
                    // ----------------------------------------

                    if (
                      target.action ===
                      "build-reps"
                    ) {
                      actionText =
                        target.targetWeight !==
                        undefined
                          ? `Stay at ${target.targetWeight} lb — build reps`
                          : "Continue building reps";

                      actionClass =
                        "font-medium text-blue-600";
                    }

                    // ----------------------------------------
                    // Build Duration
                    // ----------------------------------------

                    if (
                      target.action ===
                      "build-duration"
                    ) {
                      actionText =
                        "Continue building duration";

                      actionClass =
                        "font-medium text-blue-600";
                    }

                    // ----------------------------------------
                    // Next Variation
                    // ----------------------------------------

                    if (
                      target.action ===
                      "next-variation"
                    ) {
                      const nextVariation =
                        exerciseLibrary.find(
                          (item) =>
                            item.id ===
                            target.nextVariationId
                        );

                      actionText =
                        nextVariation
                          ? `Progress to ${nextVariation.name} next time`
                          : "Progress to a harder variation next time";

                      actionClass =
                        "font-semibold text-green-600";
                    }

                    // ----------------------------------------
                    // Repeat
                    // ----------------------------------------

                    if (
                      target.action ===
                      "repeat"
                    ) {
                      actionText =
                        "Repeat target next time";

                      actionClass =
                        "font-medium text-blue-600";
                    }

                    // ----------------------------------------
                    // Review Load
                    // ----------------------------------------

                    if (
                      target.action ===
                      "review-load"
                    ) {
                      actionText =
                        target.message;

                      actionClass =
                        "font-medium text-amber-600";
                    }

                    // ----------------------------------------
                    // Insufficient Data
                    // ----------------------------------------

                    if (
                      target.action ===
                      "insufficient-data"
                    ) {
                      actionText =
                        target.message;

                      actionClass =
                        "font-medium text-slate-500";
                    }

                    return (
                      <div
                        key={
                          exercise.id
                        }
                        className="py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-semibold">
                              {
                                exercise.name
                              }
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {performanceText}
                            </p>

                            <p
                              className={`mt-1 text-sm ${actionClass}`}
                            >
                              {
                                actionText
                              }
                            </p>
                          </div>

                          <ChevronRight
                            size={18}
                            className="mt-1 shrink-0 text-slate-300"
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* ==================================================
              Exercise Summary
          =================================================== */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <Dumbbell
                  size={19}
                />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Workout Summary
                </p>

                <h2 className="mt-0.5 text-xl font-bold">
                  Completed Exercises
                </h2>
              </div>
            </div>

            <div className="mt-5 divide-y">
              {completedExercises.map(
                (exercise) => {
                  // Find this exercise's programming definition so the
                  // summary can display the appropriate metric.
                  const definition =
                    exerciseLibrary.find(
                      (item) =>
                        item.id ===
                          exercise.exerciseDefinitionId ||
                        (
                          !exercise.exerciseDefinitionId &&
                          item.name.toLowerCase() ===
                            exercise.name.toLowerCase()
                        )
                    );

                  const progressionType =
  definition?.progressionType;

const performanceType =
  definition?.performanceType;

// Conventional external-load volume only makes sense
// for weight + rep exercises.
//
// Weight + duration exercises such as Weighted Plank
// should not calculate weight × seconds as lifting volume.
const exerciseVolume =
  progressionType === "Load" &&
  performanceType !== "Duration"
    ? exercise.sets.reduce(
        (total, set) =>
          total +
          set.weight *
            set.reps,
        0
      )
    : 0;

                  // Assistance weight is useful information, but it
                  // should not be presented as lifting volume.
                  const assistance =
                    progressionType ===
                    "Assistance"
                      ? exercise.sets[0]
                          ?.weight ?? 0
                      : null;

                  return (
                    <div
                      key={exercise.id}
                      className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div>
                        <p className="font-semibold">
                          {exercise.name}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {exercise.sets.length}{" "}
                          {exercise.sets.length === 1
                            ? "set"
                            : "sets"}
                        </p>
                      </div>

                      {/* External-load exercise */}

                      {progressionType ===
                        "Load" &&
                        exerciseVolume > 0 && (
                          <p className="text-sm font-medium text-slate-500">
                            {formatNumber(
                              exerciseVolume
                            )}{" "}
                            lb
                          </p>
                        )}

                      {/* Assisted exercise */}

                      {progressionType ===
                        "Assistance" &&
                        assistance !== null && (
                          <p className="text-sm font-medium text-slate-500">
                            {assistance} lb assist
                          </p>
                        )}
                    </div>
                  );
                }
              )}

              {completedExercises.length ===
                0 && (
                <div className="py-6 text-center text-sm text-slate-500">
                  No completed sets were recorded.
                </div>
              )}
            </div>
          </div>

          {/* ==================================================
              Done
          =================================================== */}

          <button
            type="button"
            onClick={
              dismissFinishedWorkout
            }
            className="w-full rounded-2xl bg-blue-600 px-4 py-4 font-semibold text-white transition hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </AppShell>
    );
  }

  // ----------------------------------------------------------
  // No Active Workout
  // ----------------------------------------------------------

  if (!session) {
    return (
      <AppShell>
        <div className="mx-auto w-full max-w-3xl rounded-2xl border bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Workout
            </p>

            <h1 className="mt-2 text-2xl font-bold">
              Start a Workout
            </h1>

            <p className="mt-2 text-slate-500">
              Choose today&apos;s workout.
            </p>
          </div>

<div className="mt-6 space-y-3">
  {/* Gym A */}

  <button
    type="button"
    onClick={() =>
      startWorkout("Gym A")
    }
    className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-500 hover:bg-blue-50"
  >
    <div>
      <p className="font-semibold">
        Gym A
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Full body — leg press, chest press, row, hamstrings, shoulders & core
      </p>
    </div>

    <span className="text-xl">
      →
    </span>
  </button>

  {/* Gym B */}

  <button
    type="button"
    onClick={() =>
      startWorkout("Gym B")
    }
    className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-500 hover:bg-blue-50"
  >
    <div>
      <p className="font-semibold">
        Gym B
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Full body — squat, vertical pull, incline press, hamstrings & accessories
      </p>
    </div>

    <span className="text-xl">
      →
    </span>
  </button>

  {/* Gym C */}

  <button
    type="button"
    onClick={() =>
      startWorkout("Gym C")
    }
    className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-500 hover:bg-blue-50"
  >
    <div>
      <p className="font-semibold">
        Gym C
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Full body — glute emphasis, pull-ups, chest, arms, hips & core
      </p>
    </div>

    <span className="text-xl">
      →
    </span>
  </button>
</div>
        </div>
      </AppShell>
    );
  }

  // ----------------------------------------------------------
  // Workout Progress
  // ----------------------------------------------------------

  const totalSets =
    session.exercises.reduce(
      (sum, exercise) =>
        sum +
        exercise.sets.length,
      0
    );

  const completedSets =
    session.exercises.reduce(
      (sum, exercise) =>
        sum +
        exercise.sets.filter(
          (set) =>
            set.completed
        ).length,
      0
    );

  // Find the first exercise that still contains an
  // incomplete set.
  const activeExerciseIndex =
    session.exercises.findIndex(
      (exercise) =>
        exercise.sets.some(
          (set) =>
            !set.completed
        )
    );

  const currentExerciseIndex =
    activeExerciseIndex === -1
      ? session.exercises.length -
        1
      : activeExerciseIndex;

  // ----------------------------------------------------------
  // Active Workout
  // ----------------------------------------------------------

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl space-y-4">
        {/* Workout summary and progress */}

        <WorkoutHeader
          workoutType={
            session.workoutType
          }
          startedAt={
            session.startedAt
          }
          completedSets={
            completedSets
          }
          totalSets={
            totalSets
          }
        />

        {/* Exercise cards */}

        {session.exercises.map(
          (exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={
                exercise
              }
              previousExercise={getPreviousExercise(
                exercise.exerciseDefinitionId,
                exercise.name
              )}
              expanded={
                index ===
                currentExerciseIndex
              }
              onToggleSet={
                toggleSet
              }
              onUpdateSet={
                updateSet
              }
              onAddSet={
                addSet
              }
              onRemoveSet={
                removeSet
              }
              onRemoveExercise={
                removeExercise
              }

              onReplaceExercise={
                replaceExercise
              }
            />
          )
        )}

        {/* --------------------------------------------------
            Add Exercise
        --------------------------------------------------- */}

        <AddExercise
          existingExerciseNames={session.exercises.map(
            (exercise) =>
              exercise.name
          )}
          onAddExercise={(
            exerciseId,
            exerciseName
          ) => {
            addExercise(
              exerciseId,
              exerciseName
            );
          }}
        />

        {/* --------------------------------------------------
            Finish Workout
        --------------------------------------------------- */}

        <button
          type="button"
          onClick={() => {
            const confirmed =
              window.confirm(
                `Finish ${session.workoutType} Workout?`
              );

            if (confirmed) {
              finishWorkout();
            }
          }}
          className="w-full rounded-2xl bg-blue-600 px-4 py-4 font-semibold text-white transition hover:bg-blue-700"
        >
          Finish Workout
        </button>

        {/* --------------------------------------------------
            Cancel Workout
        --------------------------------------------------- */}

        <button
          type="button"
          onClick={() => {
            const confirmed =
              window.confirm(
                `Cancel ${session.workoutType} Workout?\n\nYour progress from this workout will not be saved.`
              );

            if (confirmed) {
              cancelWorkout();
            }
          }}
          className="w-full rounded-2xl border border-red-200 bg-white px-4 py-4 font-semibold text-red-600 transition hover:bg-red-50"
        >
          Cancel Workout
        </button>

        {/* --------------------------------------------------
            Undo Exercise Removal
        --------------------------------------------------- */}

        {removedExercise && (
          <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white shadow-lg">
            <span className="text-sm">
              {
                removedExercise
                  .exercise.name
              }{" "}
              removed
            </span>

            <button
              type="button"
              onClick={
                undoRemoveExercise
              }
              className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-300 transition hover:bg-white/10"
            >
              Undo
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}