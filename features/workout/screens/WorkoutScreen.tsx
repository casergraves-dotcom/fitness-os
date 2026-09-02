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
  Award,
  Check,
  ChevronRight,
  Dumbbell,
  TrendingUp,
} from "lucide-react";

import { useWorkoutSession } from "../hooks/useWorkoutSession";
import { useTrainingPlanState } from "../hooks/useTrainingPlanState";
import WorkoutWarmupCard from "../components/WorkoutWarmupCard";
import WorkoutExerciseNavigator from "../components/WorkoutExerciseNavigator";
import MobilityRoutineSession from "@/features/mobility/components/MobilityRoutineSession";
import { mobilityRoutines } from "@/features/mobility/mobilityLibrary";
import { useMobilityPreferences } from "@/features/mobility/hooks/useMobilityPreferences";

import {
  useExerciseLibrary,
} from "../hooks/useExerciseLibrary";

import {
  useWorkoutHistory,
} from "../hooks/useWorkoutHistory";

import {
  getExercisePersonalRecord,
} from "../utils/getExercisePersonalRecord";

import {
  getExerciseTarget,
} from "../getExerciseTarget";
import {
  getEquipmentProfileForDate,
} from "../logic/getTrainingParticipationPreferenceForDate";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  currentGymWorkoutCapabilities,
  currentGymWorkoutEquipment,
  currentHomeWorkoutCapabilities,
  currentHomeWorkoutEquipment,
  getStrengthWorkoutVariants,
  isStrengthWorkoutVariantAvailable,
} from "../backupWorkoutModel";

import type {
  MobilityRoutineId,
  StrengthWorkoutType,
  StrengthWorkoutVariant,
} from "../types";

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

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
// Workout Variant Helpers
// ============================================================

function getVariantName(
  variant: StrengthWorkoutVariant
) {
  if (variant.variantType === "FullGym") {
    return "Full Gym";
  }

  if (variant.variantType === "ShortGym") {
    return "Short Gym";
  }

  return "Home";
}


function getVariantDescription(
  variant: StrengthWorkoutVariant
) {
  const duration =
    variant.durationMin !== undefined &&
    variant.durationMax !== undefined
      ? `${variant.durationMin}–${variant.durationMax} min`
      : null;

  if (variant.variantType === "FullGym") {
    return [
      duration,
      "Complete programmed session",
    ]
      .filter(Boolean)
      .join(" · ");
  }

  if (variant.variantType === "ShortGym") {
    return [
      duration,
      "Reduced volume",
    ]
      .filter(Boolean)
      .join(" · ");
  }

  return [
    duration,
    "Bands + bodyweight",
  ]
    .filter(Boolean)
    .join(" · ");
}


// ============================================================
// Workout Screen
// ============================================================

