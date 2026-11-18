import assert from "node:assert/strict";
import test from "node:test";

import {
  isRecoveryCompatibleTrainingType,
} from "../../features/coach/isRecoveryCompatibleTrainingType.ts";

test("recovery choices retain gentle walking and mobility", () => {
  assert.equal(isRecoveryCompatibleTrainingType("Walk"), true);
  assert.equal(isRecoveryCompatibleTrainingType("Mobility"), true);
  assert.equal(isRecoveryCompatibleTrainingType("Recovery"), true);
  assert.equal(isRecoveryCompatibleTrainingType("Rest"), true);
});

test("recovery choices exclude future training stress", () => {
  assert.equal(isRecoveryCompatibleTrainingType("Strength"), false);
  assert.equal(isRecoveryCompatibleTrainingType("Run"), false);
  assert.equal(isRecoveryCompatibleTrainingType("Aerial"), false);
});
