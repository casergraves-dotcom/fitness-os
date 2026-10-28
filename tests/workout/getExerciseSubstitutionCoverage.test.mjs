import assert from "node:assert/strict";
import test from "node:test";

import { exerciseLibrary } from "../../features/workout/exerciseLibrary.ts";
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

test("keeps useful fallbacks distinct from true equivalents", () => {
  const coverage = getExerciseSubstitutionCoverage(exerciseLibrary);
  const gluteBridge = coverage.rows.find((row) => row.exerciseId === "glute-bridge");

  assert.ok(gluteBridge);
  assert.ok(gluteBridge.fallbackCount > 0);
});
