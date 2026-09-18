import assert from "node:assert/strict";
import test from "node:test";

import { applyTrainingActivityReschedule } from "../../features/workout/logic/applyTrainingActivityReschedule.ts";

const state = {
  trainingPlanId: "fitness-os-plan",
  startDate: "2026-09-13",
  activityReschedules: [{ trainingActivityId: "gym-a", originalDate: "2026-09-14", scheduledDate: "2026-09-15" }],
  adHocActivities: [
    { date: "2026-09-19", activity: { id: "ad-hoc-1", type: "Aerial", label: "Open Studio", optional: true }, createdAt: "2026-09-18T00:00:00Z" },
    { date: "2026-09-19", activity: { id: "ad-hoc-2", type: "Walk", label: "Extra Walk", optional: true }, createdAt: "2026-09-18T00:00:00Z" },
  ],
};

const move = (originalDate, scheduledDate) => applyTrainingActivityReschedule({
  state,
  trainingActivityId: "ad-hoc-1",
  originalDate,
  scheduledDate,
  rescheduledAt: "2026-09-18T12:00:00Z",
});

test("moves only the one-time activity, preserving its identity and the recurring schedule", () => {
  const next = move("2026-09-19", "2026-09-20");
  assert.equal(next.adHocActivities[0].date, "2026-09-20");
  assert.equal(next.adHocActivities[0].activity, state.adHocActivities[0].activity);
  assert.equal(next.adHocActivities[1], state.adHocActivities[1]);
  assert.equal(next.activityReschedules, state.activityReschedules);
  assert.equal(state.adHocActivities[0].date, "2026-09-19");
});

test("rejects a stale original date and invalid or pre-plan destinations", () => {
  assert.equal(move("2026-09-18", "2026-09-20"), state);
  assert.equal(move("2026-09-19", "2026-02-31"), state);
  assert.equal(move("2026-09-19", "2026-09-12"), state);
  assert.equal(move("2026-09-19", "2026-09-19"), state);
});
