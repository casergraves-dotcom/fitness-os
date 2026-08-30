"use client";

// ============================================================
// Imports
// ============================================================

import {
  useEffect,
  useState,
} from "react";

import {
  useWorkoutTemplates,
} from "./useWorkoutTemplates";

import {
  useExerciseLibrary,
} from "./useExerciseLibrary";

import {
  getExerciseTarget,
} from "../getExerciseTarget";

import {
  normalizeRpe,
} from "../rpe";

import {
  strengthWorkoutVariants,
} from "../backupWorkoutModel";

import type {
  Exercise,
  ExerciseDefinition,
  StrengthWorkoutType,
  TrainingPlanState,
  WorkoutSession,
} from "../types";

import {
  fitnessOsTrainingPlan,
} from "../trainingPlan";

import {
  getTrainingScheduleForDate,
} from "../utils/getTrainingScheduleForDate";

import {
  recordTrainingActivityCompletion,
} from "../utils/trainingActivityCompletionStorage";

import {
  setFitnessOsStorage,
} from "@/lib/storage/fitnessOsStorage";

// ============================================================
// Storage Keys
// ============================================================

const STORAGE_KEY =
  "fitness-os-active-workout";

const HISTORY_STORAGE_KEY =
  "fitness-os-workout-history";

const TRAINING_PLAN_STATE_STORAGE_KEY =
  "fitness-os-training-plan-state";

// ============================================================
// Helpers
// ============================================================

function createId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

// ------------------------------------------------------------
// Parse Local Training Date
// ------------------------------------------------------------

