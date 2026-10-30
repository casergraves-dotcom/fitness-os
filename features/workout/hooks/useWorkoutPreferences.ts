"use client";

import { useMemo, useSyncExternalStore } from "react";

import { setFitnessOsStorage } from "@/lib/storage/fitnessOsStorage";
import { FITNESS_OS_STORAGE_KEYS } from "@/lib/storage/fitnessOsStorageKeys";
import {
  DEFAULT_WORKOUT_PREFERENCES,
  normalizeWorkoutPreferences,
} from "../workoutPreferences";
import type { WorkoutPreferences } from "../workoutPreferences";

const PREFERENCES_CHANGED_EVENT =
  "fitness-os-workout-preferences-changed";
const SERVER_SNAPSHOT = "__server__";
const EMPTY_SNAPSHOT = "__empty__";

function subscribe(onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === FITNESS_OS_STORAGE_KEYS.workoutPreferences) {
      onStoreChange();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(PREFERENCES_CHANGED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(PREFERENCES_CHANGED_EVENT, onStoreChange);
  };
}

function getClientSnapshot() {
  return localStorage.getItem(
    FITNESS_OS_STORAGE_KEYS.workoutPreferences
  ) ?? EMPTY_SNAPSHOT;
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

export function useWorkoutPreferences() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );
  const loaded = snapshot !== SERVER_SNAPSHOT;
  const preferences = useMemo(() => {
    if (snapshot === SERVER_SNAPSHOT || snapshot === EMPTY_SNAPSHOT) {
      return DEFAULT_WORKOUT_PREFERENCES;
    }

    try {
      return normalizeWorkoutPreferences(JSON.parse(snapshot));
    } catch {
      return DEFAULT_WORKOUT_PREFERENCES;
    }
  }, [snapshot]);

  function savePreferences(
    next: Omit<WorkoutPreferences, "updatedAt">
  ) {
    const saved = normalizeWorkoutPreferences({
      ...next,
      updatedAt: new Date().toISOString(),
    });

    setFitnessOsStorage(
      FITNESS_OS_STORAGE_KEYS.workoutPreferences,
      JSON.stringify(saved)
    );
    window.dispatchEvent(new Event(PREFERENCES_CHANGED_EVENT));
  }

  return { preferences, loaded, savePreferences };
}
