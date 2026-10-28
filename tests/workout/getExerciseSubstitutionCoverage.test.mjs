import assert from "node:assert/strict";
import test from "node:test";

import { exerciseLibrary } from "../../features/workout/exerciseLibrary.ts";
import { workoutTemplates } from "../../features/workout/data.ts";
import { getExerciseSubstitutionCoverage } from "../../features/workout/getExerciseSubstitutionCoverage.ts";

test("reports gym and configured-home equivalent coverage", () => {
  const coverage = getExerciseSubstitutionCoverage(exerciseLibrary);
  const chestPress = coverage.rows.find((row) => row.exerciseId === "chest-press-machine");
  const legCurl = coverage.rows.find((row) => row.exerciseId === "leg-curl");

  assert.ok(coverage.exerciseCount > 0);
  assert.ok(coverage.gymCoveredCount > 0);
  assert.ok(coverage.homeCoveredCount > 0);
  assert.equal(chestPress?.status, "Gym + Home");
  assert.ok((chestPress?.gymEquivalentCount ?? 0) > 0);
  assert.ok((chestPress?.homeEquivalentCount ?? 0) > 0);
  assert.equal(legCurl?.status, "Gym + Home");
  assert.ok((legCurl?.gymEquivalentCount ?? 0) > 0);
  assert.ok((legCurl?.homeEquivalentCount ?? 0) > 0);
});

test("the configured gym profile has no automatic substitution endpoint", () => {
  const coverage = getExerciseSubstitutionCoverage(exerciseLibrary);

  assert.equal(coverage.endpointCount, 0);
});

test("every exercise in the full A/B/C templates has a configured-home equivalent", () => {
  const coverage = getExerciseSubstitutionCoverage(exerciseLibrary);
  const templateExerciseIds = new Set(
    Object.values(workoutTemplates).flat().map((exercise) => exercise.exerciseDefinitionId)
  );
  const uncovered = coverage.rows.filter(
    (row) => templateExerciseIds.has(row.exerciseId) && row.homeEquivalentCount === 0
  );

  assert.deepEqual(uncovered, []);
});

test("keeps useful fallbacks distinct from true equivalents", () => {
  const coverage = getExerciseSubstitutionCoverage(exerciseLibrary);
  const gluteBridge = coverage.rows.find((row) => row.exerciseId === "glute-bridge");

  assert.ok(gluteBridge);
  assert.ok(gluteBridge.fallbackCount > 0);
});
