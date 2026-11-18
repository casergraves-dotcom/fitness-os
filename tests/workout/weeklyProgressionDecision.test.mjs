import test from "node:test";
import assert from "node:assert/strict";

import { evaluateWeeklyAdherence } from "../../features/workout/logic/evaluateWeeklyAdherence.ts";
import { getWeeklyProgressionDecision } from "../../features/workout/logic/getWeeklyProgressionDecision.ts";
import { getWeeklyEvaluationReadiness } from "../../features/workout/logic/getWeeklyEvaluationReadiness.ts";
import { fitnessOsTrainingPlan } from "../../features/workout/trainingPlan.ts";

const WEEK_START_DATE = "2026-09-06";

const rampWeek = fitnessOsTrainingPlan.weeks.find(
  (week) => week.id === "week-2"
);

assert.ok(rampWeek, "Ramp Week 2 should exist in the canonical plan");

const requiredActivities = [
  {
    id: "week-2-monday-gym-a",
    date: "2026-09-07",
    type: "Strength",
    label: "Gym A",
  },
  {
    id: "week-2-wednesday-run",
    date: "2026-09-09",
    type: "Run",
    label: "Run / Walk",
  },
  {
    id: "week-2-friday-gym-b",
    date: "2026-09-11",
    type: "Strength",
    label: "Gym B",
  },
  {
    id: "week-2-saturday-walk",
    date: "2026-09-12",
    type: "Walk",
    label: "Long Walk / Hike",
  },
];

function completion(activity) {
  return {
    id: `completion-${activity.id}`,
    date: activity.date,
    trainingActivityId: activity.id,
    type: activity.type,
    label: activity.label,
    completedAt: `${activity.date}T18:00:00.000Z`,
  };
}

function evaluate(completedActivityIds) {
  const completions = requiredActivities
    .filter((activity) => completedActivityIds.includes(activity.id))
    .map(completion);

  const adherence = evaluateWeeklyAdherence(
    rampWeek,
    WEEK_START_DATE,
    completions
  );

  assert.ok(adherence);

  return {
    adherence,
    decision: getWeeklyProgressionDecision(adherence),
  };
}

test("a fully completed ramp week advances", () => {
  const { adherence, decision } = evaluate(
    requiredActivities.map((activity) => activity.id)
  );

  assert.equal(adherence.requiredCount, 4);
  assert.equal(adherence.requiredCompleted, 4);
  assert.equal(adherence.adherenceRate, 1);
  assert.equal(decision.status, "Advance");
  assert.equal(decision.shouldAdvance, true);
  assert.equal(decision.completedStrengthCount, 2);
  assert.equal(decision.domainOutcomes.strength.status, "InsufficientEvidence");
  assert.equal(decision.domainOutcomes.cardio.status, "InsufficientEvidence");
});

test("missing only Run / Walk advances with a warning when the other required work is complete", () => {
  const { adherence, decision } = evaluate([
    "week-2-monday-gym-a",
    "week-2-friday-gym-b",
    "week-2-saturday-walk",
  ]);

  assert.equal(adherence.requiredCompleted, 3);
  assert.equal(adherence.adherenceRate, 0.75);
  assert.equal(decision.status, "AdvanceWithWarning");
  assert.equal(decision.shouldAdvance, true);
  assert.equal(decision.completedStrengthCount, 2);
  assert.deepEqual(decision.domainOutcomes.cardio, {
    status: "Maintain",
    scheduledCount: 2,
    completedCount: 1,
    missedActivityIds: ["week-2-wednesday-run"],
    reason:
      "Cardio remains at its current level because 1 of 2 required sessions were completed.",
  });
});

test("missing Run / Walk and Long Walk / Hike repeats the ramp week at 50% adherence", () => {
  const { adherence, decision } = evaluate([
    "week-2-monday-gym-a",
    "week-2-friday-gym-b",
  ]);

  assert.equal(adherence.requiredCompleted, 2);
  assert.equal(adherence.adherenceRate, 0.5);
  assert.equal(decision.status, "Hold");
  assert.equal(decision.shouldAdvance, false);
  assert.equal(decision.limitingDriver, "Adherence");
  assert.equal(decision.domainOutcomes.strength.status, "InsufficientEvidence");
  assert.equal(decision.domainOutcomes.cardio.status, "Maintain");
});

test("a cardio-driven repeat preserves supported strength progression evidence", () => {
  const completions = requiredActivities
    .filter((activity) => activity.type === "Strength")
    .map(completion);
  const adherence = evaluateWeeklyAdherence(
    rampWeek,
    WEEK_START_DATE,
    completions
  );

  assert.ok(adherence);

  const decision = getWeeklyProgressionDecision(adherence, null, {
    status: "Supported",
    sessionCount: 2,
    prescribedSetCount: 36,
    fullPrescriptionSetCount: 36,
    completedSetCount: 36,
    completionRate: 1,
    fullDoseCompletionRate: 1,
    fullSessionCount: 2,
    validShortenedSessionCount: 0,
    substantialPartialSessionCount: 0,
    minimalSessionCount: 0,
    ratedSetCount: 0,
    highEffortSetCount: 0,
    factor: "Two full strength sessions were reviewed.",
  });

  assert.equal(decision.status, "Hold");
  assert.equal(decision.domainOutcomes.strength.status, "Progress");
  assert.equal(decision.domainOutcomes.cardio.status, "Maintain");
});

