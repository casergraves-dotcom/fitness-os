import assert from "node:assert/strict";
import test from "node:test";

import { parseDailyStepInput } from "../../features/dailyActivity/utils/parseDailyStepInput.ts";

test("parses four and five digit step totals exactly", () => {
  assert.deepEqual(parseDailyStepInput("9200"), {
    status: "valid",
    steps: 9200,
  });
  assert.deepEqual(parseDailyStepInput("12345"), {
    status: "valid",
    steps: 12345,
  });
});

test("treats blank input separately from invalid input", () => {
  assert.deepEqual(parseDailyStepInput("  "), { status: "empty" });
  assert.deepEqual(parseDailyStepInput("9,200"), { status: "invalid" });
  assert.deepEqual(parseDailyStepInput("9200.5"), { status: "invalid" });
  assert.deepEqual(parseDailyStepInput("-1"), { status: "invalid" });
});

test("rejects integers that cannot be persisted exactly", () => {
  assert.deepEqual(
    parseDailyStepInput(String(Number.MAX_SAFE_INTEGER + 1)),
    { status: "invalid" }
  );
});
