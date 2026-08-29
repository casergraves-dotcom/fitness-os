import assert from "node:assert/strict";
import test from "node:test";

import { exerciseLibrary } from "../../features/workout/exerciseLibrary.ts";
import { getExerciseSubstitutions } from "../../features/workout/exerciseSubstitutions.ts";

const gymContext = {
  environment: "Gym",
  availableEquipment: ["Bodyweight", "YogaMat", "ResistanceBands", "PullUpBar", "Dumbbells", "Barbell", "BarbellRack", "WeightPlate", "Bench", "GymMachines"],
  availableCapabilities: ["FloorSpace", "HighAnchor", "LowAnchor", "DoorAnchor", "PullUpBarInstalled"],
};

function substitutionsFor(exerciseId, context = gymContext, limit = 20) {
  return getExerciseSubstitutions(exerciseId, exerciseLibrary, context, limit);
}

function idsFor(exerciseId, context = gymContext) {
  return substitutionsFor(exerciseId, context).map((option) => option.exercise.id);
}

test("every automatic substitution preserves a movement role and has complete metadata", () => {
  for (const source of exerciseLibrary) {
    for (const option of substitutionsFor(source.id)) {
      assert.ok(option.sharedRoles.length > 0, `${source.id} -> ${option.exercise.id}`);
      assert.notEqual(option.exercise.repMin, undefined, option.exercise.id);
      assert.notEqual(option.exercise.repMax, undefined, option.exercise.id);
      assert.notEqual(option.exercise.increment, undefined, option.exercise.id);
      assert.notEqual(option.exercise.resistanceType, undefined, option.exercise.id);
      assert.notEqual(option.exercise.performanceType, undefined, option.exercise.id);
    }
  }
});

test("knee-flexion substitutions exclude hip hinges", () => {
  const ids = idsFor("leg-curl");
  assert.deepEqual(ids, ["lying-leg-curl", "band-leg-curl"]);
  assert.ok(!ids.includes("dumbbell-rdl"));
  assert.ok(!ids.includes("romanian-deadlift"));
});

test("squat substitutions exclude hip-extension isolation", () => {
  const ids = idsFor("leg-press");
  assert.ok(ids.includes("barbell-squat"));
  assert.ok(!ids.includes("glute-bridge"));
  assert.ok(!ids.includes("hip-thrust-machine"));
  assert.ok(!ids.includes("glute-kickback-machine"));
});

test("hip extension ranks equivalents before labeled fallbacks", () => {
  const options = substitutionsFor("glute-bridge");
  assert.equal(options[0].exercise.id, "hip-thrust-machine");
  assert.equal(options[0].relationship, "Equivalent");
  assert.equal(options[1].exercise.id, "glute-kickback-machine");
  assert.equal(options[1].relationship, "Fallback");
});

test("core substitutions remain within their specific movement patterns", () => {
  assert.deepEqual(idsFor("cable-woodchop"), ["band-woodchop"]);
  assert.deepEqual(idsFor("ab-crunch-machine"), ["cable-crunch"]);
  assert.deepEqual(idsFor("hanging-leg-raise"), ["lying-leg-raise"]);
  const plankIds = idsFor("plank");
  assert.ok(plankIds.includes("dead-bug"));
  assert.ok(!plankIds.includes("cable-crunch"));
  assert.ok(!plankIds.includes("lying-leg-raise"));
});

test("active-workout exercises are excluded from recommendations", () => {
  const ids = idsFor("seated-row", { ...gymContext, unavailableExerciseIds: ["cable-row", "barbell-row"] });
  assert.ok(!ids.includes("cable-row"));
  assert.ok(!ids.includes("barbell-row"));
  assert.ok(ids.includes("one-arm-dumbbell-row"));
});
