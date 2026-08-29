import assert from "node:assert/strict";
import test from "node:test";

import { getProgressReviewPersonalRecords } from "../../features/progress/utils/getProgressReviewPersonalRecords.ts";
import { getProgressReviewPhotoComparison } from "../../features/progress/utils/getProgressReviewPhotoComparison.ts";

const period = {
  range: "4W",
  label: "Test period",
  startDate: "2026-02-01",
  endDate: "2026-02-28",
  inclusiveDayCount: 28,
};

function completedExercise(weight, reps) {
  return {
    id: crypto.randomUUID(),
    exerciseDefinitionId: "chest-press-machine",
    name: "Chest Press Machine",
    sets: [{ id: crypto.randomUUID(), weight, reps, completed: true }],
  };
}

function workout(id, completedAt, exercise) {
  return { id, workoutType: "Gym A", startedAt: completedAt, completedAt, exercises: [exercise] };
}

test("period PRs use earlier history as the comparison baseline", () => {
  const records = getProgressReviewPersonalRecords({
    workoutHistory: [
      workout("baseline", "2026-01-15T18:00:00", completedExercise(100, 10)),
      workout("pr", "2026-02-10T18:00:00", completedExercise(110, 10)),
      workout("repeat", "2026-02-20T18:00:00", completedExercise(105, 10)),
    ],
    exerciseDefinitions: [{
      id: "chest-press-machine", name: "Chest Press Machine", category: "Chest",
      movementRoles: ["HorizontalPush"], requiredEquipment: ["GymMachines"],
      sets: 3, repMin: 8, repMax: 12, increment: 5, progressionType: "Load",
      resistanceType: "Weight", performanceType: "Reps",
    }],
    period,
  });

  assert.equal(records.length, 1);
  assert.equal(records[0].workoutSessionId, "pr");
  assert.equal(records[0].achievedDate, "2026-02-10");
  assert.equal(records[0].previousEstimatedOneRepMax, 133);
  assert.equal(records[0].estimatedOneRepMax, 147);
});

test("photo comparison selects the earliest and latest eligible shared views", () => {
  const comparison = getProgressReviewPhotoComparison({
    checkIns: [
      { id: "before", date: "2026-01-20", photos: [{ view: "Front" }] },
      { id: "earlier", date: "2026-02-02", photos: [{ view: "Front" }, { view: "Side" }] },
      { id: "middle", date: "2026-02-12", photos: [{ view: "Back" }] },
      { id: "later", date: "2026-02-25", photos: [{ view: "Side" }, { view: "Front" }] },
    ],
    period,
  });

  assert.deepEqual(comparison, {
    earlierCheckInId: "earlier", earlierDate: "2026-02-02",
    laterCheckInId: "later", laterDate: "2026-02-25", sharedViews: ["Front", "Side"],
  });
});

test("photo comparison is absent without two check-ins sharing a view", () => {
  const comparison = getProgressReviewPhotoComparison({
    checkIns: [
      { id: "front", date: "2026-02-02", photos: [{ view: "Front" }] },
      { id: "back", date: "2026-02-25", photos: [{ view: "Back" }] },
    ],
    period,
  });

  assert.equal(comparison, null);
});
