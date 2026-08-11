"use client";

// ============================================================
// Imports
// ============================================================

import {
  useEffect,
  useState,
} from "react";

import {
  workoutTemplates as defaultTemplates,
} from "../data";

import {
  useExerciseLibrary,
} from "./useExerciseLibrary";

import type {
  Exercise,
  StrengthWorkoutType,
} from "../types";

import {
  removeFitnessOsStorage,
  setFitnessOsStorage,
} from "@/lib/storage/fitnessOsStorage";

// ============================================================
// Types
// ============================================================

// Only the current strength program belongs in editable
// workout templates.
//
// Legacy Push / Pull / Legs sessions remain supported by
// WorkoutSession history, but they are no longer active
// strength templates.
export type WorkoutTemplates = Record<
  StrengthWorkoutType,
  Exercise[]
>;

// ============================================================
// Storage
// ============================================================

const TEMPLATE_STORAGE_KEY =
  "fitness-os-workout-templates";

// ============================================================
// Helpers
// ============================================================

function createId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

// ------------------------------------------------------------
// Clone Templates
// ------------------------------------------------------------

function cloneTemplates(
  templates: WorkoutTemplates
): WorkoutTemplates {
  // Make a deep enough copy that editing a saved template
  // never mutates the defaults imported from data.ts.
  return {
    "Gym A": templates["Gym A"].map(
      (exercise) => ({
        ...exercise,

        sets: exercise.sets.map(
          (set) => ({
            ...set,
          })
        ),
      })
    ),

    "Gym B": templates["Gym B"].map(
      (exercise) => ({
        ...exercise,

        sets: exercise.sets.map(
          (set) => ({
            ...set,
          })
        ),
      })
    ),

    "Gym C": templates["Gym C"].map(
      (exercise) => ({
        ...exercise,

        sets: exercise.sets.map(
          (set) => ({
            ...set,
          })
        ),
      })
    ),
  };
}

// ------------------------------------------------------------
// Validate Saved Templates
// ------------------------------------------------------------

function isCurrentWorkoutTemplates(
  value: unknown
): value is WorkoutTemplates {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const candidate =
    value as Partial<
      Record<
        StrengthWorkoutType,
        unknown
      >
    >;

  return (
    Array.isArray(
      candidate["Gym A"]
    ) &&
    Array.isArray(
      candidate["Gym B"]
    ) &&
    Array.isArray(
      candidate["Gym C"]
    )
  );
}

// ============================================================
// Workout Templates Hook
// ============================================================

