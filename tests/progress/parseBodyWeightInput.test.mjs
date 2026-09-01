import assert from "node:assert/strict";
import test from "node:test";

import { parseBodyWeightInput } from "../../features/progress/utils/parseBodyWeightInput.ts";

test("parses integer and decimal body weights exactly", () => {
  assert.deepEqual(parseBodyWeightInput("196"), {
    status: "valid",
    weightLb: 196,
  });
  assert.deepEqual(parseBodyWeightInput("196.2"), {
    status: "valid",
    weightLb: 196.2,
  });
});

test("keeps blank weight optional and rejects malformed values", () => {
  assert.deepEqual(parseBodyWeightInput("  "), { status: "empty" });
  assert.deepEqual(parseBodyWeightInput("196,2"), { status: "invalid" });
  assert.deepEqual(parseBodyWeightInput("196.2.1"), { status: "invalid" });
  assert.deepEqual(parseBodyWeightInput("-1"), { status: "invalid" });
  assert.deepEqual(parseBodyWeightInput("0"), { status: "invalid" });
});
