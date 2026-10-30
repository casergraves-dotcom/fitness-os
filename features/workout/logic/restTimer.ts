import {
  getExerciseProgrammingRole,
} from "../exerciseClassification.ts";

import type {
  ExerciseDefinition,
  ExerciseSet,
  WorkoutRestTimer,
} from "../types.ts";

export const DEFAULT_REST_SECONDS = {
  heavyCompound: 150,
  moderateCompound: 120,
  isolation: 75,
  core: 60,
  bodyweight: 90,
} as const;

export function getExerciseRestDurationSeconds(
  definition?: ExerciseDefinition
) {
  if (!definition) {
    return DEFAULT_REST_SECONDS.moderateCompound;
  }

  if (definition.category === "Core") {
    return DEFAULT_REST_SECONDS.core;
  }

  if (definition.resistanceType === "None") {
    return DEFAULT_REST_SECONDS.bodyweight;
  }

  if (getExerciseProgrammingRole(definition) === "Primary") {
    return DEFAULT_REST_SECONDS.heavyCompound;
  }

  return DEFAULT_REST_SECONDS.isolation;
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
