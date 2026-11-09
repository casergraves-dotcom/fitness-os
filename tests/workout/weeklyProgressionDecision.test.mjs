import test from "node:test";
import assert from "node:assert/strict";

import { evaluateWeeklyAdherence } from "../../features/workout/logic/evaluateWeeklyAdherence.ts";
import { getWeeklyProgressionDecision } from "../../features/workout/logic/getWeeklyProgressionDecision.ts";
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
});
