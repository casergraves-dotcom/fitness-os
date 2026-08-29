import type {
  TrainingActivity,
} from "../types";


export function isCompletableTrainingActivity(
  activity: TrainingActivity
) {
  return (
    activity.type !== "Rest" &&
    activity.type !== "Recovery"
  );
}
