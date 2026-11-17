import assert from "node:assert/strict";
import test from "node:test";

import { evaluateStrengthSessionCompletion } from "../../features/workout/logic/evaluateStrengthSessionCompletion.ts";

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
    })),
  };
}

function session({
  exercises,
  prescribedExerciseCount,
  prescribedWorkingSetCount,
  fullPrescriptionWorkingSetCount = prescribedWorkingSetCount,
  intentionallyReduced = false,
  variantType = "FullGym",
}) {
  return {
    id: "session",
    workoutType: "Gym A",
    variantType,
    startedAt: "2026-11-16T10:00:00.000Z",
    completedAt: "2026-11-16T11:00:00.000Z",
    exercises,
    prescriptionSnapshot: {
      prescribedExerciseCount,
      prescribedWorkingSetCount,
      fullPrescriptionWorkingSetCount,
      intentionallyReduced,
    },
  };
}

test("classifies the fully completed planned prescription as a full session", () => {
  const result = evaluateStrengthSessionCompletion(
    session({
      exercises: [exercise("squat", 3, 3), exercise("row", 3, 3)],
      prescribedExerciseCount: 2,
      prescribedWorkingSetCount: 6,
    }),
  );

  assert.equal(result.classification, "FullSession");
  assert.equal(result.workingSetCompletionRate, 1);
});

test("distinguishes a completed intentional reduction from a full session", () => {
  const result = evaluateStrengthSessionCompletion(
    session({
      exercises: [exercise("squat", 2, 2), exercise("row", 2, 2)],
      prescribedExerciseCount: 2,
      prescribedWorkingSetCount: 4,
      fullPrescriptionWorkingSetCount: 6,
      intentionallyReduced: true,
      variantType: "ShortGym",
    }),
  );

  assert.equal(result.classification, "ValidShortenedSession");
  assert.equal(result.workingSetCompletionRate, 1);
});

test("recognizes substantial partial work only with meaningful set and exercise coverage", () => {
  const result = evaluateStrengthSessionCompletion(
    session({
      exercises: [exercise("squat", 3, 3), exercise("row", 3, 3)],
      prescribedExerciseCount: 4,
      prescribedWorkingSetCount: 10,
    }),
  );

  assert.equal(result.classification, "SubstantialPartialSession");
  assert.equal(result.completedExerciseCount, 2);
  assert.equal(result.workingSetCompletionRate, 0.6);
});

test("does not let one completed exercise hide the rest of an omitted prescription", () => {
  const result = evaluateStrengthSessionCompletion(
    session({
      exercises: [exercise("leg-press", 3, 3)],
      prescribedExerciseCount: 7,
      prescribedWorkingSetCount: 19,
    }),
  );

  assert.equal(result.classification, "MinimalSession");
  assert.equal(result.completedWorkingSetCount, 3);
  assert.equal(result.prescribedWorkingSetCount, 19);
});

test("classifies a session with no meaningful working sets as missed", () => {
  const result = evaluateStrengthSessionCompletion(
    session({
      exercises: [exercise("leg-press", 3, 0)],
      prescribedExerciseCount: 7,
      prescribedWorkingSetCount: 19,
    }),
  );

  assert.equal(result.classification, "MissedSession");
  assert.equal(result.completedWorkingSetCount, 0);
});