function parseLocalTrainingDate(
  dateString: string
): Date | null {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      dateString
    );

  if (!match) {
    return null;
  }

  const year =
    Number(
      match[1]
    );

  const month =
    Number(
      match[2]
    );

  const day =
    Number(
      match[3]
    );

  const date =
    new Date(
      year,
      month - 1,
      day
    );

  if (
    date.getFullYear() !== year ||
    date.getMonth() !==
      month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

// ------------------------------------------------------------
// Find Exercise Definition
// ------------------------------------------------------------

function findExerciseDefinition(
  exerciseLibrary: ExerciseDefinition[],
  exerciseDefinitionId: string | undefined,
  exerciseName: string
) {
  // Prefer the permanent Exercise Library ID.
  if (exerciseDefinitionId) {
    const definitionById =
      exerciseLibrary.find(
        (definition) =>
          definition.id ===
          exerciseDefinitionId
      );

    if (definitionById) {
      return definitionById;
    }
  }

  // Legacy fallback for exercises created before
  // permanent IDs were introduced.
  return exerciseLibrary.find(
    (definition) =>
      definition.name.toLowerCase() ===
      exerciseName.toLowerCase()
  );
}

// ------------------------------------------------------------
// Get Starting Weight
// ------------------------------------------------------------

function getStartingWeight(
  definition: ExerciseDefinition | undefined,
  previousExercise: Exercise | undefined
) {
  // No previous workout means we don't have a load
  // recommendation yet.
  if (!previousExercise) {
    return 0;
  }

  // Use the progression engine whenever programming
  // exists for this exercise.
  const target =
    getExerciseTarget(
      definition,
      previousExercise
    );

  // Load and assistance progression both return the
  // recommended value through targetWeight.
  if (
    target.targetWeight !== undefined
  ) {
    return target.targetWeight;
  }

  // Rep / duration exercises generally don't need a
  // prescribed external load.
  if (
    definition?.progressionType === "Reps" ||
    definition?.progressionType === "Duration"
  ) {
    return 0;
  }

  // Legacy exercises without progression programming
  // retain the old Fitness OS behavior of carrying
  // forward the most recent weight.
  return (
    previousExercise.sets[0]
      ?.weight ?? 0
  );
}

// ============================================================
// Record Scheduled Strength Completion
// ============================================================

function recordScheduledStrengthCompletion(
  workout: WorkoutSession
) {
  // ----------------------------------------------------------
  // Training Plan State
  // ----------------------------------------------------------

  const savedPlanState =
    localStorage.getItem(
      TRAINING_PLAN_STATE_STORAGE_KEY
    );

  if (!savedPlanState) {
    return;
  }

  let planState:
    TrainingPlanState;

  try {
    planState =
      JSON.parse(
        savedPlanState
      );
  } catch {
    return;
  }


  // ----------------------------------------------------------
  // Completion Time
  // ----------------------------------------------------------

  if (!workout.completedAt) {
    return;
  }

  const completedAt =
    new Date(
      workout.completedAt
    );

  if (
    Number.isNaN(
      completedAt.getTime()
    )
  ) {
    return;
  }


  // ----------------------------------------------------------
  // Explicit Scheduled Context
  // ----------------------------------------------------------
  //
  // Workouts launched from Today carry the exact scheduled
  // activity ID and scheduled calendar date.
  //
  // Prefer this context over the completion timestamp so a
  // workout that crosses midnight still satisfies the activity
  // that actually launched it.

  if (
    workout.scheduledActivityId &&
    workout.scheduledDate
  ) {
    const scheduledDate =
      parseLocalTrainingDate(
        workout.scheduledDate
      );

    if (scheduledDate) {
      const schedule =
        getTrainingScheduleForDate(
          fitnessOsTrainingPlan,
          planState,
          scheduledDate
        );

      const scheduledActivity =
        schedule?.trainingDay.activities.find(
          (activity) =>
            activity.id ===
              workout.scheduledActivityId &&
            activity.type ===
              "Strength" &&
            activity.strengthWorkout ===
              workout.workoutType
        );

      if (scheduledActivity) {
        recordTrainingActivityCompletion(
          scheduledActivity,
          {
            date:
              scheduledDate,

            completedAt,

            workoutSessionId:
              workout.id,
          }
        );

        return;
      }
    }
  }


  // ----------------------------------------------------------
  // Completion-Date Fallback
  // ----------------------------------------------------------
  //
  // Manually started workouts do not carry scheduled context.
  //
  // Preserve the existing behavior: if the completed workout
  // matches a strength activity scheduled for the day it was
  // completed, allow it to satisfy that activity.

  const schedule =
    getTrainingScheduleForDate(
      fitnessOsTrainingPlan,
      planState,
      completedAt
    );

  if (!schedule) {
    return;
  }


  const scheduledActivity =
    schedule.trainingDay.activities.find(
      (activity) =>
        activity.type ===
          "Strength" &&
        activity.strengthWorkout ===
          workout.workoutType
    );

  if (!scheduledActivity) {
    return;
  }


  recordTrainingActivityCompletion(
    scheduledActivity,
    {
      date:
        completedAt,

      completedAt,

      workoutSessionId:
        workout.id,
    }
  );
}

// ============================================================
// Workout Session Hook
// ============================================================

export function useWorkoutSession() {
  // ----------------------------------------------------------
  // Workout Templates
  // ----------------------------------------------------------

  const {
    templates: workoutTemplates,
    loaded: templatesLoaded,
  } = useWorkoutTemplates();

  // ----------------------------------------------------------
  // Exercise Library
  // ----------------------------------------------------------

  const {
    exercises: exerciseLibrary,
    loaded: exerciseLibraryLoaded,
  } = useExerciseLibrary();

  // ----------------------------------------------------------
  // State
  // ----------------------------------------------------------

  const [
    session,
    setSession,
  ] =
    useState<WorkoutSession | null>(
      null
    );

  const [
    loaded,
    setLoaded,
  ] =
    useState(false);

  const [
    finished,
    setFinished,
  ] =
    useState(false);

  const [
    finishValidationError,
    setFinishValidationError,
  ] =
    useState<string | null>(
      null
    );

  // Completed workouts are kept in memory so components can
  // access previous exercise performance without reading
  // localStorage themselves.
  const [
    workoutHistory,
    setWorkoutHistory,
  ] =
    useState<WorkoutSession[]>([]);

  const [
    removedExercise,
    setRemovedExercise,
  ] = useState<{
    exercise: Exercise;
    index: number;
  } | null>(null);

  // ----------------------------------------------------------
  // Persistence - Load Workout Data
  // ----------------------------------------------------------

  useEffect(() => {
    // Load the active workout, if one exists.
    const savedSession =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (savedSession) {
      try {
        const parsedSession:
          WorkoutSession =
          JSON.parse(
            savedSession
          );

        setSession(
          parsedSession
        );
      } catch {
        // Remove corrupted workout data rather than
        // preventing the workout screen from loading.
        localStorage.removeItem(
          STORAGE_KEY
        );
      }
    }

    // Load completed workout history.
    const savedHistory =
      localStorage.getItem(
        HISTORY_STORAGE_KEY
      );

    if (savedHistory) {
      try {
        const parsedHistory:
          WorkoutSession[] =
          JSON.parse(
            savedHistory
          );

        setWorkoutHistory(
          parsedHistory
        );
      } catch {
        // Remove corrupted history data so the app can
        // continue with an empty history.
        localStorage.removeItem(
          HISTORY_STORAGE_KEY
        );
      }
    }

    setLoaded(true);
  }, []);

  // ----------------------------------------------------------
  // Persistence - Save Active Workout
  // ----------------------------------------------------------

  useEffect(() => {
    // Don't save until localStorage has been checked.
    // Also don't save a completed or nonexistent workout.
    if (
      !loaded ||
      finished ||
      !session
    ) {
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        session
      )
    );
  }, [
    session,
    loaded,
    finished,
  ]);

  // ----------------------------------------------------------
  // Workout History - Previous Exercise Performance
  // ----------------------------------------------------------

  function getPreviousExercise(
    exerciseDefinitionId:
      | string
      | undefined,
    exerciseName: string
  ): Exercise | undefined {
    // History is stored newest-first, so the first matching
    // exercise is the most recent recorded performance.
    for (
      const workout
      of workoutHistory
    ) {
      const exercise =
        workout.exercises.find(
          (item) => {
            // ----------------------------------------------
            // Permanent ID Match
            // ----------------------------------------------

            if (
              exerciseDefinitionId &&
              item.exerciseDefinitionId
            ) {
              return (
                item.exerciseDefinitionId ===
                exerciseDefinitionId
              );
            }

            // ----------------------------------------------
            // Legacy Name Match
            // ----------------------------------------------

            return (
              item.name.toLowerCase() ===
              exerciseName.toLowerCase()
            );
          }
        );

      if (exercise) {
        return exercise;
      }
    }

    return undefined;
  }

  // ----------------------------------------------------------
  // Workout Lifecycle - Start Workout
  // ----------------------------------------------------------

  function startWorkout(
    workoutType: StrengthWorkoutType,
    scheduledContext?: {
      activityId: string;
      date: string;
    },
    variantId?: string
  ) {
    // --------------------------------------------------------
    // Resolve Scheduled Strength Prescription
    // --------------------------------------------------------
    //
    // Workouts launched from Today carry the scheduled activity
    // that prescribed them. Resolve that activity here so
    // schedule-level strength modifiers, such as deload volume,
    // affect the workout that is actually created.
    //
    // Manually started workouts have no scheduled context and
    // therefore retain the normal full-volume prescription.

    let strengthVolumeMultiplier = 1;

    if (scheduledContext) {
      const savedPlanState =
        localStorage.getItem(
          TRAINING_PLAN_STATE_STORAGE_KEY
        );

      const scheduledDate =
        parseLocalTrainingDate(
          scheduledContext.date
        );

      if (
        savedPlanState &&
        scheduledDate
      ) {
        try {
          const planState:
            TrainingPlanState =
            JSON.parse(
              savedPlanState
            );

          const schedule =
            getTrainingScheduleForDate(
              fitnessOsTrainingPlan,
              planState,
              scheduledDate
            );

          const scheduledActivity =
            schedule?.trainingDay.activities.find(
              (activity) =>
                activity.id ===
                  scheduledContext.activityId &&
                activity.type ===
                  "Strength" &&
                activity.strengthWorkout ===
                  workoutType
            );

          if (
            scheduledActivity
              ?.strengthVolumeMultiplier !==
            undefined
          ) {
            strengthVolumeMultiplier =
              Math.min(
                1,
                Math.max(
                  0,
                  scheduledActivity
                    .strengthVolumeMultiplier
                )
              );
          }
        } catch {
          // Invalid or unavailable plan state should not prevent
          // a workout from starting. Fall back to the normal
          // full-volume prescription.
        }
      }
    }
    // --------------------------------------------------------
    // Resolve Performed Variant
    // --------------------------------------------------------
    //
    // workoutType always remains Gym A / B / C.
    //
    // A ShortGym or Home selection changes the exercises that
    // are performed, but does not change the scheduled workout
    // identity used by adherence and progression.

    const selectedVariant =
      variantId
        ? strengthWorkoutVariants.find(
            (variant) =>
              variant.id ===
                variantId &&
              variant.sourceStrengthWorkout ===
                workoutType
          )
        : undefined;

    // --------------------------------------------------------
    // Resolve Exercise Prescription
    // --------------------------------------------------------

    const template =
      selectedVariant
        ? selectedVariant.exercises.map(
            (
              variantExercise
            ) => {
              const definition =
                exerciseLibrary.find(
                  (item) =>
                    item.id ===
                    variantExercise.exerciseDefinitionId
                );

              if (!definition) {
                throw new Error(
                  `Missing exercise definition: ${variantExercise.exerciseDefinitionId}`
                );
              }

              return {
                id:
                  createId(),

                exerciseDefinitionId:
                  definition.id,

                name:
                  definition.name,

                prescribedSetCount:
                  variantExercise.sets,

                sets:
                  Array.from(
                    {
                      length:
                        variantExercise.sets,
                    },
                    () => ({
                      id:
                        createId(),
                      weight: 0,
                      reps: 0,
                      completed: false,
                    })
                  ),
              };
            }
          )
        : workoutTemplates[
            workoutType
          ];

    // Build each exercise using its progression
    // recommendation and previous performance.
    const exercises =
      template.map(
        (exercise) => {
          const previousExercise =
            getPreviousExercise(
              exercise.exerciseDefinitionId,
              exercise.name
            );

          const definition =
            findExerciseDefinition(
              exerciseLibrary,
              exercise.exerciseDefinitionId,
              exercise.name
            );

          const startingWeight =
            getStartingWeight(
              definition,
              previousExercise
            );

          const normalSetCount =
            exercise.prescribedSetCount ??
            exercise.sets.length;

          const prescribedSetCount =
            Math.max(
              1,
              Math.round(
                normalSetCount *
                  strengthVolumeMultiplier
              )
            );

          return {
            ...exercise,

            id: createId(),

            //Capture the actual template prescription at the moment
            // this workout begins.
            //
            // This is intentionally based on the workout template,
            // NOT definition.sets from the Exercise Library.
            prescribedSetCount,

            sets:
              exercise.sets
                .slice(
                  0,
                  prescribedSetCount
                )
                .map(
                  (
                    templateSet
                  ) => ({
                  ...templateSet,

                  id: createId(),

                  // --------------------------------------
                  // Today's Recommended Weight
                  // --------------------------------------

                  // Every planned working set starts with
                  // the same recommended load.
                  //
                  // Example:
                  //
                  // Last workout:
                  // 200 × 12
                  // 200 × 12
                  // 200 × 12
                  //
                  // Today:
                  // 205 × 0
                  // 205 × 0
                  // 205 × 0
                  weight:
                    startingWeight,

                  // --------------------------------------
                  // Today's Actual Reps
                  // --------------------------------------

                  // Never prefill reps from history.
                  // Reps should represent what was
                  // actually performed today.
                  reps: 0,

                  completed:
                    false,
                })
              ),
          };
        }
      );

    const newSession:
      WorkoutSession = {
      id: createId(),
      workoutType,

      variantType:
        selectedVariant?.variantType ??
        "FullGym",

      variantId:
        selectedVariant?.id,

      variantLabel:
        selectedVariant?.label,

      startedAt:
        new Date().toISOString(),

      completedAt:
        undefined,

      restStartedAt:
        undefined,

      exercises,

      scheduledActivityId:
        scheduledContext?.activityId,

      scheduledDate:
        scheduledContext?.date,
    };

    // Clear temporary state left over from the previous
    // workout before activating the new one.
    setFinished(false);

    setFinishValidationError(
      null
    );

    setRemovedExercise(
      null
    );

    setSession(
      newSession
    );

    // Save immediately so the workout survives even if
    // the page is refreshed right after starting.
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        newSession
      )
    );
  }

  // ----------------------------------------------------------
  // Set Management - Complete / Uncomplete Set
  // ----------------------------------------------------------

  function toggleSet(
    exerciseId: string,
    setId: string
  ) {
    setSession(
      (previous) => {
        if (!previous) {
          return previous;
        }

        let startedRestTimer =
          false;

        const exercises =
          previous.exercises.map(
            (exercise) => {
              if (
                exercise.id !==
                exerciseId
              ) {
                return exercise;
              }

              const setIndex =
                exercise.sets.findIndex(
                  (set) =>
                    set.id ===
                    setId
                );

              if (
                setIndex === -1
              ) {
                return exercise;
              }

              const selectedSet =
                exercise.sets[
                  setIndex
                ];

              // ------------------------------------------
              // Unchecking a Completed Set
              // ------------------------------------------

              if (
                selectedSet.completed
              ) {
                // Only the most recently completed set can
                // be unchecked. This prevents gaps such as:
                //
                // ✓ Set 1
                // ○ Set 2
                // ✓ Set 3

                const hasCompletedSetAfter =
                  exercise.sets
                    .slice(
                      setIndex + 1
                    )
                    .some(
                      (set) =>
                        set.completed
                    );

                if (
                  hasCompletedSetAfter
                ) {
                  return exercise;
                }

                return {
                  ...exercise,

                  sets:
                    exercise.sets.map(
                      (set) =>
                        set.id ===
                        setId
                          ? {
                              ...set,

                              completed:
                                false,
                            }
                          : set
                    ),
                };
              }

              // ------------------------------------------
              // Completing a New Set
              // ------------------------------------------

              // Every earlier set must already be completed
              // before this set can be marked complete.
              const previousSetsComplete =
                exercise.sets
                  .slice(
                    0,
                    setIndex
                  )
                  .every(
                    (set) =>
                      set.completed
                  );

              if (
                !previousSetsComplete
              ) {
                return exercise;
              }

              startedRestTimer =
                true;

              return {
                ...exercise,

                sets:
                  exercise.sets.map(
                    (set) =>
                      set.id ===
                      setId
                        ? {
                            ...set,

                            completed:
                              true,
                          }
                        : set
                  ),
              };
            }
          );

        return {
          ...previous,

          exercises,

          // Only restart the rest timer when a new set was
          // successfully completed.
          restStartedAt:
            startedRestTimer
              ? new Date()
                  .toISOString()
              : previous
                  .restStartedAt,
        };
      }
    );
  }

  // ----------------------------------------------------------
  // Set Management - Edit Weight / Reps
  // ----------------------------------------------------------

