import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateStrengthWorkoutIntentCoverage,
  getExerciseTrainingStyles,
  getStrengthWorkoutVariantStyle,
} from "../../features/workout/trainingStyle.ts";
import {
  strengthWorkoutIntents,
  strengthWorkoutVariants,
} from "../../features/workout/backupWorkoutModel.ts";

test("legacy exercises and variants resolve without rewriting stored data", () => {
  assert.deepEqual(getExerciseTrainingStyles({}), ["TraditionalStrength"]);
  assert.equal(getStrengthWorkoutVariantStyle({}), "TraditionalStrength");
});

test("explicit styles are preserved and duplicate exercise styles are removed", () => {
  assert.deepEqual(
    getExerciseTrainingStyles({
      trainingStyles: ["Calisthenics", "AerialSupport", "Calisthenics"],
    }),
    ["Calisthenics", "AerialSupport"]
  );
  assert.equal(
    getStrengthWorkoutVariantStyle({ trainingStyle: "Suspension" }),
    "Suspension"
  );
});

test("existing home and short variants satisfy their required source intent", () => {
  for (const variant of strengthWorkoutVariants) {
    const coverage = evaluateStrengthWorkoutIntentCoverage(
      variant,
      strengthWorkoutIntents[variant.sourceStrengthWorkout]
    );

    assert.equal(
      coverage.satisfiesRequiredIntent,
      true,
      `${variant.id}: missing ${coverage.missingRequiredRoles.join(", ")}`
    );
    assert.equal(coverage.coverageRate, 1);
  }
});

test("intent coverage identifies an incomplete themed prescription", () => {
  const coverage = evaluateStrengthWorkoutIntentCoverage(
    {
      exercises: [
        {
          exerciseDefinitionId: "push-ups",
          movementRole: "HorizontalPush",
          sets: 3,
        },
      ],
    },
    strengthWorkoutIntents["Gym A"]
  );

  assert.equal(coverage.satisfiesRequiredIntent, false);
  assert.ok(coverage.coveredRequiredRoles.includes("HorizontalPush"));
  assert.ok(coverage.missingRequiredRoles.includes("Squat"));
  assert.ok(coverage.coverageRate < 1);
});
