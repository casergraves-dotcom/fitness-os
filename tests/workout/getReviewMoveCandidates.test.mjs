import assert from "node:assert/strict";
import test from "node:test";

import { getReviewMoveCandidates } from "../../features/workout/logic/getReviewMoveCandidates.ts";

const strength = {
  date: "2026-09-09",
  originalDate: "2026-09-09",
  activity: { id: "gym", type: "Strength", label: "Gym A" },
};
const aerial = {
  date: "2026-09-10",
  originalDate: "2026-09-10",
  placementSource: "FixedAerialCommitment",
  activity: { id: "lyra", type: "Aerial", label: "Lyra class" },
};
const adjacency = [{ first: { date: strength.date, activity: strength.activity },
  second: { date: aerial.date, activity: aerial.activity },
  kind: "StrengthAerialAdjacency", severity: "Caution", reason: "Adjacent load" }];
const weekDates = ["2026-09-07", "2026-09-08", "2026-09-09", "2026-09-10", "2026-09-11", "2026-09-12"];

test("review considers an unfinished strength session next to fixed aerial", () => {
  const candidates = getReviewMoveCandidates(adjacency, [strength, aerial], [], weekDates, "2026-09-08");
  assert.equal(candidates.some((candidate) => candidate.occurrence.activity.id === "gym" && candidate.date === "2026-09-11"), true);
  assert.equal(candidates.some((candidate) => candidate.occurrence.activity.id === "lyra"), false);
});

test("review never moves completed activities", () => {
  const candidates = getReviewMoveCandidates(adjacency, [strength, aerial], [
    { trainingActivityId: "gym", date: "2026-09-09" },
  ], weekDates, "2026-09-08");
  assert.deepEqual(candidates, []);
});

test("review never suggests a past destination", () => {
  const candidates = getReviewMoveCandidates(adjacency, [strength, aerial], [], weekDates, "2026-09-11");
  assert.deepEqual(candidates.map((candidate) => candidate.date), ["2026-09-11", "2026-09-12"]);
});
