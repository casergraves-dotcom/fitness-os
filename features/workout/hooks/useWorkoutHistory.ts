"use client";

// ============================================================
// Imports
// ============================================================

import { useEffect, useState } from "react";

import type { WorkoutSession } from "../types";

// ============================================================
// Storage
// ============================================================

const HISTORY_STORAGE_KEY =
  "fitness-os-workout-history";

// ============================================================
// Workout History Hook
// ============================================================

export function useWorkoutHistory() {
  // ----------------------------------------------------------
  // State
  // ----------------------------------------------------------

  const [history, setHistory] =
    useState<WorkoutSession[]>([]);

  const [loaded, setLoaded] =
    useState(false);

  // ----------------------------------------------------------
  // Load Workout History
  // ----------------------------------------------------------

  useEffect(() => {
    const savedHistory =
      localStorage.getItem(
        HISTORY_STORAGE_KEY
      );

    if (savedHistory) {
      try {
        const parsedHistory: WorkoutSession[] =
          JSON.parse(savedHistory);

        setHistory(parsedHistory);
      } catch {
        // Remove corrupted history so the app can
        // continue loading normally.
        localStorage.removeItem(
          HISTORY_STORAGE_KEY
        );
      }
    }

    setLoaded(true);
  }, []);

  // ----------------------------------------------------------
  // Delete Workout
  // ----------------------------------------------------------

  function deleteWorkout(
    workoutId: string
  ) {
    setHistory((previous) => {
      const updatedHistory =
        previous.filter(
          (workout) =>
            workout.id !== workoutId
        );

      // Keep localStorage synchronized with React state.
      localStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(updatedHistory)
      );

      return updatedHistory;
    });
  }

  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  return {
    history,
    loaded,
    deleteWorkout,
  };
}