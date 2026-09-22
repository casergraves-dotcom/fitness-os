import test from "node:test";
import assert from "node:assert/strict";

import {
  getCoachingPreferencePriority,
  normalizeCoachingPreferences,
} from "../../features/coach/coachingPreferences.ts";

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
