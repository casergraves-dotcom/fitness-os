import assert from "node:assert/strict";
import test from "node:test";

import { syncAndPersistAppleHealthSteps } from "../../features/integrations/appleHealth/syncAndPersistAppleHealthSteps.ts";

const dates = {
  startDate: "2026-06-09",
  endDate: "2026-09-01",
};

function availableBridge(totals) {
  return {
    getAccessState: async () => ({
      availability: "Available",
      authorizationRequested: true,
    }),
    requestReadAuthorization: async () => {
      throw new Error("should not run");
    },
    readDailyStepTotals: async () => totals,
  };
}

test("persists imported totals through the provided canonical adapter", async () => {
  let saved;
  const result = await syncAndPersistAppleHealthSteps({
    ...dates,
    bridge: availableBridge([{ date: "2026-08-31", steps: 9280 }]),
    persistence: {
      read: () => [],
      write: (records) => { saved = records; },
    },
    now: () => new Date("2026-09-01T20:00:00.000Z"),
    createId: () => "health-1",
  });
  assert.equal(result.status, "Synced");
  assert.equal(saved.length, 1);
  assert.equal(saved[0].source, "AppleHealth");
});

test("does not write when access returns no data", async () => {
  let writes = 0;
  const result = await syncAndPersistAppleHealthSteps({
    ...dates,
    bridge: availableBridge([]),
    persistence: {
      read: () => [],
      write: () => { writes += 1; },
    },
  });
  assert.equal(result.status, "NoAccessibleData");
  assert.equal(writes, 0);
});

test("does not rewrite storage when every imported date has a manual correction", async () => {
  let writes = 0;
  const manual = {
    id: "manual",
    date: "2026-08-31",
    steps: 9280,
    source: "Manual",
    createdAt: "2026-08-31T20:00:00.000Z",
    updatedAt: "2026-08-31T20:00:00.000Z",
  };
  const result = await syncAndPersistAppleHealthSteps({
    ...dates,
    bridge: availableBridge([{ date: "2026-08-31", steps: 9100 }]),
    persistence: {
      read: () => [manual],
      write: () => { writes += 1; },
    },
  });
  assert.equal(result.preservedManual, 1);
  assert.equal(writes, 0);
});

test("keeps existing records unchanged when the bridge fails", async () => {
  const existing = [{
    id: "manual",
    date: "2026-08-31",
    steps: 9280,
    source: "Manual",
    createdAt: "2026-08-31T20:00:00.000Z",
    updatedAt: "2026-08-31T20:00:00.000Z",
  }];
  let writes = 0;
  const result = await syncAndPersistAppleHealthSteps({
    ...dates,
    bridge: {
      getAccessState: async () => { throw new Error("offline"); },
      requestReadAuthorization: async () => { throw new Error("offline"); },
      readDailyStepTotals: async () => [],
    },
    persistence: {
      read: () => existing,
      write: () => { writes += 1; },
    },
  });
  assert.equal(result.status, "Failed");
  assert.deepEqual(result.records, existing);
  assert.equal(writes, 0);
});
