import assert from "node:assert/strict";
import test from "node:test";

import { workoutTemplates } from "../../features/workout/data.ts";
import { getWorkoutVolumeAudit } from "../../features/workout/getWorkoutVolumeAudit.ts";

test("audits actual template sets and rep ranges", () => {
  const gymA = getWorkoutVolumeAudit(workoutTemplates["Gym A"]);

  assert.equal(gymA.totalSets, 19);
  assert.equal(gymA.primarySets, 11);
  assert.equal(gymA.accessorySets, 8);
  assert.equal(gymA.reviewCount, 0);

  const legPress = gymA.rows.find((row) => row.name === "Leg Press");
  assert.ok(legPress);
  assert.equal(legPress.role, "Primary");
  assert.equal(legPress.repRange, "8–12 reps");
  assert.deepEqual(legPress.directMuscles, ["Quads", "Glutes"]);
});

test("keeps direct and secondary pressing work distinct", () => {
  const gymA = getWorkoutVolumeAudit(workoutTemplates["Gym A"]);
  const chestPress = gymA.rows.find((row) => row.name === "Chest Press Machine");

  assert.ok(chestPress);
  assert.deepEqual(chestPress.directMuscles, ["Chest"]);
  assert.deepEqual(chestPress.secondaryMuscles, ["Triceps", "Front Delts"]);
});

test("reports the current total-volume difference between templates", () => {
  assert.equal(getWorkoutVolumeAudit(workoutTemplates["Gym B"]).totalSets, 18);
  assert.equal(getWorkoutVolumeAudit(workoutTemplates["Gym C"]).totalSets, 21);
});
