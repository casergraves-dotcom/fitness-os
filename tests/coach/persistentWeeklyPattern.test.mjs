import assert from "node:assert/strict";
import test from "node:test";

import { getPersistentPatternRecommendationInfluence } from "../../features/coach/getPersistentPatternRecommendationInfluence.ts";
import { getWeeklyDecisionPattern } from "../../features/coach/getWeeklyDecisionPattern.ts";

function decision(weekStartDate, finalShouldAdvance, automaticDriver, details = {}) {
  return {
    weekStartDate,
    weekType: "Progress",
    automaticStatus: finalShouldAdvance ? "Advance" : "Hold",
    automaticShouldAdvance: finalShouldAdvance,
    automaticReason: finalShouldAdvance
      ? "Weekly training adherence met the progression target."
      : "Weekly adherence was too low to progress safely.",
    automaticDriver,
    automaticFactors: [],
    finalShouldAdvance,
    manuallyOverridden: false,
    decidedAt: `${weekStartDate}T12:00:00.000Z`,
    ...details,
  };
}

function repeatedProgressWeek(weekStartDate, missedActivityId = "week-3-wednesday-run") {
  return decision(weekStartDate, false, "Adherence", {
    programWeekId: "week-3",
    programWeekNumber: 3,
    programWeekName: "Progress",
    missedRequiredActivities: [
      {
        activityId: missedActivityId,
        label: "Run / Walk",
        type: "Run",
        scheduledDate: weekStartDate,
      },
    ],
  });
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

test("repeated recovery holds produce recovery-specific guidance", () => {
  const pattern = getWeeklyDecisionPattern([
    decision("2026-10-18", false, "Recovery"),
    decision("2026-10-11", false, "Recovery"),
  ]);

  assert.equal(pattern?.limitingDriver, "Recovery");
  assert.match(
    getPersistentPatternRecommendationInfluence(pattern),
    /recovery constrained the last 2 weekly reviews/i,
  );
});

test("repeated adherence holds produce adherence-specific guidance", () => {
  const pattern = getWeeklyDecisionPattern([
    decision("2026-10-18", false, "Adherence"),
    decision("2026-10-11", false, "Adherence"),
  ]);

  assert.equal(pattern?.limitingDriver, "Adherence");
  assert.match(
    getPersistentPatternRecommendationInfluence(pattern),
    /focus on today's prescribed session/i,
  );
});

test("mixed or overridden decisions do not invent a repeated driver", () => {
  const mixed = getWeeklyDecisionPattern([
    decision("2026-10-18", false, "Recovery"),
    decision("2026-10-11", false, "Adherence"),
  ]);
  const overriddenLatest = {
    ...decision("2026-10-18", false, "Recovery"),
    manuallyOverridden: true,
  };
  const overridden = getWeeklyDecisionPattern([
    overriddenLatest,
    decision("2026-10-11", false, "Recovery"),
  ]);

  assert.equal(mixed?.limitingDriver, undefined);
  assert.equal(overridden?.limitingDriver, undefined);
});

test("strength-quality patterns influence strength days only", () => {
  const pattern = getWeeklyDecisionPattern([
    decision("2026-10-18", false, "StrengthQuality"),
    decision("2026-10-11", false, "StrengthQuality"),
  ]);

  assert.match(
    getPersistentPatternRecommendationInfluence(pattern, ["Strength"]),
    /completing today's prescribed working sets with controlled effort/i,
  );
  assert.equal(
    getPersistentPatternRecommendationInfluence(pattern, ["Run"]),
    null,
  );
});

test("running-load patterns influence run days only", () => {
  const pattern = getWeeklyDecisionPattern([
    decision("2026-10-18", false, "RunningLoad"),
    decision("2026-10-11", false, "RunningLoad"),
  ]);

  assert.match(
    getPersistentPatternRecommendationInfluence(pattern, ["Run"]),
    /without adding distance or intensity/i,
  );
  assert.equal(
    getPersistentPatternRecommendationInfluence(pattern, ["Strength"]),
    null,
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

test("the first structured hold is identified as the first program-week repeat", () => {
  const pattern = getWeeklyDecisionPattern([
    repeatedProgressWeek("2026-10-18"),
  ]);

  assert.equal(pattern?.repeatLevel, "FirstRepeat");
  assert.equal(pattern?.repeatedProgramWeekCount, 1);
  assert.equal(pattern?.programWeekId, "week-3");
  assert.equal(pattern?.recurringBlocker?.label, "Run / Walk");
});

test("the same phase and blocker escalate through second and persistent repeats", () => {
  const second = getWeeklyDecisionPattern([
    repeatedProgressWeek("2026-10-25"),
    repeatedProgressWeek("2026-10-18"),
  ]);
  const third = getWeeklyDecisionPattern([
    repeatedProgressWeek("2026-11-01"),
    repeatedProgressWeek("2026-10-25"),
    repeatedProgressWeek("2026-10-18"),
  ]);

  assert.equal(second?.repeatLevel, "SecondRepeat");
  assert.equal(second?.recurringBlocker?.activityId, "week-3-wednesday-run");
  assert.equal(third?.repeatLevel, "PersistentRepeat");
  assert.equal(third?.repeatedProgramWeekCount, 3);
  assert.match(third?.message ?? "", /incomplete in each review/i);
});

test("holds from a different program phase do not inflate the repeat count", () => {
  const earlierPhase = repeatedProgressWeek("2026-10-18");
  earlierPhase.programWeekId = "week-2";
  earlierPhase.programWeekNumber = 2;
  earlierPhase.programWeekName = "Consistency";

  const pattern = getWeeklyDecisionPattern([
    repeatedProgressWeek("2026-10-25"),
    earlierPhase,
  ]);

  assert.equal(pattern?.repeatLevel, "FirstRepeat");
  assert.equal(pattern?.repeatedProgramWeekCount, 1);
});

test("an intentional manual repeat is preserved without inventing a blocker", () => {
  const intentional = repeatedProgressWeek("2026-10-18");
  intentional.automaticShouldAdvance = true;
  intentional.automaticStatus = "Advance";
  intentional.manuallyOverridden = true;

  const pattern = getWeeklyDecisionPattern([intentional]);

  assert.equal(pattern?.intentionalRepeat, true);
  assert.equal(pattern?.recurringBlocker, undefined);
  assert.match(pattern?.message ?? "", /repeating by choice/i);
});
