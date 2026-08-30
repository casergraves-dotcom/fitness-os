import assert from "node:assert/strict";
import test from "node:test";

import { exerciseLibrary } from "../../features/workout/exerciseLibrary.ts";
import { getExerciseSubstitutions } from "../../features/workout/exerciseSubstitutions.ts";
import { getEnabledTrainingModalitiesForDate } from "../../features/workout/logic/getTrainingParticipationPreferenceForDate.ts";

const gymContext = {
  environment: "Gym",
  availableEquipment: ["Bodyweight", "YogaMat", "ResistanceBands", "PullUpBar", "Dumbbells", "Barbell", "BarbellRack", "WeightPlate", "Bench", "GymMachines"],
  availableCapabilities: ["FloorSpace", "HighAnchor", "LowAnchor", "DoorAnchor", "PullUpBarInstalled"],
};

function substitutionsFor(exerciseId, context = gymContext, limit = 20) {
  return getExerciseSubstitutions(exerciseId, exerciseLibrary, context, limit);
}

function idsFor(exerciseId, context = gymContext) {
  return substitutionsFor(exerciseId, context).map((option) => option.exercise.id);
}

test("participation preferences are effective-dated and preserve earlier schedules", () => {
  const history = [{
    effectiveDate: "2026-08-27",
    enabledModalities: ["Strength", "Run"],
    createdAt: "2026-08-27T08:00:00.000Z",
    updatedAt: "2026-08-27T08:00:00.000Z",
  }];

  assert.deepEqual(getEnabledTrainingModalitiesForDate(history, "2026-08-26"), [
    "Strength", "Run", "Aerial",
  ]);
  assert.deepEqual(getEnabledTrainingModalitiesForDate(history, "2026-08-27"), [
    "Strength", "Run",
  ]);
});

test("every automatic substitution preserves a movement role and has complete metadata", () => {
  for (const source of exerciseLibrary) {
    for (const option of substitutionsFor(source.id)) {
      assert.ok(option.sharedRoles.length > 0, `${source.id} -> ${option.exercise.id}`);
      assert.notEqual(option.exercise.repMin, undefined, option.exercise.id);
      assert.notEqual(option.exercise.repMax, undefined, option.exercise.id);
      assert.notEqual(option.exercise.increment, undefined, option.exercise.id);
      assert.notEqual(option.exercise.resistanceType, undefined, option.exercise.id);
      assert.notEqual(option.exercise.performanceType, undefined, option.exercise.id);
    }
  }
});

test("knee-flexion substitutions exclude hip hinges", () => {
  const ids = idsFor("leg-curl");
  assert.deepEqual(ids, ["lying-leg-curl", "band-leg-curl"]);
  assert.ok(!ids.includes("dumbbell-rdl"));
  assert.ok(!ids.includes("romanian-deadlift"));
});

test("squat substitutions exclude hip-extension isolation", () => {
  const ids = idsFor("leg-press");
  assert.ok(ids.includes("barbell-squat"));
  assert.ok(!ids.includes("glute-bridge"));
  assert.ok(!ids.includes("hip-thrust-machine"));
  assert.ok(!ids.includes("glute-kickback-machine"));
});

test("hip extension ranks equivalents before labeled fallbacks", () => {
  const options = substitutionsFor("glute-bridge");
  assert.equal(options[0].exercise.id, "hip-thrust-machine");
  assert.equal(options[0].relationship, "Equivalent");
  assert.equal(options[1].exercise.id, "glute-kickback-machine");
  assert.equal(options[1].relationship, "Fallback");
});

test("core substitutions remain within their specific movement patterns", () => {
  assert.deepEqual(idsFor("cable-woodchop"), ["band-woodchop"]);
  assert.deepEqual(idsFor("ab-crunch-machine"), ["cable-crunch"]);
  assert.deepEqual(idsFor("hanging-leg-raise"), ["lying-leg-raise"]);
  const plankIds = idsFor("plank");
  assert.ok(plankIds.includes("dead-bug"));
  assert.ok(!plankIds.includes("cable-crunch"));
  assert.ok(!plankIds.includes("lying-leg-raise"));
});

test("active-workout exercises are excluded from recommendations", () => {
  const ids = idsFor("seated-row", { ...gymContext, unavailableExerciseIds: ["cable-row", "barbell-row"] });
  assert.ok(!ids.includes("cable-row"));
  assert.ok(!ids.includes("barbell-row"));
  assert.ok(ids.includes("one-arm-dumbbell-row"));
});

