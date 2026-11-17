import type { TrainingActivity } from "../types";

export interface TrainingActivityScheduleContext {
  activity: TrainingActivity;
  placementSource?: "FixedAerialCommitment" | "AdHoc";
}

export function getOccurrenceScheduleConstraint(
  occurrence: TrainingActivityScheduleContext
) {
  if (occurrence.placementSource === "FixedAerialCommitment") {
    return "Fixed" as const;
  }

  return occurrence.activity.scheduleConstraint ?? "Flexible";
}
