import assert from "node:assert/strict";
import test from "node:test";

import { removeAdHocTrainingActivity } from "../../features/workout/logic/removeAdHocTrainingActivity.ts";

const state = {
  trainingPlanId: "fitness-os-plan",
  startDate: "2026-09-13",
  activityReschedules: [{ trainingActivityId: "gym-a", originalDate: "2026-09-14", scheduledDate: "2026-09-15" }],
  adHocActivities: [
    { date: "2026-09-19", activity: { id: "ad-hoc-1", type: "Aerial", label: "Open Studio" }, createdAt: "2026-09-18T00:00:00Z" },
    { date: "2026-09-19", activity: { id: "ad-hoc-2", type: "Walk", label: "Extra Walk" }, createdAt: "2026-09-18T00:00:00Z" },
  ],
};

test("removes exactly one dated addition without changing plan or other schedule overlays", () => {
  const next = removeAdHocTrainingActivity(state, "ad-hoc-1");
  assert.deepEqual(next.adHocActivities.map((item) => item.activity.id), ["ad-hoc-2"]);
  assert.equal(next.trainingPlanId, state.trainingPlanId);
  assert.equal(next.activityReschedules, state.activityReschedules);
  assert.equal(state.adHocActivities.length, 2);
});

test("does not remove an activity from the recurring plan", () => {
  assert.equal(removeAdHocTrainingActivity(state, "gym-a"), state);
});
