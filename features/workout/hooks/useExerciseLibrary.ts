"use client";

// ============================================================
// Imports
// ============================================================

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  exerciseLibrary as builtInExercises,
} from "../exerciseLibrary";

import type {
  Exercise,
  ExerciseCategory,
  ExerciseDefinition,
  WorkoutSession,
} from "../types";

// ============================================================
// Storage
// ============================================================

const CUSTOM_EXERCISE_STORAGE_KEY =
  "fitness-os-custom-exercises";

const TEMPLATE_STORAGE_KEY =
  "fitness-os-workout-templates";

const ACTIVE_WORKOUT_STORAGE_KEY =
  "fitness-os-active-workout";

// ============================================================
// Types
// ============================================================

// Stored strength workout templates.
type StoredWorkoutTemplates = {
  Push: Exercise[];
  Pull: Exercise[];
  Legs: Exercise[];
};

// ============================================================
// Helpers
// ============================================================

function createId() {
  return `custom-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

// ============================================================
// Exercise Library Hook
// ============================================================

export function useExerciseLibrary() {
  // ----------------------------------------------------------
  // State
  // ----------------------------------------------------------

  // Built-in exercises remain in exerciseLibrary.ts.
  // We only save exercises created by the user.
  const [
    customExercises,
    setCustomExercises,
  ] = useState<ExerciseDefinition[]>([]);

  const [
    loaded,
    setLoaded,
  ] = useState(false);

  // ----------------------------------------------------------
  // Load Custom Exercises
  // ----------------------------------------------------------

  useEffect(() => {
    const savedExercises =
      localStorage.getItem(
        CUSTOM_EXERCISE_STORAGE_KEY
      );

    if (savedExercises) {
      try {
        const parsedExercises: ExerciseDefinition[] =
          JSON.parse(
            savedExercises
          );

        setCustomExercises(
          parsedExercises
        );
      } catch {
        // If the saved data becomes corrupted,
        // remove it rather than breaking the app.
        localStorage.removeItem(
          CUSTOM_EXERCISE_STORAGE_KEY
        );
      }
    }

    setLoaded(true);
  }, []);

  // ----------------------------------------------------------
  // Combined Exercise Library
  // ----------------------------------------------------------

  // Every component using this hook gets one combined
  // library containing built-in and custom exercises.
  const exercises =
    useMemo(
      () => [
        ...builtInExercises,
        ...customExercises,
      ],
      [customExercises]
    );

  // ----------------------------------------------------------
  // Save Custom Exercises
  // ----------------------------------------------------------

  function saveCustomExercises(
    updatedExercises: ExerciseDefinition[]
  ) {
    setCustomExercises(
      updatedExercises
    );

    localStorage.setItem(
      CUSTOM_EXERCISE_STORAGE_KEY,
      JSON.stringify(
        updatedExercises
      )
    );
  }

  // ----------------------------------------------------------
  // Add Custom Exercise
  // ----------------------------------------------------------

  function addCustomExercise(
    name: string,
    category: ExerciseCategory
  ) {
    const cleanedName =
      name.trim();

    // Don't create blank exercises.
    if (!cleanedName) {
      return null;
    }

    // Prevent duplicates across both built-in
    // and custom exercises.
    const alreadyExists =
      exercises.some(
        (exercise) =>
          exercise.name
            .toLowerCase() ===
          cleanedName.toLowerCase()
      );

    if (alreadyExists) {
      return null;
    }

    const newExercise: ExerciseDefinition = {
      id: createId(),
      name: cleanedName,
      category,
      custom: true,
    };

    saveCustomExercises([
      ...customExercises,
      newExercise,
    ]);

    return newExercise;
  }

  // ----------------------------------------------------------
  // Delete Custom Exercise
  // ----------------------------------------------------------

  function deleteCustomExercise(
    exerciseId: string
  ) {
    // Only custom exercises are stored here,
    // so built-in exercises cannot be deleted.
    const updatedExercises =
      customExercises.filter(
        (exercise) =>
          exercise.id !== exerciseId
      );

    saveCustomExercises(
      updatedExercises
    );
  }

  // ----------------------------------------------------------
  // Update Exercise Name In Templates
  // ----------------------------------------------------------

  function updateExerciseNameInTemplates(
    exerciseDefinitionId: string,
    oldName: string,
    newName: string
  ) {
    const savedTemplates =
      localStorage.getItem(
        TEMPLATE_STORAGE_KEY
      );

    // The user may not have customized their
    // workout templates yet.
    if (!savedTemplates) {
      return;
    }

    try {
      const templates: StoredWorkoutTemplates =
        JSON.parse(
          savedTemplates
        );

      // ------------------------------------------------------
      // Update One Workout Template
      // ------------------------------------------------------

      function updateWorkout(
        workoutExercises: Exercise[]
      ) {
        return workoutExercises.map(
          (exercise) => {
            // ----------------------------------------------
            // Permanent ID Match
            // ----------------------------------------------

            // Newer templates contain the permanent
            // Exercise Library ID.
            if (
              exercise.exerciseDefinitionId ===
              exerciseDefinitionId
            ) {
              return {
                ...exercise,
                name: newName,
              };
            }

            // ----------------------------------------------
            // Legacy Name Match
            // ----------------------------------------------

            // Older templates may not have a permanent ID.
            // Match the old name and migrate the exercise
            // to the permanent ID while we're here.
            if (
              !exercise.exerciseDefinitionId &&
              exercise.name.toLowerCase() ===
                oldName.toLowerCase()
            ) {
              return {
                ...exercise,
                exerciseDefinitionId,
                name: newName,
              };
            }

            return exercise;
          }
        );
      }

      // ------------------------------------------------------
      // Update All Strength Templates
      // ------------------------------------------------------

      const updatedTemplates: StoredWorkoutTemplates = {
        Push: updateWorkout(
          templates.Push
        ),

        Pull: updateWorkout(
          templates.Pull
        ),

        Legs: updateWorkout(
          templates.Legs
        ),
      };

      localStorage.setItem(
        TEMPLATE_STORAGE_KEY,
        JSON.stringify(
          updatedTemplates
        )
      );
    } catch {
      // Don't overwrite the templates if their saved
      // data cannot be read safely.
      return;
    }
  }

  // ----------------------------------------------------------
  // Update Exercise Name In Active Workout
  // ----------------------------------------------------------

  function updateExerciseNameInActiveWorkout(
    exerciseDefinitionId: string,
    oldName: string,
    newName: string
  ) {
    const savedWorkout =
      localStorage.getItem(
        ACTIVE_WORKOUT_STORAGE_KEY
      );

    // There may not currently be an active workout.
    if (!savedWorkout) {
      return;
    }

    try {
      const workout: WorkoutSession =
        JSON.parse(
          savedWorkout
        );

      // Update only the matching exercise.
      //
      // Sets, weights, reps, completion state,
      // workout timing, and everything else remain
      // exactly as they were.
      const updatedExercises =
        workout.exercises.map(
          (exercise) => {
            // ----------------------------------------------
            // Permanent ID Match
            // ----------------------------------------------

            if (
              exercise.exerciseDefinitionId ===
              exerciseDefinitionId
            ) {
              return {
                ...exercise,
                name: newName,
              };
            }

            // ----------------------------------------------
            // Legacy Name Match
            // ----------------------------------------------

            // Older active workouts may not have the
            // permanent library ID yet.
            //
            // Match the old name and migrate it while
            // updating the display name.
            if (
              !exercise.exerciseDefinitionId &&
              exercise.name.toLowerCase() ===
                oldName.toLowerCase()
            ) {
              return {
                ...exercise,
                exerciseDefinitionId,
                name: newName,
              };
            }

            return exercise;
          }
        );

      const updatedWorkout: WorkoutSession = {
        ...workout,
        exercises: updatedExercises,
      };

      localStorage.setItem(
        ACTIVE_WORKOUT_STORAGE_KEY,
        JSON.stringify(
          updatedWorkout
        )
      );
    } catch {
      // Leave the active workout untouched if its
      // saved data cannot be read safely.
      return;
    }
  }

  // ----------------------------------------------------------
  // Update Custom Exercise
  // ----------------------------------------------------------

  function updateCustomExercise(
    exerciseId: string,
    name: string,
    category: ExerciseCategory
  ) {
    const cleanedName =
      name.trim();

    // Don't allow an exercise to have a blank name.
    if (!cleanedName) {
      return false;
    }

    // Find the custom exercise being edited.
    const existingExercise =
      customExercises.find(
        (exercise) =>
          exercise.id === exerciseId
      );

    // Built-in exercises cannot be edited through
    // this function.
    if (!existingExercise) {
      return false;
    }

    // Prevent renaming an exercise to the name
    // of another built-in or custom exercise.
    //
    // Ignore the exercise currently being edited
    // when checking for duplicates.
    const duplicateExists =
      exercises.some(
        (exercise) =>
          exercise.id !== exerciseId &&
          exercise.name
            .toLowerCase() ===
            cleanedName.toLowerCase()
      );

    if (duplicateExists) {
      return false;
    }

    // --------------------------------------------------------
    // Update Exercise Library
    // --------------------------------------------------------

    const updatedExercises =
      customExercises.map(
        (exercise) =>
          exercise.id !== exerciseId
            ? exercise
            : {
                ...exercise,
                name: cleanedName,
                category,
              }
      );

    saveCustomExercises(
      updatedExercises
    );

    // --------------------------------------------------------
    // Propagate Rename
    // --------------------------------------------------------

    // Category changes only affect the Exercise Library.
    //
    // Name changes need to propagate to:
    //
    // 1. Push / Pull / Legs workout templates
    // 2. The currently active workout
    //
    // Completed workout history is intentionally NOT
    // rewritten.
    if (
      existingExercise.name !==
      cleanedName
    ) {
      updateExerciseNameInTemplates(
        exerciseId,
        existingExercise.name,
        cleanedName
      );

      updateExerciseNameInActiveWorkout(
        exerciseId,
        existingExercise.name,
        cleanedName
      );
    }

    return true;
  }

  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  return {
    exercises,
    customExercises,
    loaded,

    addCustomExercise,
    deleteCustomExercise,
    updateCustomExercise,
  };
}