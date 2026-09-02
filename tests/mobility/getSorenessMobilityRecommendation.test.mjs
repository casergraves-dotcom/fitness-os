import assert from "node:assert/strict";
import test from "node:test";

import { getSorenessMobilityRecommendation } from "../../features/mobility/getSorenessMobilityRecommendation.ts";

function ratings(upper, lower) {
  return {
    Energy: 4,
    Sleep: 4,
    Mood: 4,
    Stress: 2,
    UpperBodySoreness: upper,
    LowerBodySoreness: lower,
  };
}

test("does not manufacture a soreness recommendation from low ratings", () => {
  assert.equal(getSorenessMobilityRecommendation(ratings(2, 2)), null);
});

test("uses full-body recovery when both regions are noticeably sore", () => {
  assert.equal(
    getSorenessMobilityRecommendation(ratings(3, 4))?.routineId,
    "full-body-recovery"
  );
});

test("keeps upper- and lower-body suggestions distinct", () => {
  assert.equal(
    getSorenessMobilityRecommendation(ratings(4, 1))?.routineId,
    "post-aerial"
  );
  assert.equal(
    getSorenessMobilityRecommendation(ratings(1, 4))?.routineId,
    "post-run"
  );
});
