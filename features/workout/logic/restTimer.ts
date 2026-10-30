import {
  getExerciseProgrammingRole,
} from "../exerciseClassification.ts";

import type {
  ExerciseDefinition,
  ExerciseSet,
  WorkoutRestTimer,
} from "../types.ts";
import {
  DEFAULT_WORKOUT_PREFERENCES,
} from "../workoutPreferences.ts";
import type {
  WorkoutPreferences,
} from "../workoutPreferences.ts";

export const DEFAULT_REST_SECONDS =
  DEFAULT_WORKOUT_PREFERENCES.restDurations;

export function getExerciseRestDurationSeconds(
  definition?: ExerciseDefinition,
  preferences: WorkoutPreferences = DEFAULT_WORKOUT_PREFERENCES
) {
  const durations = preferences.restDurations;

  if (!definition) {
    return durations.moderateCompoundSeconds;
  }

  if (definition.category === "Core") {
    return durations.coreSeconds;
  }

  if (definition.resistanceType === "None") {
    return durations.bodyweightSeconds;
  }

  if (getExerciseProgrammingRole(definition) === "Primary") {
    return durations.heavyCompoundSeconds;
  }

  return durations.isolationSeconds;
}

export function hasRemainingWorkingSetAfter(
  sets: ExerciseSet[],
  completedSetId: string
) {
  const completedSetIndex = sets.findIndex(
    (set) => set.id === completedSetId
  );

  return completedSetIndex >= 0 && sets
    .slice(completedSetIndex + 1)
    .some((set) => !set.completed);
}

export function createWorkoutRestTimer({
  durationSeconds,
  exerciseId,
  exerciseName,
  now = Date.now(),
}: {
  durationSeconds: number;
  exerciseId?: string;
  exerciseName?: string;
  now?: number;
}): WorkoutRestTimer {
  const safeDuration = Math.max(0, Math.round(durationSeconds));

  return {
    startedAt: new Date(now).toISOString(),
    endsAt: new Date(now + safeDuration * 1000).toISOString(),
    durationSeconds: safeDuration,
    exerciseId,
    exerciseName,
  };
}

export function getRestTimerRemainingSeconds(
  timer: WorkoutRestTimer,
  now = Date.now()
) {
  if (timer.pausedRemainingSeconds !== undefined) {
    return Math.max(0, timer.pausedRemainingSeconds);
  }

  return Math.max(
    0,
    Math.ceil((new Date(timer.endsAt).getTime() - now) / 1000)
  );
}

export function pauseWorkoutRestTimer(
  timer: WorkoutRestTimer,
  now = Date.now()
): WorkoutRestTimer {
  return {
    ...timer,
    pausedRemainingSeconds: getRestTimerRemainingSeconds(timer, now),
  };
}

export function resumeWorkoutRestTimer(
  timer: WorkoutRestTimer,
  now = Date.now()
): WorkoutRestTimer {
  const remaining = getRestTimerRemainingSeconds(timer, now);

  return {
    ...timer,
    endsAt: new Date(now + remaining * 1000).toISOString(),
    pausedRemainingSeconds: undefined,
  };
}

export function adjustWorkoutRestTimer(
  timer: WorkoutRestTimer,
  adjustmentSeconds: number,
  now = Date.now()
): WorkoutRestTimer {
  const remaining = Math.max(
    0,
    getRestTimerRemainingSeconds(timer, now) + adjustmentSeconds
  );

  if (timer.pausedRemainingSeconds !== undefined) {
    return {
      ...timer,
      pausedRemainingSeconds: remaining,
    };
  }

  return {
    ...timer,
    endsAt: new Date(now + remaining * 1000).toISOString(),
  };
}
