import test from "node:test";
import assert from "node:assert/strict";

import { fitnessOsTrainingPlan } from "../../features/workout/trainingPlan.ts";
import {
  getRunningProgressionPrescriptionFromActivity,
  getWeeklyRunningProgressionUpdates,
} from "../../features/workout/logic/getWeeklyRunningProgressionUpdates.ts";

function getActivity(activityId) {
  for (const week of fitnessOsTrainingPlan.weeks) {
    for (const day of week.days) {
      const activity = day.activities.find((item) => item.id === activityId);
      if (activity) return activity;
    }
  }
  return null;
}

test("every ramp run belongs to a canonical progression role", () => {
  const rampRuns = fitnessOsTrainingPlan.weeks
    .filter((week) => week.weekType === "Ramp")
    .flatMap((week) => week.days)
    .flatMap((day) => day.activities)
    .filter((activity) => activity.type === "Run");

  assert.ok(rampRuns.length > 0);
  assert.ok(rampRuns.every((activity) => activity.runProgressionRole));
});

test("a ramp activity produces a complete retained prescription", () => {
  const firstRampRun = getActivity("week-1-wednesday-run");
  assert.ok(firstRampRun);

  const retainedPrescription =
    getRunningProgressionPrescriptionFromActivity(firstRampRun);

  assert.deepEqual(retainedPrescription, {
    role: "Development",
    label: "Run / Walk",
    intensity: "Intervals",
    durationMin: 20,
    durationMax: 20,
    runIntervalMinutes: 2,
    walkIntervalMinutes: 2,
    note: undefined,
  });
});

test("a completed strong ramp run earns the next development prescription", () => {
  const updates = getWeeklyRunningProgressionUpdates("2026-09-13", [
    {
      id: "run-week-1",
      startedAt: "2026-09-16T17:00:00.000Z",
      completedAt: "2026-09-16T17:22:00.000Z",
      durationMinutes: 20,
      rpe: 6,
      intensity: "Intervals",
      prescribedLabel: "Run / Walk",
      prescribedDurationMin: 20,
      prescribedDurationMax: 20,
      prescribedRunIntervalMinutes: 2,
      prescribedWalkIntervalMinutes: 2,
      prescribedRunProgressionRole: "Development",
      scheduledActivityId: "week-1-wednesday-run",
      scheduledDate: "2026-09-16",
    },
  ]);

  assert.deepEqual(updates.Development, {
    role: "Development",
    label: "Development Intervals",
    intensity: "Intervals",
    durationMin: 25,
    durationMax: 25,
    runIntervalMinutes: 3,
    walkIntervalMinutes: 2,
    note: "Alternate 3 minutes running with 2 minutes easy recovery for the prescribed duration.",
  });
});

test("a week without a completed run produces no earned progression update", () => {
  assert.deepEqual(getWeeklyRunningProgressionUpdates("2026-09-13", []), {});
});