function updateSet(
  exerciseId: string,
  setId: string,
  field:
    | "weight"
    | "reps"
    | "rpe",
  value: number
) {
  // ----------------------------------------------------------
  // Validate Value
  // ----------------------------------------------------------

  // Prevent NaN, Infinity, and other invalid numeric values
  // from entering workout state.
  const safeValue =
    Number.isFinite(value)
      ? value
      : 0;

  // Weight may contain decimals, but can never be negative.
  //
  // Reps must be whole numbers and can never be negative.
  const validatedValue =
    field === "rpe"
      ? safeValue >= 1
        ? normalizeRpe(
            Math.floor(
              safeValue
            )
          )
        : undefined
      : field === "reps"
      ? Math.max(
          0,
          Math.floor(safeValue)
        )
      : Math.max(
          0,
          safeValue
        );

  // ----------------------------------------------------------
  // Update Session
  // ----------------------------------------------------------

  setSession(
    (previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,

        exercises:
          previous.exercises.map(
            (exercise) =>
              exercise.id !==
              exerciseId
                ? exercise
                : {
                    ...exercise,

                    sets:
                      exercise.sets.map(
                        (set) =>
                          set.id !==
                          setId
                            ? set
                            : field === "rpe"
                              ? {
                                  ...set,

                                  rpe:
                                    validatedValue,
                                }
                              : {
                                ...set,

                                [field]:
                                  validatedValue as number,
                              }
                      ),
                  }
          ),
      };
    }
  );
}

  // ----------------------------------------------------------
  // Set Management - Add Set
  // ----------------------------------------------------------

  function addSet(
    exerciseId: string
  ) {
    setSession(
      (previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,

          exercises:
            previous.exercises.map(
              (exercise) => {
                if (
                  exercise.id !==
                  exerciseId
                ) {
                  return exercise;
                }

                // New sets copy the weight from the
                // exercise's most recent set.
                //
                // Reps remain blank because the new set
                // has not been performed yet.
                const lastSet =
                  exercise.sets.at(
                    -1
                  );

                return {
                  ...exercise,

                  sets: [
                    ...exercise.sets,

                    {
                      id: createId(),

                      weight:
                        lastSet
                          ?.weight ??
                        0,

                      reps: 0,

                      completed:
                        false,
                    },
                  ],
                };
              }
            ),
        };
      }
    );
  }

  // ----------------------------------------------------------
  // Set Management - Remove Set
  // ----------------------------------------------------------

  function removeSet(
    exerciseId: string,
    setId: string
  ) {
    setSession(
      (previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,

          exercises:
            previous.exercises.map(
              (exercise) =>
                exercise.id !==
                exerciseId
                  ? exercise
                  : {
                      ...exercise,

                      sets:
                        exercise.sets.filter(
                          (set) =>
                            set.id !==
                            setId
                        ),
                    }
            ),
        };
      }
    );
  }

  function addRampUpSet(exerciseId: string) {
    setSession((previous) => {
      if (!previous) return previous;

      return {
        ...previous,
        exercises: previous.exercises.map((exercise) => {
          if (exercise.id !== exerciseId) return exercise;

          const rampUpSets = exercise.rampUpSets ?? [];
          if (rampUpSets.length >= 3) return exercise;

          const workingWeight = exercise.sets[0]?.weight ?? 0;
          const factors = [0.5, 0.7, 0.85];
          const reps = [8, 5, 3];
          const index = rampUpSets.length;

          return {
            ...exercise,
            rampUpSets: [
              ...rampUpSets,
              {
                id: createId(),
                weight: Math.round((workingWeight * factors[index]) / 5) * 5,
                reps: reps[index],
                completed: false,
              },
            ],
          };
        }),
      };
    });
  }

  function updateRampUpSet(
    exerciseId: string,
    setId: string,
    field: "weight" | "reps",
    value: number
  ) {
    const safeValue = Number.isFinite(value) ? value : 0;
    const validatedValue =
      field === "reps"
        ? Math.max(0, Math.floor(safeValue))
        : Math.max(0, safeValue);

    setSession((previous) =>
      previous
        ? {
            ...previous,
            exercises: previous.exercises.map((exercise) =>
              exercise.id !== exerciseId
                ? exercise
                : {
                    ...exercise,
                    rampUpSets: (exercise.rampUpSets ?? []).map((set) =>
                      set.id === setId
                        ? { ...set, [field]: validatedValue }
                        : set
                    ),
                  }
            ),
          }
        : previous
    );
  }

  function toggleRampUpSet(exerciseId: string, setId: string) {
    setSession((previous) =>
      previous
        ? {
            ...previous,
            exercises: previous.exercises.map((exercise) =>
              exercise.id !== exerciseId
                ? exercise
                : {
                    ...exercise,
                    rampUpSets: (exercise.rampUpSets ?? []).map((set) =>
                      set.id === setId
                        ? { ...set, completed: !set.completed }
                        : set
                    ),
                  }
            ),
          }
        : previous
    );
  }

  function removeRampUpSet(exerciseId: string, setId: string) {
    setSession((previous) =>
      previous
        ? {
            ...previous,
            exercises: previous.exercises.map((exercise) =>
              exercise.id !== exerciseId
                ? exercise
                : {
                    ...exercise,
                    rampUpSets: (exercise.rampUpSets ?? []).filter(
                      (set) => set.id !== setId
                    ),
                  }
            ),
          }
        : previous
    );
  }

  // ----------------------------------------------------------
  // Exercise Management - Add Exercise
  // ----------------------------------------------------------

  function addExercise(
    exerciseDefinitionId: string,
    exerciseName: string
  ) {
    setSession(
      (previous) => {
        if (!previous) {
          return previous;
        }

        // Prevent the same exercise from being added
        // to today's workout more than once.
        const alreadyExists =
          previous.exercises.some(
            (exercise) =>
              exercise
                .exerciseDefinitionId ===
                exerciseDefinitionId ||
              exercise.name
                .toLowerCase() ===
                exerciseName
                  .toLowerCase()
          );

        if (
          alreadyExists
        ) {
          return previous;
        }

        // ----------------------------------------------
        // Exercise Definition
        // ----------------------------------------------

        const definition =
          findExerciseDefinition(
            exerciseLibrary,
            exerciseDefinitionId,
            exerciseName
          );

        // ----------------------------------------------
        // Previous Performance
        // ----------------------------------------------

        const previousExercise =
          getPreviousExercise(
            exerciseDefinitionId,
            exerciseName
          );

        // ----------------------------------------------
        // Starting Weight
        // ----------------------------------------------

        const startingWeight =
          getStartingWeight(
            definition,
            previousExercise
          );

        // ----------------------------------------------
        // Number of Sets
        // ----------------------------------------------

        // Programmed exercises use the Exercise Library's
        // prescribed number of working sets.
        //
        // Custom exercises without programming retain
        // the previous default of three sets.
        const setCount =
          definition?.sets ??
          3;

        // ----------------------------------------------
        // Create Exercise
        // ----------------------------------------------

        const newExercise:
          Exercise = {
          id: createId(),

          exerciseDefinitionId,

          name:
            exerciseName,

          // Because this exercise was added during the workout
          // rather than coming from the workout template, its
          // initial set count becomes today's precription.
          prescribedSetCount:
            setCount,

          sets:
            Array.from(
              {
                length:
                  setCount,
              },
              () => ({
                id: createId(),

                weight:
                  startingWeight,

                // Reps are always entered as the set
                // is actually performed.
                reps: 0,

                completed:
                  false,
              })
            ),
        };

        return {
          ...previous,

          exercises: [
            ...previous.exercises,
            newExercise,
          ],
        };
      }
    );
  }

    // ----------------------------------------------------------
    // Exercise Management - Replace Exercise
    // ----------------------------------------------------------

    function replaceExercise(
  exerciseId: string,
  replacementExerciseDefinitionId: string
): boolean {
  if (!session) {
    return false;
  }

  const definition =
    exerciseLibrary.find(
      (item) =>
        item.id ===
        replacementExerciseDefinitionId
    );

  if (!definition) {
    return false;
  }

  const exerciseExists =
    session.exercises.some(
      (exercise) =>
        exercise.id === exerciseId
    );

  if (!exerciseExists) {
    return false;
  }

  const replacementAlreadyExists =
    session.exercises.some(
      (exercise) =>
        exercise.id !== exerciseId &&
        (
          exercise.exerciseDefinitionId ===
            replacementExerciseDefinitionId ||
          (
            !exercise.exerciseDefinitionId &&
            exercise.name
              .trim()
              .toLowerCase() ===
              definition.name
                .trim()
                .toLowerCase()
          )
        )
    );

  if (replacementAlreadyExists) {
    return false;
  }

  setSession(
    (previous) => {
      if (!previous) {
        return previous;
      }

      const exerciseIndex =
        previous.exercises.findIndex(
          (exercise) =>
            exercise.id === exerciseId
        );

      if (exerciseIndex === -1) {
        return previous;
      }

      const replacementDefinition =
        exerciseLibrary.find(
          (item) =>
            item.id ===
            replacementExerciseDefinitionId
        );

      if (!replacementDefinition) {
        return previous;
      }

      // Preserve this defensive check even though duplicate
      // candidates are filtered before being displayed.
      const alreadyExists =
        previous.exercises.some(
          (exercise) =>
            exercise.id !== exerciseId &&
            (
              exercise.exerciseDefinitionId ===
                replacementExerciseDefinitionId ||
              (
                !exercise.exerciseDefinitionId &&
                exercise.name
                  .trim()
                  .toLowerCase() ===
                  replacementDefinition.name
                    .trim()
                    .toLowerCase()
              )
            )
        );

      if (alreadyExists) {
        return previous;
      }

      const previousExercise =
        getPreviousExercise(
          replacementDefinition.id,
          replacementDefinition.name
        );

      const startingWeight =
        getStartingWeight(
          replacementDefinition,
          previousExercise
        );

      const sourceExercise =
        previous.exercises[
          exerciseIndex
        ];

      const setCount =
        sourceExercise.sets.length;

      const replacementExercise:
        Exercise = {
        // The session exercise ID represents this card's stable
        // position in the active workout. Preserve it across a
        // substitution so expansion and other card-level UI state
        // remain attached to the same slot.
        id: sourceExercise.id,

        exerciseDefinitionId:
          replacementDefinition.id,

        name:
          replacementDefinition.name,

        prescribedSetCount:
          setCount,

        sets:
          Array.from(
            {
              length:
                setCount,
            },
            () => ({
              id: createId(),

              weight:
                startingWeight,

              reps: 0,

              completed:
                false,
            })
          ),
      };

      const exercises = [
        ...previous.exercises,
      ];

      exercises[
        exerciseIndex
      ] = replacementExercise;

      return {
        ...previous,

        exercises,

        restStartedAt:
          undefined,
      };
    }
  );

  setRemovedExercise(
    null
  );

  return true;
}

  // ----------------------------------------------------------
  // Exercise Management - Remove Exercise
  // ----------------------------------------------------------

  function removeExercise(
    exerciseId: string
  ) {
    setSession(
      (previous) => {
        if (!previous) {
          return previous;
        }

        const index =
          previous.exercises.findIndex(
            (exercise) =>
              exercise.id ===
              exerciseId
          );

        if (
          index === -1
        ) {
          return previous;
        }

        // Keep the removed exercise temporarily so the
        // user can undo an accidental removal.
        setRemovedExercise({
          exercise:
            previous.exercises[
              index
            ],

          index,
        });

        return {
          ...previous,

          exercises:
            previous.exercises.filter(
              (exercise) =>
                exercise.id !==
                exerciseId
            ),
        };
      }
    );
  }

  // ----------------------------------------------------------
  // Exercise Management - Undo Remove
  // ----------------------------------------------------------

  function undoRemoveExercise() {
    if (
      !removedExercise
    ) {
      return;
    }

    setSession(
      (previous) => {
        if (!previous) {
          return previous;
        }

        const exercises = [
          ...previous.exercises,
        ];

        exercises.splice(
          removedExercise.index,
          0,
          removedExercise.exercise
        );

        return {
          ...previous,
          exercises,
        };
      }
    );

    setRemovedExercise(
      null
    );
  }

  // ----------------------------------------------------------
  // Workout Lifecycle - Shorten Active Workout
  // ----------------------------------------------------------

  function shortenWorkout() {
    setSession(
      (previous) => {
        if (
          !previous ||
          previous.variantType !== "FullGym"
        ) {
          return previous;
        }

        const shortVariant =
          strengthWorkoutVariants.find(
            (variant) =>
              variant.sourceStrengthWorkout ===
                previous.workoutType &&
              variant.variantType ===
                "ShortGym"
          );

        if (!shortVariant) {
          return previous;
        }

        const shortPrescription =
          new Map(
            shortVariant.exercises.map(
              (exercise) => [
                exercise.exerciseDefinitionId,
                exercise.sets,
              ]
            )
          );

        const exercises =
          previous.exercises.flatMap(
            (exercise) => {
              const completedSets =
                exercise.sets.filter(
                  (set) =>
                    set.completed
                );

              const shortSetCount =
                exercise.exerciseDefinitionId
                  ? shortPrescription.get(
                      exercise.exerciseDefinitionId
                    )
                  : undefined;

              // Exercises that are not part of the Short Gym
              // prescription are removed only when no work has
              // already been completed on them.
              if (
                shortSetCount === undefined
              ) {
                if (
                  completedSets.length === 0
                ) {
                  return [];
                }

                return [
                  {
                    ...exercise,

                    // The exercise is not part of Short Gym,
                    // so preserve only work that was already
                    // performed. Do not leave unfinished sets
                    // that would imply the user should continue it.
                    prescribedSetCount:
                      completedSets.length,

                    sets:
                      completedSets,
                  },
                ];
              }

              // Never remove completed work. If the Short Gym
              // prescription calls for fewer sets than have
              // already been completed, retain every completed set.
              const retainedSetCount =
                Math.max(
                  shortSetCount,
                  completedSets.length
                );

              return [
                {
                  ...exercise,

                  prescribedSetCount:
                    retainedSetCount,

                  sets:
                    exercise.sets.slice(
                      0,
                      retainedSetCount
                    ),
                },
              ];
            }
          );

        return {
          ...previous,

          variantType:
            "ShortGym",

          variantId:
            shortVariant.id,

          variantLabel:
            shortVariant.label,

          exercises,

          restStartedAt:
            undefined,
        };
      }
    );

    setRemovedExercise(
      null
    );
  }

  // ----------------------------------------------------------
  // Workout Lifecycle - Cancel Workout
  // ----------------------------------------------------------

  function cancelWorkout() {
    // Remove the active workout from local and cloud storage.
    // Nothing is written to workout history.
    localStorage.removeItem(
      STORAGE_KEY
    );

    // Clear the active workout from React state.
    setSession(null);

    // Clear any temporary workout state.
    setRemovedExercise(null);

    // Make sure the completed-workout screen
    // is not shown.
    setFinished(false);

    setFinishValidationError(
      null
    );
  }

