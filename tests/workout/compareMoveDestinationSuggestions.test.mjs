import assert from "node:assert/strict";
import test from "node:test";

import { compareMoveDestinationSuggestions } from "../../features/workout/logic/compareMoveDestinationSuggestions.ts";

const suggestion = (level, preferencePenalty, otherActivityCount, date = "2026-09-11") => ({
  level, preferencePenalty, otherActivityCount, date,
});

test("a safer date outranks a preferred but conflicting date", () => {
  assert.ok(compareMoveDestinationSuggestions(suggestion(0, 2, 0), suggestion(2, 0, 0)) < 0);
});

test("training-day preference breaks ties between equally safe dates", () => {
  assert.ok(compareMoveDestinationSuggestions(suggestion(0, 0, 2), suggestion(0, 2, 0)) < 0);
});

test("less occupied date breaks ties after safety and preference", () => {
  assert.ok(compareMoveDestinationSuggestions(suggestion(0, 0, 0), suggestion(0, 0, 1)) < 0);
});
