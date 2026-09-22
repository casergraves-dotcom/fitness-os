import test from "node:test";
import assert from "node:assert/strict";

import { strengthWorkoutVariants } from "../../features/workout/backupWorkoutModel.ts";

test("time-constrained variants preserve full sets for explicit primary exercises", () => {
  const shortVariants = strengthWorkoutVariants.filter(
    (variant) => variant.variantType === "ShortGym"
  );

  assert.equal(shortVariants.length, 3);

  for (const variant of shortVariants) {
    const primaryExercises = variant.exercises.filter(
      (exercise) => exercise.priority === "Primary"
    );
    const secondaryExercises = variant.exercises.filter(
      (exercise) => exercise.priority === "Secondary"
    );

    assert.ok(primaryExercises.length >= 3, `${variant.id}: primary exercises`);
    assert.ok(primaryExercises.every((exercise) => exercise.sets === 3));
    assert.ok(secondaryExercises.every((exercise) => exercise.sets === 2));
    assert.ok(variant.exercises.every((exercise) => exercise.priority));
    assert.ok(variant.exercises.every((exercise) => !exercise.optional));
  }
});
