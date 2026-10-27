import assert from "node:assert/strict";
import test from "node:test";

import { exerciseLibrary } from "../../features/workout/exerciseLibrary.ts";
import {
  getExerciseCoverageMatrix,
  getExerciseMuscleGroups,
  getExerciseProgrammingRole,
} from "../../features/workout/exerciseClassification.ts";

function exercise(id) {
  const definition = exerciseLibrary.find((item) => item.id === id);
  assert.ok(definition, `Missing exercise ${id}`);
  return definition;
}

test("classifies compound lifts separately from targeted accessories", () => {
  assert.equal(getExerciseProgrammingRole(exercise("leg-press")), "Primary");
  assert.equal(getExerciseProgrammingRole(exercise("chest-press-machine")), "Primary");
  assert.equal(getExerciseProgrammingRole(exercise("glute-kickback-machine")), "Accessory");
  assert.equal(getExerciseProgrammingRole(exercise("lateral-raise-machine")), "Accessory");
});

test("maps compound movement roles to meaningfully trained muscle groups", () => {
  assert.deepEqual(
    getExerciseMuscleGroups(exercise("dumbbell-rdl")),
    ["Hamstrings", "Glutes", "Spinal Erectors"]
  );
  assert.deepEqual(
    getExerciseMuscleGroups(exercise("lat-pulldown")),
    ["Lats", "Upper Back", "Biceps", "Forearms / Grip"]
  );
});

test("coverage matrix keeps explicit zero-coverage groups visible", () => {
  const matrix = getExerciseCoverageMatrix(exerciseLibrary);
  const rotatorCuff = matrix.find((row) => row.muscleGroup === "Rotator Cuff");

  assert.ok(rotatorCuff);
  assert.equal(rotatorCuff.primary.length, 0);
  assert.equal(rotatorCuff.accessory.length, 0);
});