export default function WorkoutScreen() {
  const { state: trainingPlanState } = useTrainingPlanState();
  const { favoriteRoutineIds, toggleFavorite } = useMobilityPreferences();
  const [
    selectedWorkoutType,
    setSelectedWorkoutType,
  ] = useState<StrengthWorkoutType | null>(
    null
  );

  const [
    selectedMobilityRoutineId,
    setSelectedMobilityRoutineId,
  ] = useState<MobilityRoutineId | "choose" | null>(null);

  const [
    expandedExerciseIds,
    setExpandedExerciseIds,
  ] = useState<string[]>([]);

  const expansionSessionId =
    useRef<string | null>(
      null
    );

  // ----------------------------------------------------------
  // Workout Session
  // ----------------------------------------------------------

  const {
    session,
    loaded,
    finished,
    finishValidationError,

    startWorkout,
    shortenWorkout,
    finishWorkout,
    cancelWorkout,
    dismissFinishedWorkout,

    completeWarmup,
    skipWarmup,
    resetWarmup,

    toggleSet,
    updateSet,
    addSet,
    removeSet,

    addRampUpSet,
    updateRampUpSet,
    toggleRampUpSet,
    removeRampUpSet,

    addExercise,
    replaceExercise,
    removeExercise,
    undoRemoveExercise,
    removedExercise,

    getPreviousExercise,
  } = useWorkoutSession();

  const equipmentPreferenceDate =
    session?.scheduledDate ?? formatLocalDate(new Date());
  const homeEquipmentProfile = getEquipmentProfileForDate(
    trainingPlanState?.trainingParticipationPreferences,
    equipmentPreferenceDate,
    "Home",
    {
      equipment: currentHomeWorkoutEquipment,
      capabilities: currentHomeWorkoutCapabilities,
    }
  );
  const gymEquipmentProfile = getEquipmentProfileForDate(
    trainingPlanState?.trainingParticipationPreferences,
    equipmentPreferenceDate,
    "Gym",
    {
      equipment: currentGymWorkoutEquipment,
      capabilities: currentGymWorkoutCapabilities,
    }
  );

  // ----------------------------------------------------------
  // Exercise Card Expansion
  // ----------------------------------------------------------

  useEffect(() => {
    if (!session) {
      if (
        expansionSessionId.current !==
          null
      ) {
        expansionSessionId.current =
          null;

        setExpandedExerciseIds(
          []
        );
      }

      return;
    }

    if (
      expansionSessionId.current ===
        session.id
    ) {
      return;
    }

    const firstIncompleteExercise =
      session.exercises.find(
        (
          exercise
        ) =>
          exercise.sets.some(
            (
              set
            ) =>
              !set.completed
          )
      );

    const initiallyExpandedExercise =
      firstIncompleteExercise ??
      session.exercises[0];

    expansionSessionId.current =
      session.id;

    setExpandedExerciseIds(
      initiallyExpandedExercise
        ? [
            initiallyExpandedExercise
              .id,
          ]
        : []
    );
  }, [
    session,
  ]);

  function toggleExerciseExpanded(
    exerciseId:
      string
  ) {
    setExpandedExerciseIds(
      (
        current
      ) =>
        current.includes(
          exerciseId
        )
          ? current.filter(
              (
                currentExerciseId
              ) =>
                currentExerciseId !==
                exerciseId
            )
          : [
              ...current,
              exerciseId,
            ]
    );
  }

  function jumpToExercise(exerciseId: string) {
    setExpandedExerciseIds((current) =>
      current.includes(exerciseId)
        ? current
        : [...current, exerciseId]
    );

    window.requestAnimationFrame(() => {
      document
        .getElementById(`workout-exercise-${exerciseId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // ----------------------------------------------------------
  // Exercise Library
  // ----------------------------------------------------------

  const {
    exercises: exerciseLibrary,
  } = useExerciseLibrary();

  // Keep the history that existed when this screen loaded.
  // The separate history hook is intentionally not mutated by
  // finishWorkout, so the completed workout cannot compare
  // against itself when personal records are calculated.
  const {
    history: previousWorkoutHistory,
  } = useWorkoutHistory();

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

const requestedVariantId =
  searchParams.get(
    "variant"
  ) ??
  undefined;

const requestedVariantType =
  searchParams.get(
    "variantType"
  ) ??
  undefined;

  if (
    requestedWorkout !== "Gym A" &&
    requestedWorkout !== "Gym B" &&
    requestedWorkout !== "Gym C"
  ) {
    return;
  }

  scheduledStartHandled.current =
    true;

  const resolvedVariantId =
    requestedVariantId ??
    (
      requestedVariantType
        ? getStrengthWorkoutVariants(
            requestedWorkout
          ).find(
            (variant) =>
              variant.variantType ===
              requestedVariantType
          )?.id
        : undefined
    );

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
    },
    resolvedVariantId
  );

  return;
}

startWorkout(
  requestedWorkout,
  undefined,
  resolvedVariantId
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

    // --------------------------------------------------------
    // Personal Records
    // --------------------------------------------------------

    const personalRecords =
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

          return getExercisePersonalRecord(
            exercise,
            previousWorkoutHistory,
            definition
          );
        })
        .filter(
          (
            record
          ): record is NonNullable<
            typeof record
          > => record !== null
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
              Personal Records
          =================================================== */}

          {personalRecords.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <Award size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                    Personal Record
                  </p>

                  <h2 className="mt-0.5 text-xl font-bold">
                    New Estimated Strength Best
                  </h2>
                </div>
              </div>

              <div className="mt-5 divide-y divide-amber-200">
                {personalRecords.map(
                  (record) => (
                    <div
                      key={record.exerciseName}
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div>
                        <p className="font-semibold">
                          {record.exerciseName}
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          Estimated 1RM: {record.estimatedOneRepMax} lb
                        </p>
                      </div>

                      <p className="shrink-0 font-semibold text-green-600">
                        +{record.improvement} lb
                      </p>
                    </div>
                  )
                )}
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                Estimated from your logged working sets. No max testing required.
              </p>
            </div>
          )}

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
                    // Reduce Load
                    // ----------------------------------------

                    if (
                      target.action ===
                      "reduce-load"
                    ) {
                      actionText =
                        `Reduce to ${target.targetWeight} lb next time`;

                      actionClass =
                        "font-semibold text-amber-600";
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
                    // Increase Assistance
                    // ----------------------------------------

                    if (
                      target.action ===
                      "increase-assistance"
                    ) {
                      actionText =
                        `Increase assistance to ${target.targetWeight} lb next time`;

                      actionClass =
                        "font-semibold text-amber-600";
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
    if (selectedMobilityRoutineId && selectedMobilityRoutineId !== "choose") {
      return (
        <AppShell>
          <MobilityRoutineSession
            routineId={selectedMobilityRoutineId}
            onClose={() => setSelectedMobilityRoutineId("choose")}
            favorite={favoriteRoutineIds.includes(selectedMobilityRoutineId)}
            onToggleFavorite={() => toggleFavorite(selectedMobilityRoutineId)}
          />
        </AppShell>
      );
    }

    if (selectedMobilityRoutineId === "choose") {
      return (
        <AppShell>
          <div className="mx-auto w-full max-w-3xl rounded-2xl border bg-white p-6 shadow-sm">
            <button
              type="button"
              onClick={() => setSelectedMobilityRoutineId(null)}
              className="text-sm font-medium text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-blue-700"
            >
              ← Choose a different activity
            </button>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-blue-600">
              Mobility & Stretching
            </p>
            <h1 className="mt-2 text-2xl font-bold">What would help today?</h1>
            <p className="mt-2 text-slate-500">Choose a focused recovery routine.</p>
            <div className="mt-6 space-y-3">
              {mobilityRoutines
                .slice()
                .sort(
                  (a, b) =>
                    Number(favoriteRoutineIds.includes(b.id)) -
                    Number(favoriteRoutineIds.includes(a.id))
                )
                .map((routine) => (
                <button
                  key={routine.id}
                  type="button"
                  onClick={() => setSelectedMobilityRoutineId(routine.id)}
                  className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-500 hover:bg-blue-50"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{routine.name}</p>
                      {favoriteRoutineIds.includes(routine.id) && (
                        <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
                          Favorite
                        </span>
                      )}
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        {routine.category}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                        {routine.durationOptions.join(" / ")} min
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-5 text-slate-500">{routine.description}</p>
                  </div>
                  <span className="shrink-0 text-xl">→</span>
                </button>
              ))}
            </div>
          </div>
        </AppShell>
      );
    }

    const workoutDescriptions:
      Record<
        StrengthWorkoutType,
        string
      > = {
        "Gym A":
          "Full body — leg press, chest press, row, hamstrings, shoulders & core",

        "Gym B":
          "Full body — squat, vertical pull, incline press, hamstrings & accessories",

        "Gym C":
          "Full body — glute emphasis, pull-ups, chest, arms, hips & core",
      };

    const workoutTypes:
      StrengthWorkoutType[] = [
        "Gym A",
        "Gym B",
        "Gym C",
      ];

    const variants =
      selectedWorkoutType
        ? getStrengthWorkoutVariants(
            selectedWorkoutType
          )
        : [];

    const availableVariants =
      variants.filter(
        (variant) => {
          const profile = variant.variantType === "Home"
            ? homeEquipmentProfile
            : gymEquipmentProfile;
          return isStrengthWorkoutVariantAvailable(
            variant,
            profile.equipment,
            profile.capabilities
          );
        }
      );

    return (
      <AppShell>
        <div className="mx-auto w-full max-w-3xl rounded-2xl border bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Workout
            </p>

            <h1 className="mt-2 text-2xl font-bold">
              {selectedWorkoutType
                ? `Choose ${selectedWorkoutType} Version`
                : "Start a Workout"}
            </h1>

            <p className="mt-2 text-slate-500">
              {selectedWorkoutType
                ? "Choose the version that fits today's situation."
                : "Choose today's workout."}
            </p>
          </div>

          {!selectedWorkoutType ? (
            <div className="mt-6 space-y-3">
              {workoutTypes.map(
                (workoutType) => (
                  <button
                    key={workoutType}
                    type="button"
                    onClick={() =>
                      setSelectedWorkoutType(
                        workoutType
                      )
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-500 hover:bg-blue-50"
                  >
                    <div>
                      <p className="font-semibold">
                        {workoutType}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {
                          workoutDescriptions[
                            workoutType
                          ]
                        }
                      </p>
                    </div>

                    <span className="text-xl">
                      →
                    </span>
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => setSelectedMobilityRoutineId("choose")}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-500 hover:bg-blue-50"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">Mobility & Stretching</p>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                      10 min
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Gentle full-body recovery you can do anytime
                  </p>
                </div>

                <span className="text-xl">→</span>
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <button
                type="button"
                onClick={() =>
                  setSelectedWorkoutType(
                    null
                  )
                }
                className="mb-4 text-sm font-medium text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-blue-700"
              >
                ← Choose a different workout
              </button>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() =>
                    startWorkout(
                      selectedWorkoutType
                    )
                  }
                  className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-500 hover:bg-blue-50"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">
                        Full Gym
                      </p>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      Complete programmed session
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Your standard editable {selectedWorkoutType} workout.
                    </p>
                  </div>

                  <span className="shrink-0 text-xl">
                    →
                  </span>
                </button>

                {availableVariants.map(
                  (variant) => {
                    const setCount =
                      variant.exercises.reduce(
                        (
                          total,
                          exercise
                        ) =>
                          total +
                          exercise.sets,
                        0
                      );

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() =>
                          startWorkout(
                            selectedWorkoutType,
                            undefined,
                            variant.variantType ===
                              "FullGym"
                              ? undefined
                              : variant.id
                          )
                        }
                        className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-500 hover:bg-blue-50"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">
                              {
                                getVariantName(
                                  variant
                                )
                              }
                            </p>

                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                              {setCount} sets
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {
                              getVariantDescription(
                                variant
                              )
                            }
                          </p>

                          {variant.note && (
                            <p className="mt-2 text-xs leading-5 text-slate-500">
                              {variant.note}
                            </p>
                          )}
                        </div>

                        <span className="shrink-0 text-xl">
                          →
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}
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
          variantLabel={
            session.variantLabel
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

        <WorkoutWarmupCard
          completed={Boolean(session.warmupCompletedAt)}
          skipped={Boolean(session.warmupSkippedAt)}
          onComplete={completeWarmup}
          onSkip={skipWarmup}
          onReset={resetWarmup}
        />

        <WorkoutExerciseNavigator
          exercises={session.exercises}
          onSelect={jumpToExercise}
        />

        {/* Exercise cards */}

        {session.exercises.map(
          (exercise, index) => (
            <div
              key={exercise.id}
              id={`workout-exercise-${exercise.id}`}
              className="scroll-mt-24"
            >
            <ExerciseCard
              exercise={
                exercise
              }
              exerciseNumber={
                index +
                1
              }
              exerciseCount={
                session.exercises
                  .length
              }
              unavailableExerciseDefinitionIds={
                session.exercises.flatMap(
                  (sessionExercise) =>
                    sessionExercise
                      .exerciseDefinitionId
                      ? [
                          sessionExercise
                            .exerciseDefinitionId,
                        ]
                      : []
                )
              }
              substitutionEnvironment={
                session.variantType === "Home"
                  ? "Home"
                  : "Gym"
              }
              availableEquipment={
                session.variantType === "Home"
                  ? homeEquipmentProfile.equipment
                  : gymEquipmentProfile.equipment
              }
              availableCapabilities={
                session.variantType === "Home"
                  ? homeEquipmentProfile.capabilities
                  : gymEquipmentProfile.capabilities
              }
              previousExercise={getPreviousExercise(
                exercise.exerciseDefinitionId,
                exercise.name
              )}
              expanded={
                expandedExerciseIds.includes(
                  exercise.id
                )
              }
              onToggleExpanded={
                () =>
                  toggleExerciseExpanded(
                    exercise.id
                  )
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
              onAddRampUpSet={
                addRampUpSet
              }
              onUpdateRampUpSet={
                updateRampUpSet
              }
              onToggleRampUpSet={
                toggleRampUpSet
              }
              onRemoveRampUpSet={
                removeRampUpSet
              }
              onRemoveExercise={
                removeExercise
              }

              onReplaceExercise={
                replaceExercise
              }
            />
            </div>
          )
        )}

        {/* --------------------------------------------------
            Shorten Workout
        --------------------------------------------------- */}

        {session.variantType ===
          "FullGym" && (
          <button
            type="button"
            onClick={() => {
              const confirmed =
                window.confirm(
                  `Shorten ${session.workoutType} Workout?\n\nFitness OS will switch this session to the Short Gym version. Completed work will be kept.`
                );

              if (confirmed) {
                shortenWorkout();
              }
            }}
            className="w-full rounded-2xl border border-blue-200 bg-white px-4 py-4 font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Shorten Workout
          </button>
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

        {finishValidationError && (
          <div
            role="alert"
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            <p className="font-semibold">
              Workout not finished
            </p>

            <p className="mt-1">
              {finishValidationError}
            </p>
          </div>
        )}

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