export function useWorkoutTemplates() {
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
    templates,
    setTemplates,
  ] = useState<WorkoutTemplates>(
    () =>
      cloneTemplates(
        defaultTemplates as WorkoutTemplates
      )
  );

  const [
    templatesLoaded,
    setTemplatesLoaded,
  ] = useState(false);

  // ----------------------------------------------------------
  // Load Templates
  // ----------------------------------------------------------

  useEffect(() => {
    const savedTemplates =
      localStorage.getItem(
        TEMPLATE_STORAGE_KEY
      );

    if (savedTemplates) {
      try {
        const parsedTemplates:
          unknown =
          JSON.parse(
            savedTemplates
          );

        // Old versions of Fitness OS stored:
        //
        // Push / Pull / Legs
        //
        // Do not load those into the new Gym A/B/C template
        // system. Historical workout sessions are unaffected;
        // this only resets the editable template configuration
        // to the new built-in program.
        if (
          isCurrentWorkoutTemplates(
            parsedTemplates
          )
        ) {
          setTemplates(
            cloneTemplates(
              parsedTemplates
            )
          );
        } else {
          localStorage.removeItem(
            TEMPLATE_STORAGE_KEY
          );
        }
      } catch {
        // If saved template data is corrupted, remove it
        // and continue using the built-in defaults.
        localStorage.removeItem(
          TEMPLATE_STORAGE_KEY
        );
      }
    }

    setTemplatesLoaded(true);
  }, []);

  // ----------------------------------------------------------
  // Save Templates
  // ----------------------------------------------------------

  function saveTemplates(
    updatedTemplates: WorkoutTemplates
  ) {
    setTemplates(
      updatedTemplates
    );

    setFitnessOsStorage(
      TEMPLATE_STORAGE_KEY,
      JSON.stringify(
        updatedTemplates
      )
    );
  }

  // ----------------------------------------------------------
  // Add Exercise
  // ----------------------------------------------------------

  function addExercise(
    workoutType: StrengthWorkoutType,
    exerciseDefinitionId: string,
    exerciseName: string
  ) {
    // Prevent the same library exercise from appearing twice
    // in the same workout template.
    //
    // Older template exercises may not have a permanent
    // definition ID yet, so also compare names as a
    // backward-compatible fallback.
    const alreadyExists =
      templates[
        workoutType
      ].some(
        (exercise) =>
          exercise.exerciseDefinitionId ===
            exerciseDefinitionId ||
          exercise.name.toLowerCase() ===
            exerciseName.toLowerCase()
      );

    if (alreadyExists) {
      return;
    }

    // --------------------------------------------------------
    // Exercise Library Definition
    // --------------------------------------------------------

    const definition =
      exerciseLibrary.find(
        (exercise) =>
          exercise.id ===
          exerciseDefinitionId
      );

    // --------------------------------------------------------
    // Default Set Count
    // --------------------------------------------------------

    // The Exercise Library supplies the INITIAL set count.
    //
    // If the user later changes the template's set count,
    // that template configuration becomes authoritative.
    //
    // Custom or legacy exercises without programming continue
    // to default to three sets.
    const setCount =
      definition?.sets ??
      3;

    // --------------------------------------------------------
    // Create Template Exercise
    // --------------------------------------------------------

    const newExercise: Exercise = {
      // Unique ID for this particular template entry.
      id: createId(),

      // Permanent reference back to the Exercise Library.
      exerciseDefinitionId,

      // Keep the name on the template for display and
      // backward compatibility.
      name: exerciseName,

      // Store the number of sets this template prescribes.
      prescribedSetCount:
        setCount,

      // Create the programmed number of blank working sets.
      sets: Array.from(
        {
          length: setCount,
        },
        () => ({
          id: createId(),
          weight: 0,
          reps: 0,
          completed: false,
        })
      ),
    };

    const updatedTemplates: WorkoutTemplates = {
      ...templates,

      [workoutType]: [
        ...templates[
          workoutType
        ],
        newExercise,
      ],
    };

    saveTemplates(
      updatedTemplates
    );
  }

  // ----------------------------------------------------------
  // Remove Exercise
  // ----------------------------------------------------------

  function removeExercise(
    workoutType: StrengthWorkoutType,
    exerciseId: string
  ) {
    const updatedTemplates: WorkoutTemplates = {
      ...templates,

      [workoutType]:
        templates[
          workoutType
        ].filter(
          (exercise) =>
            exercise.id !==
            exerciseId
        ),
    };

    saveTemplates(
      updatedTemplates
    );
  }

  // ----------------------------------------------------------
  // Move Exercise
  // ----------------------------------------------------------

  function moveExercise(
    workoutType: StrengthWorkoutType,
    exerciseId: string,
    direction: "up" | "down"
  ) {
    const exercises = [
      ...templates[
        workoutType
      ],
    ];

    const currentIndex =
      exercises.findIndex(
        (exercise) =>
          exercise.id ===
          exerciseId
      );

    if (currentIndex === -1) {
      return;
    }

    const newIndex =
      direction === "up"
        ? currentIndex - 1
        : currentIndex + 1;

    // Don't allow an exercise to move outside
    // the workout list.
    if (
      newIndex < 0 ||
      newIndex >=
        exercises.length
    ) {
      return;
    }

    // Swap the exercise with the one immediately
    // before or after it.
    [
      exercises[currentIndex],
      exercises[newIndex],
    ] = [
      exercises[newIndex],
      exercises[currentIndex],
    ];

    const updatedTemplates: WorkoutTemplates = {
      ...templates,

      [workoutType]:
        exercises,
    };

    saveTemplates(
      updatedTemplates
    );
  }

  // ----------------------------------------------------------
  // Update Exercise Set Count
  // ----------------------------------------------------------

  function updateExerciseSetCount(
    workoutType: StrengthWorkoutType,
    exerciseId: string,
    newSetCount: number
  ) {
    // Keep the template between 1 and 10 sets.
    const setCount =
      Math.max(
        1,
        Math.min(
          10,
          newSetCount
        )
      );

    const updatedTemplates: WorkoutTemplates = {
      ...templates,

      [workoutType]:
        templates[
          workoutType
        ].map(
          (exercise) => {
            if (
              exercise.id !==
              exerciseId
            ) {
              return exercise;
            }

            // ----------------------------------------------
            // Reduce Number of Sets
            // ----------------------------------------------

            if (
              setCount <
              exercise.sets.length
            ) {
              return {
                ...exercise,

                prescribedSetCount:
                  setCount,

                sets:
                  exercise.sets.slice(
                    0,
                    setCount
                  ),
              };
            }

            // ----------------------------------------------
            // Increase Number of Sets
            // ----------------------------------------------

            if (
              setCount >
              exercise.sets.length
            ) {
              const numberOfNewSets =
                setCount -
                exercise.sets.length;

              const additionalSets =
                Array.from(
                  {
                    length:
                      numberOfNewSets,
                  },
                  () => ({
                    id: createId(),

                    // These are template defaults.
                    // Today's recommended load will be
                    // populated when the workout starts.
                    weight: 0,
                    reps: 0,
                    completed: false,
                  })
                );

              return {
                ...exercise,

                prescribedSetCount:
                  setCount,

                sets: [
                  ...exercise.sets,
                  ...additionalSets,
                ],
              };
            }

            // Set count did not change.
            return {
              ...exercise,
              prescribedSetCount:
                setCount,
            };
          }
        ),
    };

    saveTemplates(
      updatedTemplates
    );
  }

  // ----------------------------------------------------------
  // Reset Templates
  // ----------------------------------------------------------

  function resetTemplates() {
    const defaults =
      cloneTemplates(
        defaultTemplates as WorkoutTemplates
      );

    setTemplates(
      defaults
    );

    removeFitnessOsStorage(
      TEMPLATE_STORAGE_KEY
    );
  }

  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  return {
    templates,

    // Template editing is ready once both the saved templates
    // and Exercise Library are available.
    loaded:
      templatesLoaded &&
      exerciseLibraryLoaded,

    saveTemplates,
    addExercise,
    removeExercise,
    moveExercise,
    updateExerciseSetCount,
    resetTemplates,
  };
}