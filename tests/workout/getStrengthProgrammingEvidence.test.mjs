import test from "node:test";
import assert from "node:assert/strict";

import { getStrengthProgrammingEvidence } from "../../features/workout/logic/getStrengthProgrammingEvidence.ts";

function session(id, workoutType, variantType, completed = true) {
  return {
    id,
    workoutType,
    variantType,
    startedAt: "2026-09-01T12:00:00.000Z",
    completedAt: completed ? "2026-09-01T13:00:00.000Z" : undefined,
    exercises: [],
  };
}

function decision(id, workoutType, baseline, appliedAt) {
  return {
    id,
    workoutType,
    completedFullSessionsAtApplication: baseline,
    appliedAt,
    recommendation: {
      id: `${id}-recommendation`,
      profileVersion: 1,
      createdAt: appliedAt,
      summary: "Reviewed change",
      changes: [],
      reassessAfterCompletedStrengthSessions: 6,
    },
  };
}

test("counts only completed full sessions for the selected workout", () => {
  const evidence = getStrengthProgrammingEvidence(
    "Gym A",
    [
      session("full", "Gym A", "FullGym"),
      session("legacy-full", "Gym A", undefined),
      session("short", "Gym A", "ShortGym"),
      session("home", "Gym A", "Home"),
      session("incomplete", "Gym A", "FullGym", false),
      session("other", "Gym B", "FullGym"),
    ],
    []
  );

  assert.equal(evidence.completedFullSessionsTotal, 2);
  assert.equal(evidence.completedFullSessionsSinceDecision, 2);
});

test("counts only evidence collected after the latest applied decision", () => {
  const evidence = getStrengthProgrammingEvidence(
    "Gym B",
    Array.from({ length: 7 }, (_, index) =>
      session(`session-${index}`, "Gym B", "FullGym")
    ),
    [
      decision("older", "Gym B", 2, "2026-08-01T12:00:00.000Z"),
      decision("latest", "Gym B", 5, "2026-09-01T12:00:00.000Z"),
      decision("other", "Gym A", 7, "2026-09-02T12:00:00.000Z"),
    ]
  );

  assert.equal(evidence.latestDecision.id, "latest");
  assert.equal(evidence.completedFullSessionsTotal, 7);
  assert.equal(evidence.completedFullSessionsSinceDecision, 2);
});

test("never reports negative evidence after history cleanup", () => {
  const evidence = getStrengthProgrammingEvidence(
    "Gym C",
    [session("remaining", "Gym C", "FullGym")],
    [decision("applied", "Gym C", 3, "2026-09-01T12:00:00.000Z")]
  );

  assert.equal(evidence.completedFullSessionsSinceDecision, 0);
});
