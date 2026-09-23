import test from "node:test";
import assert from "node:assert/strict";

import { applyStrengthProgrammingRecommendation } from "../../features/workout/logic/strengthProgrammingRecommendation.ts";

function template() {
  return [
    {
      id: "gym-b-pulldown",
      exerciseDefinitionId: "lat-pulldown",
      name: "Lat Pulldown",
      prescribedSetCount: 3,
      sets: [
        { id: "pull-1", weight: 100, reps: 10, completed: false },
        { id: "pull-2", weight: 100, reps: 10, completed: false },
        { id: "pull-3", weight: 100, reps: 10, completed: false },
      ],
    },
  ];
}

function recommendation() {
  return {
    id: "recommendation-1",
    profileVersion: 1,
    createdAt: "2026-09-22T12:00:00.000Z",
    summary: "Add one pulling set to support the current strength block.",
    reassessAfterCompletedStrengthSessions: 6,
    changes: [
      {
        exerciseId: "gym-b-pulldown",
        exerciseName: "Lat Pulldown",
        currentSetCount: 3,
        proposedSetCount: 4,
        reason: "Recent full sessions support a small volume increase.",
      },
    ],
  };
}

test("cannot apply a programming recommendation without explicit approval", () => {
  assert.throws(
    () =>
      applyStrengthProgrammingRecommendation(template(), recommendation(), {
        approved: false,
        createSetId: () => "new-set",
      }),
    /explicit approval/
  );
});

test("approved recommendations preserve identity and apply their explained change", () => {
  const updated = applyStrengthProgrammingRecommendation(
    template(),
    recommendation(),
    {
      approved: true,
      createSetId: () => "new-set",
    }
  );

  assert.equal(updated[0].exerciseDefinitionId, "lat-pulldown");
  assert.deepEqual(
    updated[0].sets.map((set) => set.id),
    ["pull-1", "pull-2", "pull-3", "new-set"]
  );
});

test("rejects stale recommendations when the template changed after review", () => {
  const changedTemplate = template();
  changedTemplate[0].sets.pop();

  assert.throws(
    () =>
      applyStrengthProgrammingRecommendation(
        changedTemplate,
        recommendation(),
        { approved: true, createSetId: () => "new-set" }
      ),
    /stale/
  );
});

test("rejects recommendations without a reason or reassessment point", () => {
  const missingReason = recommendation();
  missingReason.changes[0].reason = "";

  assert.throws(
    () =>
      applyStrengthProgrammingRecommendation(template(), missingReason, {
        approved: true,
        createSetId: () => "new-set",
      }),
    /missing a reason/
  );

  const missingReassessment = recommendation();
  missingReassessment.reassessAfterCompletedStrengthSessions = 0;

  assert.throws(
    () =>
      applyStrengthProgrammingRecommendation(template(), missingReassessment, {
        approved: true,
        createSetId: () => "new-set",
      }),
    /reassessment point/
  );
});
