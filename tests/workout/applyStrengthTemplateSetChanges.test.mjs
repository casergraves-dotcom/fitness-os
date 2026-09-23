import test from "node:test";
import assert from "node:assert/strict";

import { applyStrengthTemplateSetChanges } from "../../features/workout/logic/applyStrengthTemplateSetChanges.ts";

function exercise() {
  return {
    id: "gym-a-row",
    exerciseDefinitionId: "seated-row",
    name: "Seated Row",
    prescribedSetCount: 3,
    rampUpSets: [
      { id: "row-ramp", weight: 50, reps: 10, completed: false },
    ],
    sets: [
      { id: "row-1", weight: 100, reps: 10, completed: false },
      { id: "row-2", weight: 100, reps: 10, completed: false },
      { id: "row-3", weight: 100, reps: 10, completed: false },
    ],
  };
}

test("adding one set preserves exercise identity and every existing set", () => {
  const original = exercise();
  const updated = applyStrengthTemplateSetChanges(
    [original],
    [{ exerciseId: original.id, nextSetCount: 4 }],
    { createSetId: (exerciseId, index) => `${exerciseId}-program-${index}` }
  );

  assert.equal(updated[0].id, original.id);
  assert.equal(updated[0].exerciseDefinitionId, original.exerciseDefinitionId);
  assert.deepEqual(
    updated[0].sets.slice(0, 3).map((set) => set.id),
    ["row-1", "row-2", "row-3"]
  );
  assert.deepEqual(updated[0].sets[3], {
    id: "gym-a-row-program-3",
    weight: 0,
    reps: 0,
    completed: false,
  });
  assert.equal(original.sets.length, 3);
});

test("removing one set preserves retained set IDs and does not rewrite history", () => {
  const original = exercise();
  const historicalSession = structuredClone(original);
  const updated = applyStrengthTemplateSetChanges(
    [original],
    [{ exerciseId: original.id, nextSetCount: 2 }],
    { createSetId: () => "unused" }
  );

  assert.deepEqual(
    updated[0].sets.map((set) => set.id),
    ["row-1", "row-2"]
  );
  assert.deepEqual(original, historicalSession);
});

test("rejects a multi-set jump so programming changes remain incremental", () => {
  const original = exercise();

  assert.throws(
    () =>
      applyStrengthTemplateSetChanges(
        [original],
        [{ exerciseId: original.id, nextSetCount: 5 }],
        { createSetId: () => "unused" }
      ),
    /limited to one set/
  );
});
