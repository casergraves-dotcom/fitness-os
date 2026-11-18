import assert from "node:assert/strict";
import test from "node:test";

import { exerciseLibrary } from "../../features/workout/exerciseLibrary.ts";
import {
  getExerciseCoverageMatrix,
  getExerciseMuscleGroups,
  getExerciseProgrammingRole,
  getExerciseVarietyRole,
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

test("uses primary movements as stable anchors and accessories as flexible variety", () => {
  assert.equal(getExerciseVarietyRole(exercise("leg-press")), "ProgressionAnchor");
  assert.equal(getExerciseVarietyRole(exercise("chest-press-machine")), "ProgressionAnchor");
  assert.equal(getExerciseVarietyRole(exercise("lateral-raise-machine")), "FlexibleAccessory");
  assert.equal(getExerciseVarietyRole(exercise("cable-woodchop")), "FlexibleAccessory");
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

test("coverage additions close the direct trap, rotator cuff, and tibialis gaps", () => {
  const matrix = getExerciseCoverageMatrix(exerciseLibrary);
  for (const muscleGroup of ["Traps", "Rotator Cuff", "Tibialis"]) {
    const row = matrix.find((candidate) => candidate.muscleGroup === muscleGroup);
    assert.ok(row, muscleGroup);
    assert.equal(row.primary.length, 0, muscleGroup);
    assert.ok(row.accessory.length >= 2, muscleGroup);
  }
});