// ----------------------------------------------------------
// Workout Lifecycle - Dismiss Finished Workout
// ----------------------------------------------------------

function dismissFinishedWorkout() {
  // The completed workout has already been saved to history
  // and removed from active-workout storage by finishWorkout().
  //
  // Clear the in-memory session so the Workout page returns
  // to the normal "Start a Workout" screen.
  setSession(null);

  setFinished(false);

  setFinishValidationError(
    null
  );

  setRemovedExercise(null);
}

  // ----------------------------------------------------------
  // Workout Lifecycle - Finish Workout
  // ----------------------------------------------------------

  function finishWorkout() {
    if (!session) {
      return;
    }

    // --------------------------------------------------------
    // Completion Validation
    // --------------------------------------------------------
    //
    // A strength workout is only considered complete after
    // at least one working set has actually been marked done.
    //
    // This protects workout history and training-plan
    // adherence from empty sessions that were started and
    // immediately finished.

    const completedSetCount =
      session.exercises.reduce(
        (
          total,
          exercise
        ) =>
          total +
          exercise.sets.filter(
            (set) =>
              set.completed
          ).length,
        0
      );

    if (
      completedSetCount === 0
    ) {
      setFinishValidationError(
        "Complete at least one working set before finishing this workout. If you did not train, cancel the workout instead."
      );

      return;
    }

    setFinishValidationError(
      null
    );

    // Only completed sets count as actual workout performance.
    //
    // This prevents planned/edited sets that were never
    // performed from replacing the user's previous results.
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

        // Don't save exercises where no sets were completed.
        .filter(
          (exercise) =>
            exercise.sets.length >
            0
        );

    // Create the permanent history version of the workout.
    const completedWorkout:
      WorkoutSession = {
      ...session,

      completedAt:
        new Date()
          .toISOString(),

      restStartedAt:
        undefined,

      exercises:
        completedExercises,
    };

    // Add the newly completed workout to the beginning of
    // history so the newest workout stays first.
    const updatedHistory = [
      completedWorkout,
      ...workoutHistory,
    ];

    // Save completed workout history permanently.
    setFitnessOsStorage(
      HISTORY_STORAGE_KEY,
      JSON.stringify(
        updatedHistory
      )
    );

    // Record adherence to the scheduled strength activity.
    //
    // This happens only after the completed workout has been
    // successfully written to workout history.
    recordScheduledStrengthCompletion(
      completedWorkout
    );

    // Keep React state synchronized with localStorage.
    setWorkoutHistory(
      updatedHistory
    );

    // The workout is no longer active.
    localStorage.removeItem(
      STORAGE_KEY
    );

    setFinished(true);
  }

  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  function completeWarmup() {
    setSession((previous) =>
      previous
        ? {
            ...previous,
            warmupCompletedAt: new Date().toISOString(),
            warmupSkippedAt: undefined,
          }
        : previous
    );
  }

  function skipWarmup() {
    setSession((previous) =>
      previous
        ? {
            ...previous,
            warmupCompletedAt: undefined,
            warmupSkippedAt: new Date().toISOString(),
          }
        : previous
    );
  }

  function resetWarmup() {
    setSession((previous) =>
      previous
        ? {
            ...previous,
            warmupCompletedAt: undefined,
            warmupSkippedAt: undefined,
          }
        : previous
    );
  }

  return {
    session,

    // The workout screen is ready only after:
    //
    // 1. Active workout/history have loaded
    // 2. Workout templates have loaded
    // 3. Exercise Library has loaded
    //
    // This prevents a workout from starting before the
    // progression definitions are available.
    loaded:
      loaded &&
      templatesLoaded &&
      exerciseLibraryLoaded,

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
  };
}
