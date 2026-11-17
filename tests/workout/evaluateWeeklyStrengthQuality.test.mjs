import assert from "node:assert/strict";
import test from "node:test";

import { evaluateWeeklyStrengthQuality } from "../../features/workout/logic/evaluateWeeklyStrengthQuality.ts";

const WEEK_START = "2026-11-15";

function exercise(id, prescribedSetCount, completedSetCount) {
  return {
    id,
    name: id,
    prescribedSetCount,
    sets: Array.from({ length: completedSetCount }, (_, index) => ({
      id: `${id}-${index + 1}`,
      weight: 100,
      reps: 10,
      completed: true,
      rpe: 7,
    })),
  };
}

function session({
  id,
  exercises,
  prescribedExerciseCount,
  prescribedWorkingSetCount,
  fullPrescriptionWorkingSetCount = prescribedWorkingSetCount,
  intentionallyReduced = false,
  variantType = "FullGym",
}) {
  return {
    id,
    workoutType: "Gym A",
    variantType,
    startedAt: "2026-11-16T10:00:00.000Z",
    completedAt: "2026-11-16T11:00:00.000Z",
    scheduledDate: "2026-11-16",
    exercises,
    prescriptionSnapshot: {
      prescribedExerciseCount,
      prescribedWorkingSetCount,
      fullPrescriptionWorkingSetCount,
      intentionallyReduced,
    },
  };
}

test("full strength prescriptions provide supported weekly evidence", () => {
  const result = evaluateWeeklyStrengthQuality(WEEK_START, [
    session({
      id: "full",
      exercises: [exercise("squat", 3, 3), exercise("row", 3, 3)],
      prescribedExerciseCount: 2,
      prescribedWorkingSetCount: 6,
    }),
  ]);

  assert.equal(result.status, "Supported");
  assert.equal(result.fullSessionCount, 1);
  assert.equal(result.fullDoseCompletionRate, 1);
});

test("a completed shortened session earns completion but not full-dose progression evidence", () => {
  const result = evaluateWeeklyStrengthQuality(WEEK_START, [
    session({
      id: "short",
      exercises: [exercise("squat", 2, 2), exercise("row", 2, 2)],
      prescribedExerciseCount: 2,
      prescribedWorkingSetCount: 4,
      fullPrescriptionWorkingSetCount: 6,
      intentionallyReduced: true,
      variantType: "ShortGym",
    }),
  ]);

  assert.equal(result.status, "Limited");
  assert.equal(result.validShortenedSessionCount, 1);
  assert.match(result.factor, /1 intentionally shortened/);
  assert.equal(result.completionRate, 1);
  assert.equal(result.fullDoseCompletionRate, 4 / 6);
});

test("substantial partial work remains limited rather than fully supported", () => {
  const result = evaluateWeeklyStrengthQuality(WEEK_START, [
    session({
      id: "partial",
      exercises: [exercise("squat", 3, 3), exercise("row", 3, 3)],
      prescribedExerciseCount: 4,
      prescribedWorkingSetCount: 10,
    }),
  ]);

  assert.equal(result.status, "Limited");
  assert.equal(result.substantialPartialSessionCount, 1);
  assert.match(result.factor, /1 substantial partial/);
  assert.equal(result.fullDoseCompletionRate, 0.6);
});

test("a single completed exercise cannot masquerade as a complete strength week", () => {
  const result = evaluateWeeklyStrengthQuality(WEEK_START, [
    session({
      id: "minimal",
      exercises: [exercise("leg-press", 3, 3)],
      prescribedExerciseCount: 7,
      prescribedWorkingSetCount: 19,
    }),
  ]);

  assert.equal(result.status, "Poor");
  assert.equal(result.minimalSessionCount, 1);
  assert.match(result.factor, /1 minimal/);
  assert.equal(result.prescribedSetCount, 19);
  assert.equal(result.completedSetCount, 3);
});
