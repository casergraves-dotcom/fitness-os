import type { CoachLifestylePatternContext } from "./types";

export function getLifestylePatternRecommendationInfluence(
  context: CoachLifestylePatternContext
) {
  if (context.recommendation !== "ReviewNutritionTarget") {
    return null;
  }

  return "Your 28-day progress evidence supports reviewing the calorie target. Keep today's training as prescribed rather than adding exercise to compensate.";
}
