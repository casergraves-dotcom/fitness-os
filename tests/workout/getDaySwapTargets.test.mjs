import assert from "node:assert/strict";
import test from "node:test";

import { getDaySwapTargets } from "../../features/workout/logic/getDaySwapTargets.ts";

const moving = { date: "2026-09-09", originalDate: "2026-09-09", activity: { id: "run", type: "Run" } };
const target = (id, placementSource) => ({
  date: "2026-09-10",
  originalDate: "2026-09-10",
  activity: { id, type: "Aerial" },
  placementSource,
});

test("group swap includes every flexible, unfinished destination activity", () => {
  const first = target("walk");
  const second = target("mobility");
  const result = getDaySwapTargets([moving, first, second], "2026-09-10", moving, []);
  assert.deepEqual(result.targets, [first, second]);
  assert.equal(result.blockedBy, null);
});

test("group swap cannot silently leave a completed activity behind", () => {
  const result = getDaySwapTargets([moving, target("walk"), target("done")], "2026-09-10", moving,
    [{ trainingActivityId: "done", date: "2026-09-10" }]);
  assert.deepEqual(result.targets, []);
  assert.equal(result.blockedBy, "Completed");
});

test("group swap cannot move a fixed aerial commitment", () => {
  const result = getDaySwapTargets([moving, target("walk"), target("lyra", "FixedAerialCommitment")],
    "2026-09-10", moving, []);
  assert.deepEqual(result.targets, []);
  assert.equal(result.blockedBy, "FixedCommitment");
});
