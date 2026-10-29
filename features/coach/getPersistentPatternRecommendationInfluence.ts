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

  if (pattern.limitingDriver === "Recovery") {
    return `Because recovery constrained the last ${pattern.consecutiveReviewCount} weekly reviews, keep today's prescribed session conservative and avoid adding extra training volume.`;
  }

  if (pattern.limitingDriver === "Adherence") {
    return `Because adherence constrained the last ${pattern.consecutiveReviewCount} weekly reviews, focus on today's prescribed session rather than adding extra training volume.`;
  }

  return `Because the plan was held after ${pattern.consecutiveReviewCount} consecutive weekly reviews, stay within today's prescribed scope rather than adding extra training volume.`;
}
