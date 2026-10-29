import type { CoachPersistentPatternContext } from "./types";
import type { TrainingActivityType } from "../workout/types";

export function getPersistentPatternRecommendationInfluence(
  pattern: CoachPersistentPatternContext,
  activityTypes: TrainingActivityType[] = []
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

  if (pattern.limitingDriver === "StrengthQuality") {
    return activityTypes.includes("Strength")
      ? `Because strength-session quality constrained the last ${pattern.consecutiveReviewCount} weekly reviews, prioritize completing today's prescribed working sets with controlled effort rather than adding volume.`
      : null;
  }

  if (pattern.limitingDriver === "RunningLoad") {
    return activityTypes.includes("Run")
      ? `Because running load constrained the last ${pattern.consecutiveReviewCount} weekly reviews, follow today's prescribed run structure without adding distance or intensity.`
      : null;
  }

  return `Because the plan was held after ${pattern.consecutiveReviewCount} consecutive weekly reviews, stay within today's prescribed scope rather than adding extra training volume.`;
}
