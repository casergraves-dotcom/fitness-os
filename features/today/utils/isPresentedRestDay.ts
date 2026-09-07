import type {
  TrainingActivity,
} from "@/features/workout/types";


function isOptionalRecoveryActivity(
  activity: TrainingActivity,
): boolean {
  if (!activity.optional) {
    return false;
  }

  if (
    activity.type === "Recovery" ||
    activity.type === "Mobility"
  ) {
    return true;
  }

  return (
    activity.type === "Walk" &&
    activity.cardioIntensity === "Easy" &&
    (activity.durationMax ?? Number.POSITIVE_INFINITY) <= 30
  );
}


export function isPresentedRestDay(
  activities: TrainingActivity[],
): boolean {
  const hasRestDesignation = activities.some(
    (activity) => activity.type === "Rest",
  );

  if (!hasRestDesignation) {
    return false;
  }

  return activities
    .filter((activity) => activity.type !== "Rest")
    .every(isOptionalRecoveryActivity);
}
