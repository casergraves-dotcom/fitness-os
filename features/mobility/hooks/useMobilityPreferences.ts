"use client";

import { useEffect, useState } from "react";

import { setFitnessOsStorage } from "@/lib/storage/fitnessOsStorage";
import { FITNESS_OS_STORAGE_KEYS } from "@/lib/storage/fitnessOsStorageKeys";
import type { MobilityRoutineId } from "@/features/workout/types";
import { mobilityRoutines } from "../mobilityLibrary";

interface MobilityPreferences {
  favoriteRoutineIds: MobilityRoutineId[];
  updatedAt: string;
}

const DEFAULT_PREFERENCES: MobilityPreferences = {
  favoriteRoutineIds: [],
  updatedAt: "",
};

function normalizeMobilityPreferences(value: unknown): MobilityPreferences {
  if (!value || typeof value !== "object") return DEFAULT_PREFERENCES;

  const candidate = value as Partial<MobilityPreferences>;
  const validIds = new Set(mobilityRoutines.map((routine) => routine.id));
  const favoriteRoutineIds = Array.isArray(candidate.favoriteRoutineIds)
    ? candidate.favoriteRoutineIds.filter(
        (id): id is MobilityRoutineId =>
          typeof id === "string" && validIds.has(id as MobilityRoutineId)
      )
    : [];

  return {
    favoriteRoutineIds: [...new Set(favoriteRoutineIds)],
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : "",
  };
}

export function useMobilityPreferences() {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  useEffect(() => {
    const saved = localStorage.getItem(FITNESS_OS_STORAGE_KEYS.mobilityPreferences);
    if (!saved) return;

    try {
      setPreferences(normalizeMobilityPreferences(JSON.parse(saved)));
    } catch {
      localStorage.removeItem(FITNESS_OS_STORAGE_KEYS.mobilityPreferences);
    }
  }, []);

  function toggleFavorite(routineId: MobilityRoutineId) {
    const favoriteRoutineIds = preferences.favoriteRoutineIds.includes(routineId)
      ? preferences.favoriteRoutineIds.filter((id) => id !== routineId)
      : [...preferences.favoriteRoutineIds, routineId];
    const next = { favoriteRoutineIds, updatedAt: new Date().toISOString() };

    setPreferences(next);
    setFitnessOsStorage(
      FITNESS_OS_STORAGE_KEYS.mobilityPreferences,
      JSON.stringify(next)
    );
  }

  return { favoriteRoutineIds: preferences.favoriteRoutineIds, toggleFavorite };
}
