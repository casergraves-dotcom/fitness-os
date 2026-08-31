"use client";

import { useEffect, useState } from "react";

import { setFitnessOsStorage } from "@/lib/storage/fitnessOsStorage";
import {
  DEFAULT_COACHING_PREFERENCES,
  normalizeCoachingPreferences,
} from "../coachingPreferences";
import type { CoachingPreferences } from "../coachingPreferences";

const STORAGE_KEY = "fitness-os-coaching-preferences";

export function useCoachingPreferences() {
  const [preferences, setPreferences] = useState<CoachingPreferences>(
    DEFAULT_COACHING_PREFERENCES
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPreferences(normalizeCoachingPreferences(JSON.parse(saved)));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoaded(true);
  }, []);

  function savePreferences(next: Omit<CoachingPreferences, "updatedAt">) {
    const saved = { ...next, updatedAt: new Date().toISOString() };
    setPreferences(saved);
    setFitnessOsStorage(STORAGE_KEY, JSON.stringify(saved));
  }

  return { preferences, loaded, savePreferences };
}
