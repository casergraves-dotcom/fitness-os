import assert from "node:assert/strict";
import test from "node:test";

import {
  formatBandResistance,
  getBandResistanceDetails,
  getCombinedBandResistanceLb,
  normalizeBandConfiguration,
  withBandConfiguration,
} from "../../features/workout/bandResistance.ts";

function set(overrides = {}) {
  return {
    id: "set-1",
    weight: 0,
    reps: 12,
    completed: false,
    ...overrides,
  };
}

test("keeps a historical single-band set as an explicit legacy value", () => {
  const historicalSet = set({ weight: 30 });

  assert.deepEqual(getBandResistanceDetails(historicalSet), {
    selections: [{ ratedResistanceLb: 30 }],
    nominalResistanceLb: 30,
    source: "legacy-single-band",
  });
  assert.equal("bandConfiguration" in historicalSet, false);
  assert.equal(formatBandResistance(historicalSet), "30 lb band");
});

test("preserves individual bands and their combined nominal resistance", () => {
  const updated = withBandConfiguration(set(), [
    { ratedResistanceLb: 30 },
    { ratedResistanceLb: 20 },
  ]);

  assert.equal(updated.weight, 50);
  assert.deepEqual(updated.bandConfiguration, [
    { ratedResistanceLb: 30 },
    { ratedResistanceLb: 20 },
  ]);
  assert.deepEqual(getBandResistanceDetails(updated), {
    selections: [
      { ratedResistanceLb: 30 },
      { ratedResistanceLb: 20 },
    ],
    nominalResistanceLb: 50,
    source: "configuration",
  });
  assert.equal(formatBandResistance(updated), "30 + 20 lb bands");
});

test("keeps duplicate bands and distinguishes a combination from one band", () => {
  const duplicateBands = withBandConfiguration(set(), [
    { ratedResistanceLb: 20 },
    { ratedResistanceLb: 20 },
  ]);
  const oneBand = withBandConfiguration(set(), [
    { ratedResistanceLb: 40 },
  ]);

  assert.equal(duplicateBands.weight, oneBand.weight);
  assert.notDeepEqual(
    duplicateBands.bandConfiguration,
    oneBand.bandConfiguration
  );
});

test("round-trips each selected band through workout JSON persistence", () => {
  const configuredSet = withBandConfiguration(set({ completed: true }), [
    { ratedResistanceLb: 30 },
    { ratedResistanceLb: 20 },
    { ratedResistanceLb: 20 },
  ]);

  const restored = JSON.parse(JSON.stringify(configuredSet));

  assert.deepEqual(restored.bandConfiguration, [
    { ratedResistanceLb: 30 },
    { ratedResistanceLb: 20 },
    { ratedResistanceLb: 20 },
  ]);
  assert.equal(restored.weight, 70);
  assert.equal(restored.completed, true);
});

test("normalizes invalid ratings without mutating the provided selections", () => {
  const selections = [
    { ratedResistanceLb: 10 },
    { ratedResistanceLb: Number.NaN },
    { ratedResistanceLb: -5 },
    { ratedResistanceLb: 10 },
  ];

  assert.deepEqual(normalizeBandConfiguration(selections), [
    { ratedResistanceLb: 10 },
    { ratedResistanceLb: 10 },
  ]);
  assert.equal(getCombinedBandResistanceLb(selections), 20);
  assert.equal(selections.length, 4);
});
