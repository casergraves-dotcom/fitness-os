import type {
  TrainingActivity,
  TrainingActivityCompletion,
} from "../types";


// ============================================================
// Storage
// ============================================================

export const TRAINING_ACTIVITY_COMPLETIONS_STORAGE_KEY =
  "fitness-os-training-activity-completions";


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
  localStorage.setItem(
    TRAINING_ACTIVITY_COMPLETIONS_STORAGE_KEY,
    JSON.stringify(completions)
  );
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