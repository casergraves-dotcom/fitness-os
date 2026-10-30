import assert from "node:assert/strict";
import test from "node:test";

import { getExerciseTarget } from "../../features/workout/getExerciseTarget.ts";
import {
  adjustWorkoutRestTimer,
  createWorkoutRestTimer,
  getExerciseRestDurationSeconds,
  getRestTimerRemainingSeconds,
  hasRemainingWorkingSetAfter,
  pauseWorkoutRestTimer,
  resumeWorkoutRestTimer,
} from "../../features/workout/logic/restTimer.ts";
import {
  normalizeWorkoutPreferences,
} from "../../features/workout/workoutPreferences.ts";

const definition = {
  id: "chest-press-machine",
  name: "Chest Press Machine",
  category: "Chest",
  sets: 3,
  repMin: 8,
  repMax: 12,
  increment: 5,
  progressionType: "Load",
  resistanceType: "Weight",
  performanceType: "Reps",
};

function previousExercise(sets, rampUpSets) {
  return {
    id: "previous-chest-press",
    exerciseDefinitionId: definition.id,
    name: definition.name,
    prescribedSetCount: 3,
    rampUpSets,
    sets: sets.map(([weight, reps, completed = true], index) => ({
      id: `set-${index}`,
      weight,
      reps,
      completed,
    })),
  };
}

test("same-load working sets carry the same load forward", () => {
  const target = getExerciseTarget(definition, previousExercise([[145, 10], [145, 10], [145, 10]]));
  assert.equal(target.action, "build-reps");
  assert.equal(target.targetWeight, 145);
});

test("rest countdown remains timestamp-based across elapsed background time", () => {
  const timer = createWorkoutRestTimer({
    durationSeconds: 120,
    now: 1_000_000,
  });

  assert.equal(getRestTimerRemainingSeconds(timer, 1_045_000), 75);
  assert.equal(getRestTimerRemainingSeconds(timer, 1_130_000), 0);
});

test("rest countdown can pause, resume, and adjust without losing time", () => {
  const timer = createWorkoutRestTimer({
    durationSeconds: 120,
    now: 1_000_000,
  });
  const paused = pauseWorkoutRestTimer(timer, 1_030_000);
  const adjusted = adjustWorkoutRestTimer(paused, 30, 1_060_000);
  const resumed = resumeWorkoutRestTimer(adjusted, 1_090_000);

  assert.equal(paused.pausedRemainingSeconds, 90);
  assert.equal(adjusted.pausedRemainingSeconds, 120);
  assert.equal(getRestTimerRemainingSeconds(resumed, 1_120_000), 90);
});

test("rest defaults use canonical exercise metadata", () => {
  assert.equal(getExerciseRestDurationSeconds({
    ...definition,
    movementRoles: ["HorizontalPush"],
  }), 150);
  assert.equal(getExerciseRestDurationSeconds({
    ...definition,
    id: "plank",
    category: "Core",
    movementRoles: ["CoreStability"],
    resistanceType: "None",
  }), 60);
  assert.equal(getExerciseRestDurationSeconds({
    ...definition,
    id: "push-up",
    movementRoles: ["HorizontalPush"],
    resistanceType: "None",
  }), 90);
  assert.equal(getExerciseRestDurationSeconds({
    ...definition,
    id: "lateral-raise-machine",
    category: "Shoulders",
    movementRoles: ["ShoulderAbduction"],
  }), 75);
});

test("rest starts between working sets but not after the final set", () => {
  const sets = [
    { id: "set-1", weight: 100, reps: 10, completed: false },
    { id: "set-2", weight: 100, reps: 10, completed: false },
    { id: "set-3", weight: 100, reps: 10, completed: false },
  ];

  assert.equal(hasRemainingWorkingSetAfter(sets, "set-1"), true);
  assert.equal(hasRemainingWorkingSetAfter(sets, "set-2"), true);
  assert.equal(hasRemainingWorkingSetAfter(sets, "set-3"), false);
});

