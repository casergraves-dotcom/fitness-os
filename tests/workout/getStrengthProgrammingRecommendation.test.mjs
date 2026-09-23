import test from "node:test";
import assert from "node:assert/strict";

import { workoutTemplates } from "../../features/workout/data.ts";
import { currentGymWorkoutEquipment } from "../../features/workout/backupWorkoutModel.ts";
import { getStrengthProgrammingProfile } from "../../features/workout/strengthProgrammingProfile.ts";
import { getStrengthProgrammingRecommendation } from "../../features/workout/logic/getStrengthProgrammingRecommendation.ts";

function input(overrides = {}) {
  return {
    workoutType: "Gym B",
    template: workoutTemplates["Gym B"],
    profile: getStrengthProgrammingProfile({
      primaryGoal: "Performance",
      trainingEmphasis: "Strength",
    }),
    completedFullSessionsForWorkout: 6,
    recoverySupportsBuild: true,
    recoveryCallsForReduction: false,
    availableEquipment: currentGymWorkoutEquipment,
    recommendationId: "recommendation-1",
    createdAt: "2026-09-22T12:00:00.000Z",
    ...overrides,
  };
}

test("build profiles wait for full-session and recovery evidence", () => {
  const tooSoon = getStrengthProgrammingRecommendation(
    input({ completedFullSessionsForWorkout: 5 })
  );
  const poorRecovery = getStrengthProgrammingRecommendation(
    input({ recoverySupportsBuild: false })
  );

  assert.equal(tooSoon.status, "InsufficientEvidence");
  assert.equal(tooSoon.recommendation, null);
  assert.equal(poorRecovery.status, "InsufficientEvidence");
});

test("eligible build profiles propose only one set on one priority exercise", () => {
  const assessment = getStrengthProgrammingRecommendation(input());

  assert.equal(assessment.status, "Ready");
  assert.equal(assessment.recommendation.changes.length, 1);
  assert.equal(
    assessment.recommendation.changes[0].proposedSetCount -
      assessment.recommendation.changes[0].currentSetCount,
    1
  );
});

test("build recommendations never add sets to unavailable equipment", () => {
  const assessment = getStrengthProgrammingRecommendation(
    input({ availableEquipment: ["Bodyweight"] })
  );

  assert.equal(assessment.status, "NoChange");
  assert.equal(assessment.recommendation, null);
  assert.match(assessment.explanation, /available gym equipment/);
});

test("fat-loss plus aerial does not remove work when recovery is stable", () => {
  const profile = getStrengthProgrammingProfile({
    primaryGoal: "FatLoss",
    trainingEmphasis: "Aerial",
  });
  const assessment = getStrengthProgrammingRecommendation(
    input({ profile, recoverySupportsBuild: false })
  );

  assert.equal(assessment.status, "NoChange");
  assert.match(assessment.explanation, /does not automatically remove/);
});

test("recovery reductions never remove a set from a required movement", () => {
  const profile = getStrengthProgrammingProfile({
    primaryGoal: "FatLoss",
    trainingEmphasis: "Balanced",
  });
  const assessment = getStrengthProgrammingRecommendation(
    input({
      workoutType: "Gym A",
      template: workoutTemplates["Gym A"],
      profile,
      recoveryCallsForReduction: true,
    })
  );

  assert.equal(assessment.status, "NoChange");
  assert.match(assessment.explanation, /no non-required exercise/);
});
