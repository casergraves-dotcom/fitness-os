import type {
  TrainingActivity,
  TrainingActivityCompletion,
  TrainingPlanState,
  WorkoutSession,
} from "../types";

import { fitnessOsTrainingPlan } from "../trainingPlan";
import { getTrainingScheduleForDate } from "./getTrainingScheduleForDate";

import {
  setFitnessOsStorage,
} from "@/lib/storage/fitnessOsStorage";


// ============================================================
// Storage
// ============================================================

export const TRAINING_ACTIVITY_COMPLETIONS_STORAGE_KEY =
  "fitness-os-training-activity-completions";

export const TRAINING_ACTIVITY_COMPLETIONS_CHANGED_EVENT =
  "fitness-os-training-activity-completions-changed";


// ============================================================
// Date Helper
// ============================================================

export function formatTrainingDate(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


// ============================================================
// ID Helper
// ============================================================

function createCompletionId() {
  return [
    "completion",
    Date.now(),
    Math.random()
      .toString(36)
      .slice(2),
  ].join("-");
}


// ============================================================
// Read Completions
// ============================================================

export function readTrainingActivityCompletions():
  TrainingActivityCompletion[] {
  const saved =
    localStorage.getItem(
      TRAINING_ACTIVITY_COMPLETIONS_STORAGE_KEY
    );

  if (!saved) {
    return [];
  }

  try {
    const parsed: unknown =
      JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (
        value
      ): value is TrainingActivityCompletion => {
        if (
          typeof value !== "object" ||
          value === null
        ) {
          return false;
        }

        const candidate =
          value as Partial<TrainingActivityCompletion>;

        return (
          typeof candidate.id === "string" &&
          typeof candidate.date === "string" &&
          typeof candidate.trainingActivityId ===
            "string" &&
          typeof candidate.type === "string" &&
          typeof candidate.label === "string" &&
          typeof candidate.completedAt ===
            "string"
        );
      }
    );
  } catch {
    return [];
  }
}


// ============================================================
// Write Completions
// ============================================================

export function writeTrainingActivityCompletions(
  completions:
    TrainingActivityCompletion[]
) {
  setFitnessOsStorage(
    TRAINING_ACTIVITY_COMPLETIONS_STORAGE_KEY,
    JSON.stringify(completions)
  );

  window.dispatchEvent(
    new Event(TRAINING_ACTIVITY_COMPLETIONS_CHANGED_EVENT)
  );
}

export function subscribeToTrainingActivityCompletions(
  listener: () => void
) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === TRAINING_ACTIVITY_COMPLETIONS_STORAGE_KEY) {
      listener();
    }
  };

  window.addEventListener(
    TRAINING_ACTIVITY_COMPLETIONS_CHANGED_EVENT,
    listener
  );
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(
      TRAINING_ACTIVITY_COMPLETIONS_CHANGED_EVENT,
      listener
    );
    window.removeEventListener("storage", handleStorage);
  };
}

// ============================================================
// Remove Completions By Workout Session
// ============================================================

export function removeTrainingActivityCompletionsByWorkoutSessionId(
  workoutSessionId: string
) {
  const previous =
    readTrainingActivityCompletions();

  const updated =
    previous.filter(
      (completion) =>
        completion.workoutSessionId !==
        workoutSessionId
    );

  // Avoid an unnecessary storage write when no matching
  // completion record exists.
  if (
    updated.length ===
    previous.length
  ) {
    return 0;
  }

  writeTrainingActivityCompletions(
    updated
  );

  return (
    previous.length -
    updated.length
  );
}


// ============================================================
// Record Completion
// ============================================================

export function recordTrainingActivityCompletion(
  activity: TrainingActivity,
  options?: {
    date?: Date;
    workoutSessionId?: string;
    completedAt?: Date;
  }
) {
  const completedAt =
    options?.completedAt ??
    new Date();

  const activityDate =
    options?.date ??
    completedAt;

  const date =
    formatTrainingDate(
      activityDate
    );

  const completion:
    TrainingActivityCompletion = {
      id:
        createCompletionId(),

      date,

      trainingActivityId:
        activity.id,

      type:
        activity.type,

      label:
        activity.label,

      completedAt:
        completedAt.toISOString(),

      workoutSessionId:
        options?.workoutSessionId,
    };


  const previous =
    readTrainingActivityCompletions();

  // One scheduled activity gets at most one completion
  // record for a given calendar date.
  const withoutDuplicate =
    previous.filter(
      (item) =>
        !(
          item.date === date &&
          item.trainingActivityId ===
            activity.id
        )
    );

  writeTrainingActivityCompletions([
    ...withoutDuplicate,
    completion,
  ]);

  return completion;
}

export function restoreScheduledStrengthCompletionsFromHistory(
  workoutHistory: WorkoutSession[],
  planState: TrainingPlanState,
  existingCompletions: TrainingActivityCompletion[]
) {
  let restored = 0;
  const knownWorkoutSessionIds = new Set(
    existingCompletions.flatMap((completion) =>
      completion.workoutSessionId ? [completion.workoutSessionId] : []
    )
  );

  for (const workout of workoutHistory) {
    if (!workout.completedAt || knownWorkoutSessionIds.has(workout.id)) {
      continue;
    }

    const completedAt = new Date(workout.completedAt);
    if (Number.isNaN(completedAt.getTime())) {
      continue;
    }

    const scheduledDate = workout.scheduledDate
      ? new Date(`${workout.scheduledDate}T12:00:00`)
      : completedAt;
    const schedule = getTrainingScheduleForDate(
      fitnessOsTrainingPlan,
      planState,
      scheduledDate
    );
    const scheduledActivity = schedule?.trainingDay.activities.find(
      (activity) =>
        activity.type === "Strength" &&
        activity.strengthWorkout === workout.workoutType &&
        (!workout.scheduledActivityId || activity.id === workout.scheduledActivityId)
    );

    if (!scheduledActivity) {
      continue;
    }

    const date = formatTrainingDate(scheduledDate);
    const alreadyCompleted = readTrainingActivityCompletions().some(
      (completion) =>
        completion.date === date &&
        completion.trainingActivityId === scheduledActivity.id
    );

    if (alreadyCompleted) {
      continue;
    }

    recordTrainingActivityCompletion(scheduledActivity, {
      date: scheduledDate,
      completedAt,
      workoutSessionId: workout.id,
    });
    knownWorkoutSessionIds.add(workout.id);
    restored += 1;
  }

  return restored;
}
