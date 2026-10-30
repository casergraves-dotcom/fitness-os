export type RestDurationPreferenceKey =
  | "heavyCompoundSeconds"
  | "moderateCompoundSeconds"
  | "isolationSeconds"
  | "coreSeconds"
  | "bodyweightSeconds";

export interface WorkoutPreferences {
  restDurations: Record<RestDurationPreferenceKey, number>;
  restCompletionCues: {
    sound: boolean;
    vibration: boolean;
  };
  updatedAt?: string;
}

export const DEFAULT_WORKOUT_PREFERENCES: WorkoutPreferences = {
  restDurations: {
    heavyCompoundSeconds: 150,
    moderateCompoundSeconds: 120,
    isolationSeconds: 75,
    coreSeconds: 60,
    bodyweightSeconds: 90,
  },
  restCompletionCues: {
    sound: false,
    vibration: true,
  },
};

function normalizeDuration(
  value: unknown,
  fallback: number
) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(600, Math.max(30, Math.round(value)));
}

export function normalizeWorkoutPreferences(
  value: unknown
): WorkoutPreferences {
  if (!value || typeof value !== "object") {
    return DEFAULT_WORKOUT_PREFERENCES;
  }

  const candidate = value as Partial<WorkoutPreferences>;
  const durations = candidate.restDurations;
  const defaults = DEFAULT_WORKOUT_PREFERENCES.restDurations;

  return {
    restDurations: {
      heavyCompoundSeconds: normalizeDuration(
        durations?.heavyCompoundSeconds,
        defaults.heavyCompoundSeconds
      ),
      moderateCompoundSeconds: normalizeDuration(
        durations?.moderateCompoundSeconds,
        defaults.moderateCompoundSeconds
      ),
      isolationSeconds: normalizeDuration(
        durations?.isolationSeconds,
        defaults.isolationSeconds
      ),
      coreSeconds: normalizeDuration(
        durations?.coreSeconds,
        defaults.coreSeconds
      ),
      bodyweightSeconds: normalizeDuration(
        durations?.bodyweightSeconds,
        defaults.bodyweightSeconds
      ),
    },
    restCompletionCues: {
      sound:
        typeof candidate.restCompletionCues?.sound === "boolean"
          ? candidate.restCompletionCues.sound
          : DEFAULT_WORKOUT_PREFERENCES.restCompletionCues.sound,
      vibration:
        typeof candidate.restCompletionCues?.vibration === "boolean"
          ? candidate.restCompletionCues.vibration
          : DEFAULT_WORKOUT_PREFERENCES.restCompletionCues.vibration,
    },
    updatedAt:
      typeof candidate.updatedAt === "string"
        ? candidate.updatedAt
        : undefined,
  };
}
