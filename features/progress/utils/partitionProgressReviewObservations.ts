import type {
  LongTermProgressReviewObservation,
} from "./getLongTermProgressReview";

const HIGHLIGHT_TYPES = new Set([
  "Milestone",
  "PersonalRecord",
  "ProgressPhoto",
]);

export function partitionProgressReviewObservations(
  observations: LongTermProgressReviewObservation[]
) {
  return observations.reduce<{
    highlights: LongTermProgressReviewObservation[];
    summary: LongTermProgressReviewObservation[];
  }>(
    (result, observation) => {
      if (HIGHLIGHT_TYPES.has(observation.type)) {
        result.highlights.push(observation);
      } else {
        result.summary.push(observation);
      }

      return result;
    },
    { highlights: [], summary: [] }
  );
}
