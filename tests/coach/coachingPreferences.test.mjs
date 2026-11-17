import test from "node:test";
import assert from "node:assert/strict";

import {
  getCoachingPreferencePriority,
  normalizeCoachingPreferences,
} from "../../features/coach/coachingPreferences.ts";
import {
  getActivityBarrierGuidance,
  getActivityBarrierPrompt,
} from "../../features/coach/getActivityBarrierGuidance.ts";

test("legacy coaching preferences default to balanced training emphasis", () => {
  const preferences = normalizeCoachingPreferences({
    focus: "Consistency",
    adjustmentStyle: "Balanced",
    checkInPrompt: "Daily",
    modalityBalance: {
      strength: "Standard",
      running: "Standard",
      activeHobbies: "Standard",
    },
  });

  assert.equal(preferences.trainingEmphasis, "Balanced");
});

test("aerial emphasis affects active-hobby ranking without boosting strength or running", () => {
  const preferences = normalizeCoachingPreferences({
    focus: "Balanced",
    trainingEmphasis: "Aerial",
    adjustmentStyle: "Balanced",
    checkInPrompt: "Daily",
    modalityBalance: {
      strength: "Standard",
      running: "Standard",
      activeHobbies: "Standard",
    },
  });

  assert.equal(getCoachingPreferencePriority(preferences, "activeHobbies"), 2);
  assert.equal(getCoachingPreferencePriority(preferences, "strength"), 0);
  assert.equal(getCoachingPreferencePriority(preferences, "running"), 0);
});

test("legacy coaching preferences safely default motivation feedback to empty", () => {
  const preferences = normalizeCoachingPreferences({
    focus: "Balanced",
  });

  assert.deepEqual(preferences.activityBarrierFeedback, []);
});

test("valid motivation feedback is preserved while malformed records are ignored", () => {
  const preferences = normalizeCoachingPreferences({
    activityBarrierFeedback: [
      {
        activityId: "run-walk",
        activityLabel: "Run / Walk",
        reason: "Scheduling",
        recordedAt: "2026-11-16T12:00:00.000Z",
      },
      {
        activityId: "invalid",
        reason: "AssumedLazy",
      },
    ],
  });

  assert.equal(preferences.activityBarrierFeedback.length, 1);
  assert.equal(preferences.activityBarrierFeedback[0].reason, "Scheduling");
});

test("motivation prompt appears only for a repeated concrete blocker", () => {
  const pattern = {
    label: "Second repeat",
    message: "Repeated",
    consecutiveReviewCount: 2,
    repeatedProgramWeekCount: 2,
    finalShouldAdvance: false,
    recurringBlocker: {
      activityId: "run-walk",
      label: "Run / Walk",
      type: "Run",
    },
  };

  assert.equal(
    getActivityBarrierPrompt({ ...pattern, consecutiveReviewCount: 1, repeatedProgramWeekCount: 1 }, []),
    null
  );
  assert.equal(getActivityBarrierPrompt(pattern, [])?.activityId, "run-walk");
});

test("declining the optional question suppresses repeat prompting", () => {
  const prompt = getActivityBarrierPrompt(
    {
      label: "Second repeat",
      message: "Repeated",
      consecutiveReviewCount: 2,
      finalShouldAdvance: false,
      recurringBlocker: {
        activityId: "run-walk",
        label: "Run / Walk",
        type: "Run",
      },
    },
    [{
      activityId: "run-walk",
      activityLabel: "Run / Walk",
      reason: "NotNow",
      recordedAt: "2026-11-16T12:00:00.000Z",
    }]
  );

  assert.equal(prompt, null);
  assert.match(getActivityBarrierGuidance("Fatigue"), /Recovery/);
});
