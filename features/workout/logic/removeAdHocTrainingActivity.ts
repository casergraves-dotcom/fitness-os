import type { TrainingPlanState } from "../types";

// Remove only a user-added schedule instance, never a recurring plan activity.
export function removeAdHocTrainingActivity(
  state: TrainingPlanState,
  activityId: string,
): TrainingPlanState {
  const entries = state.adHocActivities ?? [];
  const remaining = entries.filter((entry) => entry.activity.id !== activityId);
  if (remaining.length === entries.length) return state;

  return { ...state, adHocActivities: remaining };
}
