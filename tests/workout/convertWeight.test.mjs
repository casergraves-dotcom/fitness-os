import assert from "node:assert/strict";
import test from "node:test";

import {
  kilogramsToPounds,
  poundsToKilograms,
  roundConvertedWeight,
} from "../../features/workout/utils/convertWeight.ts";

test("converts kilograms to pounds using the canonical factor", () => {
  assert.equal(roundConvertedWeight(kilogramsToPounds(40)), 88.18);
});

test("converts pounds to kilograms using the canonical factor", () => {
  assert.equal(roundConvertedWeight(poundsToKilograms(100)), 45.36);
});

test("supports decimal inputs in both directions", () => {
  assert.equal(roundConvertedWeight(kilogramsToPounds(12.5)), 27.56);
  assert.equal(roundConvertedWeight(poundsToKilograms(88.2)), 40.01);
});

test("rounding does not snap to gym equipment increments", () => {
  assert.equal(roundConvertedWeight(kilogramsToPounds(40)), 88.18);
  assert.notEqual(roundConvertedWeight(kilogramsToPounds(40)), 90);
});
