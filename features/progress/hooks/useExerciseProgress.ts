"use client";

// ============================================================
// Imports
// ============================================================

import { useMemo } from "react";

import { useWorkoutHistory } from "../../workout/hooks/useWorkoutHistory";

// ============================================================
// Types
// ============================================================

export interface ExerciseProgressEntry {
  workoutId: string;
  date: string;
  weight: number;
  reps: number;
  estimatedOneRepMax: number;
}

// ============================================================
// Exercise Progress Hook
// ============================================================

export function useExerciseProgress(
  exerciseName?: string
) {
  const {
    history,
    loaded,
  } = useWorkoutHistory();

  // ----------------------------------------------------------
  // Available Exercises
  // ----------------------------------------------------------

  // Build a unique list of every exercise that has actually
  // appeared in completed workout history.
  const exercises = useMemo(() => {
    const names = new Set<string>();

    history.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        names.add(exercise.name);
      });
    });

    return Array.from(names).sort();
  }, [history]);

  // ----------------------------------------------------------
  // Exercise Performance History
  // ----------------------------------------------------------

  const progress = useMemo(() => {
    if (!exerciseName) {
      return [];
    }

    const entries: ExerciseProgressEntry[] = [];

    history.forEach((workout) => {
      const exercise =
        workout.exercises.find(
          (item) =>
            item.name === exerciseName
        );

      if (!exercise) {
        return;
      }

      // Find the strongest set from this workout using
      // estimated 1-rep max.
      //
      // Epley formula:
      // 1RM = weight × (1 + reps / 30)
      const strongestSet =
        exercise.sets.reduce<
          | {
              weight: number;
              reps: number;
              estimatedOneRepMax: number;
            }
          | undefined
        >((best, set) => {
          const estimatedOneRepMax =
            set.weight *
            (1 + set.reps / 30);

          if (
            !best ||
            estimatedOneRepMax >
              best.estimatedOneRepMax
          ) {
            return {
              weight: set.weight,
              reps: set.reps,
              estimatedOneRepMax,
            };
          }

          return best;
        }, undefined);

      if (!strongestSet) {
        return;
      }

      entries.push({
        workoutId: workout.id,
        date:
          workout.completedAt ??
          workout.startedAt,

        weight: strongestSet.weight,
        reps: strongestSet.reps,

        estimatedOneRepMax:
          strongestSet.estimatedOneRepMax,
      });
    });

    // Workout history is stored newest-first.
    // Progress is easier to read oldest-first.
    return entries.reverse();
  }, [history, exerciseName]);

  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  return {
    loaded,
    exercises,
    progress,
  };
}