test("meeting 75% adherence does not advance when the minimum strength requirement is missed", () => {
  const { adherence, decision } = evaluate([
    "week-2-monday-gym-a",
    "week-2-wednesday-run",
    "week-2-saturday-walk",
  ]);

  assert.equal(adherence.adherenceRate, 0.75);
  assert.equal(decision.completedStrengthCount, 1);
  assert.equal(decision.requiredStrengthCount, 2);
  assert.equal(decision.status, "Hold");
  assert.equal(decision.shouldAdvance, false);
  assert.equal(decision.limitingDriver, "Adherence");
  assert.equal(decision.domainOutcomes.strength.status, "Maintain");
  assert.deepEqual(
    decision.domainOutcomes.strength.missedActivityIds,
    ["week-2-friday-gym-b"]
  );
});

test("supportive detailed evidence marks completed strength and cardio ready to progress", () => {
  const completions = requiredActivities.map(completion);
  const adherence = evaluateWeeklyAdherence(
    rampWeek,
    WEEK_START_DATE,
    completions
  );

  assert.ok(adherence);

  const decision = getWeeklyProgressionDecision(
    adherence,
    null,
    {
      status: "Supported",
      sessionCount: 2,
      prescribedSetCount: 36,
      completedSetCount: 36,
      completionRate: 1,
      ratedSetCount: 0,
      highEffortSetCount: 0,
      factor: "Two complete strength sessions were reviewed.",
    },
    {
      status: "Supportive",
      scheduledRunCount: 1,
      completedRunCount: 1,
      evaluatedRunCount: 1,
      totalDurationMinutes: 25,
      averageDurationCompletionRate: 1,
      averageRpe: 6,
      factor: "The scheduled run met its prescription.",
    }
  );

  assert.equal(decision.domainOutcomes.strength.status, "Progress");
  assert.equal(decision.domainOutcomes.cardio.status, "Progress");
  assert.deepEqual(decision.domainOutcomes.strength.missedActivityIds, []);
  assert.deepEqual(decision.domainOutcomes.cardio.missedActivityIds, []);
});

test("an intentionally shortened strength session is explained as reduced dose", () => {
  const completions = requiredActivities.map(completion);
  const adherence = evaluateWeeklyAdherence(
    rampWeek,
    WEEK_START_DATE,
    completions
  );

  assert.ok(adherence);

  const decision = getWeeklyProgressionDecision(adherence, null, {
    status: "Limited",
    sessionCount: 2,
    prescribedSetCount: 28,
    fullPrescriptionSetCount: 36,
    completedSetCount: 28,
    completionRate: 1,
    fullDoseCompletionRate: 28 / 36,
    fullSessionCount: 1,
    validShortenedSessionCount: 1,
    substantialPartialSessionCount: 0,
    minimalSessionCount: 0,
    ratedSetCount: 0,
    highEffortSetCount: 0,
    factor: "One full and one shortened session were reviewed.",
  });

  assert.equal(decision.status, "AdvanceWithWarning");
  assert.match(decision.reason, /intentionally shortened/i);
  assert.match(decision.reason, /reduced training dose/i);
});

test("a minimal session is not described as equivalent to full strength work", () => {
  const completions = requiredActivities.map(completion);
  const adherence = evaluateWeeklyAdherence(
    rampWeek,
    WEEK_START_DATE,
    completions
  );

  assert.ok(adherence);

  const decision = getWeeklyProgressionDecision(adherence, null, {
    status: "Poor",
    sessionCount: 2,
    prescribedSetCount: 36,
    fullPrescriptionSetCount: 36,
    completedSetCount: 10,
    completionRate: 10 / 36,
    fullDoseCompletionRate: 10 / 36,
    fullSessionCount: 0,
    validShortenedSessionCount: 0,
    substantialPartialSessionCount: 1,
    minimalSessionCount: 1,
    ratedSetCount: 0,
    highEffortSetCount: 0,
    factor: "Partial strength work was reviewed.",
  });

  assert.equal(decision.status, "Hold");
  assert.match(decision.reason, /minimal strength session/i);
  assert.match(decision.reason, /attendance credit/i);
});

test("a required activity moved across the week boundary is not missed before its new date passes", () => {
  const adherence = evaluateWeeklyAdherence(
    rampWeek,
    WEEK_START_DATE,
    requiredActivities
      .filter((activity) => activity.id !== "week-2-wednesday-run")
      .map(completion)
  );

  assert.ok(adherence);

  const movedRun = adherence.activities.find(
    (item) => item.activity.id === "week-2-wednesday-run"
  );
  assert.ok(movedRun);
  movedRun.date = "2026-09-13";

  assert.deepEqual(
    getWeeklyEvaluationReadiness(adherence, "2026-09-13"),
    {
      ready: false,
      latestOutstandingRequirementDate: "2026-09-13",
    }
  );

  assert.deepEqual(
    getWeeklyEvaluationReadiness(adherence, "2026-09-14"),
    {
      ready: true,
      latestOutstandingRequirementDate: "2026-09-13",
    }
  );
});

test("completion on a cross-week destination date allows evaluation without an extra-day delay", () => {
  const adherence = evaluateWeeklyAdherence(
    rampWeek,
    WEEK_START_DATE,
    requiredActivities.map(completion)
  );

  assert.ok(adherence);

  const movedRun = adherence.activities.find(
    (item) => item.activity.id === "week-2-wednesday-run"
  );
  assert.ok(movedRun);
  movedRun.date = "2026-09-13";

  assert.deepEqual(
    getWeeklyEvaluationReadiness(adherence, "2026-09-13"),
    {
      ready: true,
      latestOutstandingRequirementDate: null,
    }
  );
});
