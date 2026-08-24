import type {
  ScheduleConflict,
} from "./evaluateScheduleConflicts";


export type ScheduleConflictResolution =
  | "Move"
  | "Shorten"
  | "Substitute"
  | "Skip"
  | "NoAction";


export interface ScheduleConflictResolutionClassification {
  preferred:
    ScheduleConflictResolution;

  alternatives:
    ScheduleConflictResolution[];

  reason:
    string;
}


export function classifyScheduleConflictResolution(
  conflict: ScheduleConflict
): ScheduleConflictResolutionClassification {

  switch (conflict.kind) {

    case "ConsecutiveStrength":
      return {
        preferred: "Move",
        alternatives: [
          "Shorten",
          "Substitute",
        ],
        reason:
          "Moving a full-body strength session is preferred when consecutive strength days would reduce recovery. A shorter or substitute strength session may be appropriate when moving is impractical.",
      };


    case "SameDayHardStack":
      return {
        preferred: "Move",
        alternatives: [
          "Shorten",
          "Substitute",
          "Skip",
        ],
        reason:
          "Moving one hard session is preferred when multiple hard activities would otherwise occur on the same day.",
      };


    case "StrengthAerialAdjacency":
      return {
        preferred: "Move",
        alternatives: [
          "Shorten",
          "Substitute",
        ],
        reason:
          "Moving the strength session is preferred when possible to reduce adjacent upper-body and pulling fatigue. A shorter or substitute strength session may also reduce load.",
      };


    case "StrengthHardRunAdjacency":
      return {
        preferred: "Move",
        alternatives: [
          "Shorten",
          "Substitute",
        ],
        reason:
          "Moving the strength or hard running session is preferred when possible to reduce adjacent lower-body fatigue.",
      };


    default:
      return {
        preferred: "NoAction",
        alternatives: [],
        reason:
          "No specific schedule-resolution strategy is required for this conflict.",
      };
  }
}