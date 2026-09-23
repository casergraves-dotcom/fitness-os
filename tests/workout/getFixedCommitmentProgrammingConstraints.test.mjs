import test from "node:test";
import assert from "node:assert/strict";

import { getFixedCommitmentProgrammingConstraints } from "../../features/workout/logic/getFixedCommitmentProgrammingConstraints.ts";

function schedule(date, activities, fixedActivityId) {
  return {
    date,
    trainingDay: { activities },
    activityContexts: fixedActivityId
      ? {
          [fixedActivityId]: {
            originalDate: date,
            placementSource: "FixedAerialCommitment",
          },
        }
      : {},
  };
}

test("fixed aerial adjacent to a selected workout constrains pulling fatigue", () => {
  const constraints = getFixedCommitmentProgrammingConstraints("Gym B", [
    schedule("2026-09-24", [{ id: "aerial", type: "Aerial" }], "aerial"),
    schedule("2026-09-25", [
      { id: "gym-b", type: "Strength", strengthWorkout: "Gym B" },
    ]),
  ]);

  assert.ok(constraints.includes("VerticalPull"));
  assert.ok(constraints.includes("HorizontalPull"));
  assert.ok(constraints.includes("RearShoulder"));
});

test("flexible aerial and distant fixed aerial do not constrain the workout", () => {
  const constraints = getFixedCommitmentProgrammingConstraints("Gym A", [
    schedule("2026-09-20", [
      { id: "gym-a", type: "Strength", strengthWorkout: "Gym A" },
    ]),
    schedule("2026-09-21", [{ id: "flex-aerial", type: "Aerial" }]),
    schedule("2026-09-24", [{ id: "fixed-aerial", type: "Aerial" }], "fixed-aerial"),
  ]);

  assert.deepEqual(constraints, []);
});
