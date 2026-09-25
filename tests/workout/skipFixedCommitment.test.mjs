import test from "node:test";
import assert from "node:assert/strict";

import { applyTrainingActivityAdjustment } from "../../features/workout/logic/applyTrainingActivityAdjustment.ts";

function state() {
  return {
    trainingPlanId: "fitness-os-default",
    startDate: "2026-09-06",
    trainingParticipationPreferences: [{
      effectiveDate: "2026-09-06",
      enabledModalities: ["Strength", "Run", "Aerial"],
      aerialSessions: [{
        id: "thursday-lyra",
        day: "Thursday",
        sessionType: "Class",
        name: "Lyra L1/L2",
        constraint: "Fixed",
      }],
      createdAt: "2026-09-06T08:00:00.000Z",
      updatedAt: "2026-09-06T08:00:00.000Z",
    }],
  };
}

test("skipping a canceled fixed class records only that occurrence", () => {
  const nextState = applyTrainingActivityAdjustment({
    state: state(),
    trainingActivityId: "week-1-tuesday-aerial",
    originalDate: "2026-09-08",
    action: "Skip",
    skipReason: "ClassCanceled",
    adjustedAt: "2026-09-09T12:00:00.000Z",
  });

  assert.equal(nextState.activityAdjustments.length, 1);
  assert.equal(nextState.activityAdjustments[0].trainingActivityId, "week-1-tuesday-aerial");
  assert.equal(nextState.activityAdjustments[0].originalDate, "2026-09-08");
  assert.equal(nextState.activityAdjustments[0].action, "Skip");
  assert.equal(nextState.activityAdjustments[0].skipReason, "ClassCanceled");
  assert.equal(
    nextState.activityAdjustments.some(
      (adjustment) => adjustment.originalDate === "2026-09-15"
    ),
    false
  );
});

test("changing the one-week skip reason replaces the audit detail", () => {
  const first = applyTrainingActivityAdjustment({
    state: state(),
    trainingActivityId: "aerial",
    originalDate: "2026-09-08",
    action: "Skip",
    skipReason: "CannotAttend",
    adjustedAt: "2026-09-07T12:00:00.000Z",
  });
  const second = applyTrainingActivityAdjustment({
    state: first,
    trainingActivityId: "aerial",
    originalDate: "2026-09-08",
    action: "Skip",
    skipReason: "ClassCanceled",
    adjustedAt: "2026-09-07T13:00:00.000Z",
  });

  assert.equal(second.activityAdjustments.length, 1);
  assert.equal(second.activityAdjustments[0].skipReason, "ClassCanceled");
});
