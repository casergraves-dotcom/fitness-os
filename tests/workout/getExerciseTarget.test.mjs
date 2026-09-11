import assert from "node:assert/strict";
import test from "node:test";

import { getExerciseTarget } from "../../features/workout/getExerciseTarget.ts";

const definition = {
  id: "chest-press-machine",
  name: "Chest Press Machine",
  category: "Chest",
  sets: 3,
  repMin: 8,
  repMax: 12,
  increment: 5,
  progressionType: "Load",
  resistanceType: "Weight",
  performanceType: "Reps",
};

function previousExercise(sets, rampUpSets) {
  return {
    id: "previous-chest-press",
    exerciseDefinitionId: definition.id,
    name: definition.name,
    prescribedSetCount: 3,
    rampUpSets,
    sets: sets.map(([weight, reps, completed = true], index) => ({
      id: `set-${index}`,
      weight,
      reps,
      completed,
    })),
  };
}

test("same-load working sets carry the same load forward", () => {
  const target = getExerciseTarget(definition, previousExercise([[145, 10], [145, 10], [145, 10]]));
  assert.equal(target.action, "build-reps");
  assert.equal(target.targetWeight, 145);
});

test("a lone lighter first set does not become the progression baseline", () => {
  const target = getExerciseTarget(definition, previousExercise([[115, 12], [145, 10], [145, 10]]));
  assert.equal(target.action, "build-reps");
  assert.equal(target.targetWeight, 145);
  assert.equal(target.label, "145 lb × 8–12");
  assert.match(target.message, /mixed loads/);
});

test("the latest completed load breaks a tie between different loads", () => {
  const target = getExerciseTarget(definition, previousExercise([[135, 10], [140, 10], [145, 10]]));
  assert.equal(target.targetWeight, 145);
});

test("top-of-range working sets increase the representative load", () => {
  const target = getExerciseTarget(definition, previousExercise([[145, 12], [145, 12], [145, 12]]));
  assert.equal(target.action, "increase-load");
  assert.equal(target.targetWeight, 150);
});

test("incomplete exercises retain the representative completed load", () => {
  const target = getExerciseTarget(definition, previousExercise([[115, 12], [145, 10], [145, 0, false]]));
  assert.equal(target.action, "insufficient-data");
  assert.equal(target.targetWeight, 145);
});

test("separate ramp-up sets never affect the working-load baseline", () => {
  const target = getExerciseTarget(
    definition,
    previousExercise(
      [[145, 10], [145, 10], [145, 10]],
      [{ id: "ramp", weight: 115, reps: 12, completed: true }]
    )
  );
  assert.equal(target.targetWeight, 145);
});