const representativeFamilies = [
  ["Squat", "leg-press", "hack-squat-pendulum-squat"],
  ["SquatGlute", "leg-press", "barbell-squat"],
  ["HipExtension", "glute-bridge", "hip-thrust-machine"],
  ["KneeFlexion", "leg-curl", "lying-leg-curl"],
  ["HipHinge", "dumbbell-rdl", "romanian-deadlift"],
  ["HorizontalPush", "chest-press-machine", "dumbbell-chest-press"],
  ["HorizontalPull", "seated-row", "cable-row"],
  ["VerticalPush", "shoulder-press-machine", "dumbbell-shoulder-press"],
  ["VerticalPull", "lat-pulldown", "assisted-pull-up"],
  ["HipStability", "hip-abductor", "side-lying-hip-abduction"],
  ["Adduction", "hip-adductor", "side-lying-hip-adduction"],
  ["CoreRotation", "cable-woodchop", "band-woodchop"],
  ["CoreFlexion", "ab-crunch-machine", "cable-crunch"],
  ["CoreStability", "plank", "dead-bug"],
  ["CoreHipFlexion", "hanging-leg-raise", "lying-leg-raise"],
  ["ChestIsolation", "chest-fly", "cable-fly"],
  ["ShoulderAbduction", "lateral-raise-machine", "dumbbell-lateral-raise"],
  ["RearShoulder", "reverse-pec-deck", "cable-face-pull"],
  ["ElbowFlexion", "biceps-curl-machine", "dumbbell-curl"],
  ["ElbowExtension", "triceps-press-machine", "cable-pressdown"],
  ["CalfRaise", "calf-raise", "standing-calf-raise-machine"],
];

test("every movement family has a representative same-role substitution", () => {
  for (const [role, sourceId, expectedId] of representativeFamilies) {
    const option = substitutionsFor(sourceId).find(
      (candidate) => candidate.exercise.id === expectedId
    );

    assert.ok(option, `${role}: expected ${sourceId} -> ${expectedId}`);
    assert.ok(option.sharedRoles.includes(role), `${sourceId} -> ${expectedId}`);
  }
});

test("equipment and setup availability filter otherwise valid candidates", () => {
  const limitedHomeContext = {
    environment: "Home",
    availableEquipment: ["Bodyweight", "YogaMat", "ResistanceBands"],
    availableCapabilities: ["FloorSpace"],
  };

  const rowIds = idsFor("seated-row", limitedHomeContext);
  assert.ok(rowIds.includes("band-row"));
  assert.ok(rowIds.includes("backpack-row"));
  assert.ok(!rowIds.includes("cable-row"));
  assert.ok(!rowIds.includes("one-arm-dumbbell-row"));

  const pullIds = idsFor("lat-pulldown", limitedHomeContext);
  assert.ok(!pullIds.includes("band-pulldown"));
});

test("canonical exercise identities and programming metadata are complete", () => {
  const ids = exerciseLibrary.map((exercise) => exercise.id);
  const names = exerciseLibrary.map((exercise) => exercise.name);

  assert.equal(new Set(ids).size, ids.length, "exercise IDs must be unique");
  assert.equal(new Set(names).size, names.length, "exercise names must be unique");

  for (const exercise of exerciseLibrary) {
    assert.ok(exercise.sets > 0, `${exercise.id}: sets`);
    assert.ok(exercise.repMin > 0, `${exercise.id}: repMin`);
    assert.ok(exercise.repMax >= exercise.repMin, `${exercise.id}: rep range`);
    assert.notEqual(exercise.increment, undefined, `${exercise.id}: increment`);
    assert.ok(exercise.progressionType, `${exercise.id}: progressionType`);
    assert.ok(exercise.resistanceType, `${exercise.id}: resistanceType`);
    assert.ok(exercise.performanceType, `${exercise.id}: performanceType`);
    assert.ok(exercise.requiredEquipment?.length > 0, `${exercise.id}: equipment`);
    assert.ok(exercise.movementRoles?.length > 0, `${exercise.id}: movement role`);
  }
});

test("unilateral exercises explicitly record repetitions per side", () => {
  const unilateralIds = [
    "reverse-lunge",
    "one-arm-dumbbell-row",
    "side-lying-hip-abduction",
    "side-lying-hip-adduction",
    "band-woodchop",
    "glute-kickback-machine",
  ];

  for (const exerciseId of unilateralIds) {
    const exercise = exerciseLibrary.find((candidate) => candidate.id === exerciseId);
    assert.equal(exercise?.repCounting, "PerSide", exerciseId);
  }
});