test("saved rest preferences override defaults without changing classification", () => {
  const preferences = normalizeWorkoutPreferences({
    restDurations: {
      heavyCompoundSeconds: 180,
      moderateCompoundSeconds: 105,
      isolationSeconds: 60,
      coreSeconds: 45,
      bodyweightSeconds: 75,
    },
  });

  assert.equal(getExerciseRestDurationSeconds({
    ...definition,
    movementRoles: ["HorizontalPush"],
  }, preferences), 180);
  assert.equal(getExerciseRestDurationSeconds({
    ...definition,
    category: "Core",
  }, preferences), 45);
});

test("rest preferences migrate missing and unsafe values conservatively", () => {
  const preferences = normalizeWorkoutPreferences({
    restDurations: {
      heavyCompoundSeconds: 999,
      isolationSeconds: 10,
    },
  });

  assert.equal(preferences.restDurations.heavyCompoundSeconds, 600);
  assert.equal(preferences.restDurations.isolationSeconds, 30);
  assert.equal(preferences.restDurations.coreSeconds, 60);
  assert.equal(preferences.restDurations.bodyweightSeconds, 90);
});

test("a lone lighter first set does not become the progression baseline", () => {
  const target = getExerciseTarget(definition, previousExercise([[115, 12], [145, 10], [145, 10]]));
  assert.equal(target.action, "build-reps");
  assert.equal(target.targetWeight, 145);
  assert.equal(target.label, "145 lb × 8–12");
  assert.match(target.message, /mixed loads/);
});

test("the latest completed load breaks a tie between different loads", () => {
  const target = getExerciseTarget(definition, previousExercise([[135, 10], [140, 10], [145, 10]]));
  assert.equal(target.targetWeight, 145);
});

test("top-of-range working sets increase the representative load", () => {
  const target = getExerciseTarget(definition, previousExercise([[145, 12], [145, 12], [145, 12]]));
  assert.equal(target.action, "increase-load");
  assert.equal(target.targetWeight, 150);
});

test("top-of-range reduced prescription holds until a full session confirms progression", () => {
  const exercise = previousExercise([[145, 12], [145, 12]]);
  exercise.prescribedSetCount = 2;

  const target = getExerciseTarget(definition, exercise);

  assert.equal(target.action, "confirm-full-session");
  assert.equal(target.targetWeight, 145);
  assert.equal(target.label, "145 lb × 8–12");
  assert.match(target.message, /Strong reduced session/i);
  assert.match(target.message, /normal 3-set prescription/i);
});

test("reduced prescription remains complete evidence for building reps at the same load", () => {
  const exercise = previousExercise([[145, 12], [145, 10]]);
  exercise.prescribedSetCount = 2;

  const target = getExerciseTarget(definition, exercise);

  assert.equal(target.action, "build-reps");
  assert.equal(target.targetWeight, 145);
});

test("reduced top-range session can progress when a recent full session proved the same target", () => {
  const reducedExercise = previousExercise([[145, 12], [145, 12]]);
  reducedExercise.prescribedSetCount = 2;
  const recentFullExercise = previousExercise([[145, 12], [145, 12], [145, 12]]);

  const target = getExerciseTarget(definition, reducedExercise, {
    recentFullExercise,
  });

  assert.equal(target.action, "increase-load");
  assert.equal(target.targetWeight, 150);
});

test("full-session evidence at a different load does not progress a reduced session", () => {
  const reducedExercise = previousExercise([[150, 12], [150, 12]]);
  reducedExercise.prescribedSetCount = 2;
  const recentFullExercise = previousExercise([[145, 12], [145, 12], [145, 12]]);

  const target = getExerciseTarget(definition, reducedExercise, {
    recentFullExercise,
  });

  assert.equal(target.action, "confirm-full-session");
  assert.equal(target.targetWeight, 150);
});

test("incomplete exercises retain the representative completed load", () => {
  const target = getExerciseTarget(definition, previousExercise([[115, 12], [145, 10], [145, 0, false]]));
  assert.equal(target.action, "insufficient-data");
  assert.equal(target.targetWeight, 145);
});

test("separate ramp-up sets never affect the working-load baseline", () => {
  const target = getExerciseTarget(
    definition,
    previousExercise(
      [[145, 10], [145, 10], [145, 10]],
      [{ id: "ramp", weight: 115, reps: 12, completed: true }]
    )
  );
  assert.equal(target.targetWeight, 145);
});
