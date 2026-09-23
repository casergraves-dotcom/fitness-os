"use client";

import { useEffect, useState } from "react";

import { FITNESS_OS_STORAGE_KEYS } from "@/lib/storage/fitnessOsStorageKeys";
import { setFitnessOsStorage } from "@/lib/storage/fitnessOsStorage";
import type { AppliedStrengthProgrammingDecision } from "../logic/strengthProgrammingRecommendation";

const STORAGE_KEY = FITNESS_OS_STORAGE_KEYS.strengthProgrammingDecisions;

function readDecisions(): AppliedStrengthProgrammingDecision[] {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return [];

  try {
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed)
      ? parsed.filter(
          (decision): decision is AppliedStrengthProgrammingDecision =>
            typeof decision === "object" &&
            decision !== null &&
            typeof decision.id === "string" &&
            typeof decision.workoutType === "string" &&
            typeof decision.appliedAt === "string" &&
            typeof decision.completedFullSessionsAtApplication === "number" &&
            typeof decision.recommendation === "object" &&
            decision.recommendation !== null
        )
      : [];
  } catch {
    return [];
  }
}

export function useStrengthProgrammingDecisions() {
  const [decisions, setDecisions] = useState<AppliedStrengthProgrammingDecision[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      setDecisions(readDecisions());
      setLoaded(true);
    }, 0);

    return () => window.clearTimeout(hydrationTimer);
  }, []);

  function recordDecision(decision: AppliedStrengthProgrammingDecision) {
    const updated = [...decisions, decision];
    setDecisions(updated);
    setFitnessOsStorage(STORAGE_KEY, JSON.stringify(updated));
  }

  return {
    decisions,
    loaded,
    recordDecision,
  };
}
