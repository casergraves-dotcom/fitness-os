import type {
  WorkoutSession,
} from "../types";


// ============================================================
// Workout Session Label
// ============================================================
//
// workoutType represents the underlying program workout.
//
// variantLabel represents what was actually performed.
//
// Older history entries do not contain variant metadata, so
// fall back to workoutType for backwards compatibility.

export function getWorkoutSessionLabel(
  workout:
    Pick<
      WorkoutSession,
      "workoutType" |
      "variantLabel"
    >
) {
  return (
    workout.variantLabel ??
    workout.workoutType
  );
}
