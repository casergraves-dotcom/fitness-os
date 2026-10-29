import assert from "node:assert/strict";
import test from "node:test";

import { getPersistentPatternRecommendationInfluence } from "../../features/coach/getPersistentPatternRecommendationInfluence.ts";
import { getWeeklyDecisionPattern } from "../../features/coach/getWeeklyDecisionPattern.ts";

function decision(weekStartDate, finalShouldAdvance) {
  return {
    weekStartDate,
    weekType: "Progress",
    automaticStatus: finalShouldAdvance ? "Advance" : "Hold",
    automaticShouldAdvance: finalShouldAdvance,
    automaticReason: finalShouldAdvance
      ? "Weekly training adherence met the progression target."
      : "Weekly adherence was too low to progress safely.",
    automaticFactors: [],
    finalShouldAdvance,
    manuallyOverridden: false,
    decidedAt: `${weekStartDate}T12:00:00.000Z`,
  };
}

test("consecutive held reviews keep Guide within prescribed training scope", () => {
  const pattern = getWeeklyDecisionPattern([
    decision("2026-10-18", false),
    decision("2026-10-11", false),
  ]);

  assert.ok(pattern);

  const influence = getPersistentPatternRecommendationInfluence(pattern);

  assert.match(
    influence,
    /stay within today's prescribed scope rather than adding extra training volume/i,
  );
});

test("consecutive advances remain context without manufacturing extra volume", () => {
  const pattern = getWeeklyDecisionPattern([
    decision("2026-10-18", true),
    decision("2026-10-11", true),
  ]);

  assert.ok(pattern);

  assert.equal(
    getPersistentPatternRecommendationInfluence(pattern),
    null,
  );
});

test("a single completed review does not create a persistent pattern", () => {
  assert.equal(
    getWeeklyDecisionPattern([
      decision("2026-10-18", false),
    ]),
    null,
  );
});
