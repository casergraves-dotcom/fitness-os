import test from "node:test";
import assert from "node:assert/strict";

import {
  STRENGTH_PROGRAMMING_PROFILE_VERSION,
  getStrengthProgrammingProfile,
} from "../../features/workout/strengthProgrammingProfile.ts";

test("fat-loss programming conserves recoverable strength volume", () => {
  const profile = getStrengthProgrammingProfile({
    primaryGoal: "FatLoss",
    trainingEmphasis: "Balanced",
  });

  assert.equal(profile.version, STRENGTH_PROGRAMMING_PROFILE_VERSION);
  assert.equal(profile.volumeBias, "Conserve");
  assert.equal(profile.maximumSetIncreasePerExercise, 0);
  assert.equal(profile.maximumSetReductionPerExercise, 1);
  assert.ok(profile.protectedMovementRoles.includes("Squat"));
  assert.ok(profile.protectedMovementRoles.includes("HorizontalPull"));
});

test("strength emphasis can restore standard volume during fat loss without forcing build volume", () => {
  const profile = getStrengthProgrammingProfile({
    primaryGoal: "FatLoss",
    trainingEmphasis: "Strength",
  });

  assert.equal(profile.volumeBias, "Standard");
  assert.equal(profile.maximumSetIncreasePerExercise, 0);
});

test("aerial emphasis constrains pulling fatigue even for a performance goal", () => {
  const profile = getStrengthProgrammingProfile({
    primaryGoal: "Performance",
    trainingEmphasis: "Aerial",
  });

  assert.equal(profile.volumeBias, "Standard");
  assert.ok(profile.priorityMovementRoles.includes("CoreHipFlexion"));
  assert.ok(profile.constrainedIncreaseRoles.includes("VerticalPull"));
  assert.ok(
    profile.fatigueConstraints.some((constraint) =>
      constraint.includes("pulling, grip, or shoulder")
    )
  );
});

test("running emphasis prevents performance goals from blindly increasing strength volume", () => {
  const profile = getStrengthProgrammingProfile({
    primaryGoal: "Performance",
    trainingEmphasis: "Running",
  });

  assert.equal(profile.volumeBias, "Standard");
  assert.ok(profile.priorityMovementRoles.includes("CoreStability"));
  assert.ok(profile.constrainedIncreaseRoles.includes("Squat"));
  assert.ok(
    profile.fatigueConstraints.some((constraint) =>
      constraint.includes("key running sessions")
    )
  );
});

test("performance plus strength emphasis produces a build bias", () => {
  const profile = getStrengthProgrammingProfile({
    primaryGoal: "Performance",
    trainingEmphasis: "Strength",
  });

  assert.equal(profile.volumeBias, "Build");
  assert.equal(profile.maximumSetIncreasePerExercise, 1);
  assert.equal(profile.maximumSetReductionPerExercise, 0);
  assert.ok(profile.priorityMovementRoles.includes("HipHinge"));
});
