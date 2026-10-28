import assert from "node:assert/strict";
import test from "node:test";

import { workoutTemplates } from "../../features/workout/data.ts";
import {
  getWorkoutRotationVolumeAudit,
  getWorkoutVolumeAudit,
} from "../../features/workout/getWorkoutVolumeAudit.ts";

test("audits actual template sets and rep ranges", () => {
  const gymA = getWorkoutVolumeAudit(workoutTemplates["Gym A"], undefined, "Gym A");

  assert.equal(gymA.totalSets, 19);
  assert.equal(gymA.primarySets, 11);
  assert.equal(gymA.accessorySets, 8);
  assert.equal(gymA.requiredSets, 15);
  assert.equal(gymA.supportSets, 4);
  assert.equal(gymA.reviewCount, 0);

  const legPress = gymA.rows.find((row) => row.name === "Leg Press");
  assert.ok(legPress);
  assert.equal(legPress.role, "Primary");
  assert.equal(legPress.repRange, "8–12 reps");
  assert.equal(legPress.intent, "Required");
  assert.equal(legPress.prescriptionFocus, "Strength + muscle");
  assert.deepEqual(legPress.directMuscles, ["Quads", "Glutes"]);
});

test("keeps direct and secondary pressing work distinct", () => {
  const gymA = getWorkoutVolumeAudit(workoutTemplates["Gym A"], undefined, "Gym A");
  const chestPress = gymA.rows.find((row) => row.name === "Chest Press Machine");

  assert.ok(chestPress);
  assert.deepEqual(chestPress.directMuscles, ["Chest"]);
  assert.deepEqual(chestPress.secondaryMuscles, ["Triceps", "Front Delts"]);
});

test("reports the current total-volume difference between templates", () => {
  assert.equal(getWorkoutVolumeAudit(workoutTemplates["Gym B"]).totalSets, 18);
  assert.equal(getWorkoutVolumeAudit(workoutTemplates["Gym C"]).totalSets, 21);
});

test("aggregates direct sets, secondary exposure, and direct rep ranges", () => {
  const gymA = getWorkoutVolumeAudit(workoutTemplates["Gym A"], undefined, "Gym A");
  const chest = gymA.muscleVolume.find((row) => row.muscle === "Chest");
  const triceps = gymA.muscleVolume.find((row) => row.muscle === "Triceps");
  const quads = gymA.muscleVolume.find((row) => row.muscle === "Quads");

  assert.deepEqual(chest, {
    muscle: "Chest",
    directSets: 3,
    secondarySets: 0,
    repRanges: ["8–12 reps"],
  });
  assert.deepEqual(triceps, {
    muscle: "Triceps",
    directSets: 0,
    secondarySets: 5,
    repRanges: [],
  });
  assert.deepEqual(quads, {
    muscle: "Quads",
    directSets: 3,
    secondarySets: 0,
    repRanges: ["8–12 reps"],
  });
});

test("separates required movement volume from support work", () => {
  const gymB = getWorkoutVolumeAudit(workoutTemplates["Gym B"], undefined, "Gym B");
  const biceps = gymB.rows.find((row) => row.name === "Biceps Curl Machine");
  const legCurl = gymB.rows.find((row) => row.name === "Seated Leg Curl");

  assert.equal(gymB.requiredSets, 12);
  assert.equal(gymB.supportSets, 6);
  assert.equal(biceps?.intent, "Support");
  assert.equal(biceps?.prescriptionFocus, "Higher-rep support");
  assert.equal(legCurl?.intent, "Required");
});

test("summarizes direct muscle volume across the full A/B/C rotation", () => {
  const rotation = getWorkoutRotationVolumeAudit(workoutTemplates);
  const chest = rotation.muscleVolume.find((row) => row.muscle === "Chest");
  const hamstrings = rotation.muscleVolume.find((row) => row.muscle === "Hamstrings");

  assert.equal(rotation.totalSets, 58);
  assert.equal(chest?.directSets, 9);
  assert.equal(chest?.directSessionCount, 3);
  assert.deepEqual(chest?.repRanges, ["8–12 reps"]);
  assert.equal(hamstrings?.directSets, 9);
  assert.equal(hamstrings?.directSessionCount, 3);
  assert.equal(hamstrings?.secondarySets, 0);
});
