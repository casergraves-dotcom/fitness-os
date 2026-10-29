import type { CoachPersistentPatternContext } from "./types";

export function getPersistentPatternRecommendationInfluence(
  pattern: CoachPersistentPatternContext
) {
  if (
    pattern.finalShouldAdvance ||
    pattern.consecutiveReviewCount < 2
  ) {
    return null;
  }

  return `Because the plan was held after ${pattern.consecutiveReviewCount} consecutive weekly reviews, stay within today's prescribed scope rather than adding extra training volume.`;
}
