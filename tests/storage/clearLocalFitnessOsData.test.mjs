import assert from "node:assert/strict";
import test from "node:test";

import {
  clearLocalFitnessOsData,
} from "../../lib/storage/clearLocalFitnessOsData.ts";


function createStorage(entries) {
  const values = new Map(entries);

  return {
    get length() {
      return values.size;
    },
    key(index) {
      return [...values.keys()][index] ?? null;
    },
    removeItem(key) {
      values.delete(key);
    },
    has(key) {
      return values.has(key);
    },
  };
}


test("clears Fitness OS data without removing unrelated browser data", () => {
  const storage = createStorage([
    ["fitness-os-workout-history", "[]"],
    ["fitness-os-active-workout", "{}"],
    ["sb-project-auth-token", "session"],
    ["unrelated-preference", "keep"],
  ]);

  clearLocalFitnessOsData(storage);

  assert.equal(storage.has("fitness-os-workout-history"), false);
  assert.equal(storage.has("fitness-os-active-workout"), false);
  assert.equal(storage.has("sb-project-auth-token"), true);
  assert.equal(storage.has("unrelated-preference"), true);
});
