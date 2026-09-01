import assert from "node:assert/strict";
import test from "node:test";

import { mergeAppleHealthStepTotals } from "../../features/dailyActivity/utils/mergeAppleHealthStepTotals.ts";

const syncedAt = "2026-09-01T18:00:00.000Z";
const record = (overrides) => ({
  id: overrides.date,
  date: overrides.date,
  steps: overrides.steps,
  source: overrides.source,
  createdAt: "2026-08-31T18:00:00.000Z",
  updatedAt: "2026-08-31T18:00:00.000Z",
});

test("preserves a manual correction for the same date", () => {
  const result = mergeAppleHealthStepTotals(
    [record({ date: "2026-08-31", steps: 9280, source: "Manual" })],
    [{ date: "2026-08-31", steps: 9100 }],
    { syncedAt, createId: () => "new" }
  );
  assert.equal(result.records[0].steps, 9280);
  assert.equal(result.records[0].source, "Manual");
  assert.equal(result.preservedManual, 1);
});

test("refreshes an Apple Health date without duplication", () => {
  const result = mergeAppleHealthStepTotals(
    [record({ date: "2026-08-31", steps: 9100, source: "AppleHealth" })],
    [{ date: "2026-08-31", steps: 9280 }],
    { syncedAt, createId: () => "new" }
  );
  assert.equal(result.records.length, 1);
  assert.equal(result.records[0].steps, 9280);
  assert.equal(result.records[0].sourceSyncedAt, syncedAt);
  assert.equal(result.updated, 1);
});

test("adds valid daily aggregates and ignores invalid totals", () => {
  const result = mergeAppleHealthStepTotals(
    [],
    [
      { date: "2026-09-01", steps: 4000 },
      { date: "09/01/2026", steps: 5000 },
      { date: "2026-08-31", steps: -1 },
    ],
    { syncedAt, createId: () => "health-1" }
  );
  assert.equal(result.records.length, 1);
  assert.equal(result.records[0].source, "AppleHealth");
  assert.equal(result.added, 1);
});
