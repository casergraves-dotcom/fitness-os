import assert from "node:assert/strict";
import test from "node:test";

import { getProgressReviewPersonalRecords } from "../../features/progress/utils/getProgressReviewPersonalRecords.ts";
import { getProgressReviewPhotoComparison } from "../../features/progress/utils/getProgressReviewPhotoComparison.ts";
import { partitionProgressReviewObservations } from "../../features/progress/utils/partitionProgressReviewObservations.ts";
import { getPersonalRecordObservations } from "../../features/progress/utils/getPersonalRecordObservations.ts";

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

test("ramp-up sets do not affect estimated-strength personal records", () => {
  const current = completedExercise(95, 10);
  current.rampUpSets = [
    { id: crypto.randomUUID(), weight: 500, reps: 20, completed: true },
  ];

  const records = getProgressReviewPersonalRecords({
    workoutHistory: [
      workout("baseline", "2026-01-15T18:00:00", completedExercise(100, 10)),
      workout("current", "2026-02-10T18:00:00", current),
    ],
    exerciseDefinitions: [{
      id: "chest-press-machine", name: "Chest Press Machine", category: "Chest",
      movementRoles: ["HorizontalPush"], requiredEquipment: ["GymMachines"],
      sets: 3, repMin: 8, repMax: 12, increment: 5, progressionType: "Load",
      resistanceType: "Weight", performanceType: "Reps",
    }],
    period,
  });

  assert.equal(records.length, 0);
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

test("milestones, PRs, and photo comparisons are separated from trend summaries", () => {
  const observations = [
    { type: "Strength", message: "Strength remained stable." },
    { type: "PersonalRecord", message: "Leg Press reached a new best." },
    { type: "Milestone", message: "A weight milestone was reached." },
    { type: "Recovery", message: "Recovery was stable." },
    { type: "ProgressPhoto", message: "Two photo check-ins can be compared." },
  ];

  const result = partitionProgressReviewObservations(observations);

  assert.deepEqual(result.highlights.map(({ type }) => type), [
    "PersonalRecord", "Milestone", "ProgressPhoto",
  ]);
  assert.deepEqual(result.summary.map(({ type }) => type), [
    "Strength", "Recovery",
  ]);
});

test("PR highlights show only the latest achievement for each exercise", () => {
  const observations = getPersonalRecordObservations([
    {
      exerciseName: "Leg Press", estimatedOneRepMax: 350,
      previousEstimatedOneRepMax: 336, improvement: 14,
      workoutSessionId: "older-leg-press", achievedDate: "2026-10-23",
    },
    {
      exerciseName: "Shoulder Press Machine", estimatedOneRepMax: 116,
      previousEstimatedOneRepMax: 111, improvement: 5,
      workoutSessionId: "shoulder-press", achievedDate: "2026-10-26",
    },
    {
      exerciseName: "Leg Press", estimatedOneRepMax: 364,
      previousEstimatedOneRepMax: 350, improvement: 14,
      workoutSessionId: "latest-leg-press", achievedDate: "2026-10-26",
    },
  ]);

  assert.equal(observations.length, 2);
  assert.match(observations[0].message, /Shoulder Press Machine/);
  assert.match(observations[1].message, /364 lb/);
  assert.doesNotMatch(observations[1].message, /350 lb on/);
});
