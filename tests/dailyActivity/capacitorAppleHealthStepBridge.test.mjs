import assert from "node:assert/strict";
import test from "node:test";

import { createCapacitorAppleHealthStepBridge } from "../../features/integrations/appleHealth/capacitorAppleHealthStepBridge.ts";

function runtime(overrides = {}) {
  return {
    getPlatform: () => "web",
    isNativePlatform: () => false,
    isPluginAvailable: () => false,
    ...overrides,
  };
}

const forbiddenPlugin = {
  getAccessState: async () => { throw new Error("must not call"); },
  requestReadAuthorization: async () => { throw new Error("must not call"); },
  readDailyStepTotals: async () => { throw new Error("must not call"); },
};

test("reports unavailable in the browser without calling the native plugin", async () => {
  const bridge = createCapacitorAppleHealthStepBridge(
    runtime(),
    forbiddenPlugin
  );
  assert.deepEqual(await bridge.getAccessState(), {
    availability: "Unavailable",
    authorizationRequested: false,
  });
  assert.deepEqual(
    await bridge.readDailyStepTotals({
      startDate: "2026-08-19",
      endDate: "2026-09-01",
    }),
    []
  );
});

test("reports unavailable when an iOS container lacks the Swift plugin", async () => {
  const bridge = createCapacitorAppleHealthStepBridge(
    runtime({
      getPlatform: () => "ios",
      isNativePlatform: () => true,
    }),
    forbiddenPlugin
  );
  assert.equal(
    (await bridge.getAccessState()).availability,
    "Unavailable"
  );
});

test("forwards requests to the registered iOS plugin", async () => {
  let requestedRange;
  const bridge = createCapacitorAppleHealthStepBridge(
    runtime({
      getPlatform: () => "ios",
      isNativePlatform: () => true,
      isPluginAvailable: () => true,
    }),
    {
      getAccessState: async () => ({
        availability: "Available",
        authorizationRequested: true,
      }),
      requestReadAuthorization: async () => ({
        availability: "Available",
        authorizationRequested: true,
      }),
      readDailyStepTotals: async (range) => {
        requestedRange = range;
        return { totals: [{ date: "2026-08-31", steps: 9280 }] };
      },
    }
  );
  const totals = await bridge.readDailyStepTotals({
    startDate: "2026-08-19",
    endDate: "2026-09-01",
  });
  assert.deepEqual(requestedRange, {
    startDate: "2026-08-19",
    endDate: "2026-09-01",
  });
  assert.deepEqual(totals, [{ date: "2026-08-31", steps: 9280 }]);
});
