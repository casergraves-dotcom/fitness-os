import assert from "node:assert/strict";
import test from "node:test";

import { compareReviewMoveCandidates } from "../../features/workout/logic/compareReviewMoveCandidates.ts";

const candidate = (optional, remainingLoad, preferencePenalty, date = "2026-09-11") => ({
  occurrence: {
    date: "2026-09-09",
    activity: { optional },
  },
  date,
  remainingLoad,
  preferencePenalty,
});

test("less training conflict outranks optional-session preference", () => {
  assert.ok(compareReviewMoveCandidates(candidate(false, 0, 0), candidate(true, 25, 0)) < 0);
});

test("with equal conflict reduction, moving optional work outranks required work", () => {
  assert.ok(compareReviewMoveCandidates(candidate(true, 0, 5), candidate(false, 0, 0)) < 0);
});

test("training-day preference breaks ties between equally safe optional moves", () => {
  assert.ok(compareReviewMoveCandidates(candidate(true, 0, 0), candidate(true, 0, 4)) < 0);
});
