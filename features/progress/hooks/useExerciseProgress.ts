"use client";

import { useMemo } from "react";

import { useWorkoutHistory } from "../../workout/hooks/useWorkoutHistory";
import { getExerciseDisplayName } from "../../workout/exerciseLibrary";

export interface ExerciseProgressEntry {
  workoutId: string;
  date: string;
  exerciseDefinitionId?: string;
  exerciseName: string;
  weight: number;
  reps: number;
  estimatedOneRepMax: number;
}

function estimateOneRepMax(weight: number, reps: number) {
  if (weight <= 0 || reps <= 0) {
    return 0;
  }

  // Epley estimate. Capping reps prevents high-rep endurance sets
  // from producing misleading strength estimates.
  const cappedReps = Math.min(reps, 30);
  return weight * (1 + cappedReps / 30);
}

function normalizeExerciseName(exerciseName: string) {
  return exerciseName.trim().toLowerCase();
}

export function useExerciseProgress(selectedExercise?: string) {
  const {
    history,
    loaded,
  } = useWorkoutHistory();

  const exerciseOptions = useMemo(() => {
    const byName = new Map<
      string,
      {
        exerciseDefinitionId?: string;
        name: string;
      }
    >();

    for (const workout of history) {
      for (const exercise of workout.exercises) {
        const hasWeightedCompletedSet = exercise.sets.some(
          (set) => set.completed && set.weight > 0 && set.reps > 0
        );

        if (!hasWeightedCompletedSet) {
          continue;
        }

        const displayName = getExerciseDisplayName(
          exercise.exerciseDefinitionId,
          exercise.name
        );
        const normalizedName = exercise.exerciseDefinitionId
          ? `id:${exercise.exerciseDefinitionId}`
          : normalizeExerciseName(displayName);
        const existing = byName.get(normalizedName);

        // Deduplicate legacy name-only history and newer permanent-ID
        // history. Prefer the permanent ID when one is available.
        if (!existing || (!existing.exerciseDefinitionId && exercise.exerciseDefinitionId)) {
          byName.set(normalizedName, {
            exerciseDefinitionId: exercise.exerciseDefinitionId,
            name: displayName,
          });
        }
      }
    }

    return Array.from(byName.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [history]);

  // Keep the existing component contract: selector values are labels.
  const exercises = useMemo(
    () => exerciseOptions.map((exercise) => exercise.name),
    [exerciseOptions]
  );

  const selectedOption = useMemo(
    () =>
      exerciseOptions.find(
        (exercise) => exercise.name === selectedExercise
      ),
    [exerciseOptions, selectedExercise]
  );

  const progress = useMemo<ExerciseProgressEntry[]>(() => {
    if (!selectedOption) {
      return [];
    }

    const entries: ExerciseProgressEntry[] = [];

    for (const workout of history) {
      const exercise = workout.exercises.find(
        (item) => {
          if (
            selectedOption.exerciseDefinitionId &&
            item.exerciseDefinitionId
          ) {
            return (
              selectedOption.exerciseDefinitionId ===
              item.exerciseDefinitionId
            );
          }

          // Older history entries predate permanent IDs.
          return (
            normalizeExerciseName(item.name) ===
            normalizeExerciseName(selectedOption.name)
          );
        }
      );

      if (!exercise) {
        continue;
      }

      const completedSets = exercise.sets.filter(
        (set) => set.completed && set.weight > 0 && set.reps > 0
      );

      if (completedSets.length === 0) {
        continue;
      }

      // Represent each workout with its strongest completed set.
      const bestSet = completedSets.reduce((best, set) =>
        estimateOneRepMax(set.weight, set.reps) >
        estimateOneRepMax(best.weight, best.reps)
          ? set
          : best
      );

      entries.push({
        workoutId: workout.id,
        date: workout.completedAt ?? workout.startedAt,
        exerciseDefinitionId: exercise.exerciseDefinitionId,
        exerciseName: getExerciseDisplayName(
          exercise.exerciseDefinitionId,
          exercise.name
        ),
        weight: bestSet.weight,
        reps: bestSet.reps,
        estimatedOneRepMax: estimateOneRepMax(
          bestSet.weight,
          bestSet.reps
        ),
      });
    }

    return entries.sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [history, selectedOption]);

  return {
    loaded,
    exercises,
    progress,
  };
}
