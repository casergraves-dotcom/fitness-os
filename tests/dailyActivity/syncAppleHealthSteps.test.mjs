import assert from "node:assert/strict";
import test from "node:test";

import { syncAppleHealthSteps } from "../../features/integrations/appleHealth/syncAppleHealthSteps.ts";

const baseOptions = {
  records: [],
  startDate: "2026-08-19",
  endDate: "2026-09-01",
  syncedAt: "2026-09-01T20:00:00.000Z",
  createId: () => "health-1",
};

test("does not request authorization during a passive sync", async () => {
  let requested = false;
  const result = await syncAppleHealthSteps({
    ...baseOptions,
    bridge: {
      getAccessState: async () => ({
        availability: "Available",
        authorizationRequested: false,
      }),
      requestReadAuthorization: async () => {
        requested = true;
        throw new Error("should not run");
      },
      readDailyStepTotals: async () => [],
    },
  });
  assert.equal(result.status, "AuthorizationRequired");
  assert.equal(requested, false);
});

test("reports no accessible data without claiming access was denied", async () => {
  const result = await syncAppleHealthSteps({
    ...baseOptions,
    bridge: {
      getAccessState: async () => ({
        availability: "Available",
        authorizationRequested: true,
      }),
      requestReadAuthorization: async () => {
        throw new Error("should not run");
      },
      readDailyStepTotals: async () => [],
    },
  });
  assert.equal(result.status, "NoAccessibleData");
});

test("limits the query to authorized history and reports partial coverage", async () => {
  let requestedRange;
  const result = await syncAppleHealthSteps({
    ...baseOptions,
    bridge: {
      getAccessState: async () => ({
        availability: "Available",
        authorizationRequested: true,
        earliestAuthorizedDate: "2026-08-28",
      }),
      requestReadAuthorization: async () => {
        throw new Error("should not run");
      },
      readDailyStepTotals: async (range) => {
        requestedRange = range;
        return [{ date: "2026-08-31", steps: 9280 }];
      },
    },
  });
  assert.deepEqual(requestedRange, {
    startDate: "2026-08-28",
    endDate: "2026-09-01",
  });
  assert.equal(result.status, "PartialHistory");
  assert.equal(result.records[0].steps, 9280);
});

test("returns a recoverable failure without changing canonical records", async () => {
  const records = [{
    id: "manual",
    date: "2026-08-31",
    steps: 9280,
    source: "Manual",
    createdAt: baseOptions.syncedAt,
    updatedAt: baseOptions.syncedAt,
  }];
  const result = await syncAppleHealthSteps({
    ...baseOptions,
    records,
    bridge: {
      getAccessState: async () => {
        throw new Error("Health store unavailable");
      },
      requestReadAuthorization: async () => {
        throw new Error("should not run");
      },
      readDailyStepTotals: async () => [],
    },
  });
  assert.equal(result.status, "Failed");
  assert.equal(result.errorMessage, "Health store unavailable");
  assert.deepEqual(result.records, records);
});
