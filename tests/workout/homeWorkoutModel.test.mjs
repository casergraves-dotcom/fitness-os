import assert from "node:assert/strict";
import test from "node:test";

import {
  strengthWorkoutIntents,
  strengthWorkoutVariants,
} from "../../features/workout/backupWorkoutModel.ts";

test("home variants preserve every required canonical movement role", () => {
  const homeVariants = strengthWorkoutVariants.filter(
    (variant) => variant.variantType === "Home"
  );

  assert.equal(homeVariants.length, 3);

  for (const variant of homeVariants) {
    const requiredRoles = strengthWorkoutIntents[variant.sourceStrengthWorkout].roles
      .filter((role) => role.required)
      .map((role) => role.role);
    const variantRoles = new Set(variant.exercises.map((exercise) => exercise.movementRole));

    for (const role of requiredRoles) {
      assert.ok(variantRoles.has(role), `${variant.id}: missing ${role}`);
    }
  }
});

test("home variants use the new same-intent knee-flexion and trunk-flexion exercises", () => {
  const byId = new Map(
    strengthWorkoutVariants
      .filter((variant) => variant.variantType === "Home")
      .map((variant) => [variant.id, variant])
  );

  assert.ok(byId.get("gym-a-home")?.exercises.some(
    (exercise) => exercise.exerciseDefinitionId === "hamstring-walkout"
  ));
  assert.ok(byId.get("gym-a-home")?.exercises.some(
    (exercise) => exercise.exerciseDefinitionId === "band-woodchop"
  ));
  assert.ok(byId.get("gym-b-home")?.exercises.some(
    (exercise) => exercise.exerciseDefinitionId === "hamstring-walkout"
  ));
  assert.ok(byId.get("gym-c-home")?.exercises.some(
    (exercise) => exercise.exerciseDefinitionId === "band-kneeling-crunch"
  ));
});
