import assert from "node:assert/strict";
import test from "node:test";

import { calculateNutritionTargetRecommendation } from "../../features/nutrition/utils/calculateNutritionTargetRecommendation.ts";
import { getLifestyleContextObservation } from "../../features/coach/getLifestyleContextObservation.ts";
import { getRequiredAdherenceToDate } from "../../features/progress/utils/getRequiredAdherenceToDate.ts";
import {
  getTrainingWeekStartDate,
  normalizeLegacyTrainingWeekStartDate,
} from "../../lib/date/trainingWeek.ts";
import { normalizeTrainingPlanWeekStarts } from "../../features/workout/logic/normalizeTrainingPlanWeekStarts.ts";

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

test("Guide explains missing evidence instead of suppressing sparse context", () => {
  const adherenceSignal = {
    eligibleDays: 28, loggedDays: 0, coveragePercent: 0,
    adherencePercent: undefined, averagePercentOfTarget: undefined,
    evidenceReady: false,
  };
  const observation = getLifestyleContextObservation({
    windowStartDate: "2026-08-02", windowEndDate: "2026-08-29",
    bodyComposition: { status: "InsufficientData", evidenceReady: false },
    nutrition: { protein: adherenceSignal, calories: adherenceSignal },
    activity: { steps: adherenceSignal },
    lifestyleEvidenceReady: false,
  });

  assert.equal(observation?.label, "Still learning");
  assert.match(observation?.message ?? "", /cannot yet determine why progress/i);
  assert.match(observation?.message ?? "", /Body-composition trend history/i);
  assert.match(observation?.message ?? "", /Calorie logging/i);
});

test("week-so-far adherence excludes future required opportunities", () => {
  const required = (date, completed) => ({ date, required: true, completed });
  const optional = (date, completed) => ({ date, required: false, completed });
  const adherence = {
    activities: [
      required("2026-08-24", true),
      required("2026-08-30", false),
      optional("2026-08-26", false),
      optional("2026-08-30", false),
    ],
    substitutionGroups: [{
      completed: false,
      activities: [optional("2026-08-26", false), optional("2026-08-30", false)],
    }],
  };

  assert.deepEqual(getRequiredAdherenceToDate(adherence, "2026-08-29"), {
    requiredScheduled: 1,
    requiredCompleted: 1,
    adherenceRate: 1,
  });
  assert.deepEqual(getRequiredAdherenceToDate(adherence, "2026-08-30"), {
    requiredScheduled: 3,
    requiredCompleted: 1,
    adherenceRate: 1 / 3,
  });
});

test("canonical training weeks run Sunday through Saturday", () => {
  assert.equal(getTrainingWeekStartDate(new Date(2026, 7, 30)), "2026-08-30");
  assert.equal(getTrainingWeekStartDate(new Date(2026, 8, 5)), "2026-08-30");
  assert.equal(normalizeLegacyTrainingWeekStartDate("2026-08-31"), "2026-08-30");
});

test("week-start migration preserves finalized decisions and adds evaluation aliases", () => {
  const decision = {
    weekStartDate: "2026-08-24",
    weekType: "Ramp",
    automaticStatus: "Advance",
    automaticShouldAdvance: true,
    automaticReason: "Recorded under the prior calendar boundary.",
    automaticFactors: [],
    finalShouldAdvance: true,
    manuallyOverridden: false,
    decidedAt: "2026-08-30T08:00:00.000Z",
  };
  const migrated = normalizeTrainingPlanWeekStarts({
    trainingPlanId: "fitness-os-default",
    startDate: "2026-08-24",
    heldWeekStartDates: ["2026-08-31"],
    evaluatedWeekStartDates: ["2026-08-24"],
    weeklyProgressionDecisions: [decision],
    deloadWeekStartDates: [],
  });

  assert.equal(migrated.startDate, "2026-08-23");
  assert.deepEqual(migrated.evaluatedWeekStartDates, ["2026-08-23", "2026-08-24"]);
  assert.deepEqual(migrated.heldWeekStartDates, ["2026-08-30"]);
  assert.deepEqual(migrated.weeklyProgressionDecisions, [decision]);
});
