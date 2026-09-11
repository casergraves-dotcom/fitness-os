import assert from "node:assert/strict";
import test from "node:test";

import { getNutritionAdherence } from "../../features/nutrition/utils/getNutritionAdherence.ts";

const target = { id: "target", effectiveDate: "2026-09-10", calorieTarget: 2200, proteinTargetGrams: 150, createdAt: "2026-09-10T00:00:00.000Z", updatedAt: "2026-09-10T00:00:00.000Z" };
const record = (calories, proteinGrams = 150) => ({ id: `record-${calories}`, date: "2026-09-10", calories, proteinGrams, createdAt: "2026-09-10T00:00:00.000Z", updatedAt: "2026-09-10T00:00:00.000Z" });

test("calories use the canonical inclusive 90–110% target range", () => {
  assert.equal(getNutritionAdherence("2026-09-10", target, record(1979)).calories.status, "BelowTarget");
  assert.equal(getNutritionAdherence("2026-09-10", target, record(1980)).calories.status, "OnTarget");
  assert.equal(getNutritionAdherence("2026-09-10", target, record(2050)).calories.status, "OnTarget");
  assert.equal(getNutritionAdherence("2026-09-10", target, record(2420)).calories.status, "OnTarget");
  assert.equal(getNutritionAdherence("2026-09-10", target, record(2421)).calories.status, "AboveTarget");
});

test("protein remains a minimum-style target", () => {
  assert.equal(getNutritionAdherence("2026-09-10", target, record(2200, 149)).protein.status, "BelowTarget");
  assert.equal(getNutritionAdherence("2026-09-10", target, record(2200, 150)).protein.status, "Met");
});
