import assert from "node:assert/strict";
import test from "node:test";

import { calculateNutritionTargetRecommendation } from "../../features/nutrition/utils/calculateNutritionTargetRecommendation.ts";

const baseInput = {
  sex: "Male", ageYears: 31, heightInches: 67, weightLb: 196,
  activityLevel: "Moderate", goal: "Lose", goalRateLbPerWeek: 1,
};

test("lean mass refines the protein range without becoming the literal target", () => {
  const result = calculateNutritionTargetRecommendation({ ...baseInput, leanMassLb: 125 });
  assert.equal(result.proteinBasis, "LeanMass");
  assert.equal(result.suggestedProteinGrams, 150);
  assert.equal(result.proteinMinimumGrams, 135);
  assert.equal(result.proteinMaximumGrams, 175);
});

test("body weight supplies a bounded range when lean mass is unavailable", () => {
  const result = calculateNutritionTargetRecommendation(baseInput);
  assert.equal(result.proteinBasis, "BodyWeight");
  assert.equal(result.suggestedProteinGrams, 155);
  assert.equal(result.proteinMinimumGrams, 135);
  assert.equal(result.proteinMaximumGrams, 175);
});

test("stored RMR remains the resting baseline independently of protein inputs", () => {
  const result = calculateNutritionTargetRecommendation({
    ...baseInput, restingMetabolicRateCalories: 1846,
  });
  assert.equal(result.method, "StoredRmr");
  assert.equal(result.restingCalories, 1850);
});
