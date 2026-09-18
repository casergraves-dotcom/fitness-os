import assert from "node:assert/strict";
import test from "node:test";

import {
  clearLocalFitnessOsData,
  ensureLocalFitnessOsCacheOwner,
  FITNESS_OS_CACHE_USER_KEY,
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
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    has(key) {
      return values.has(key);
    },
  };
}


test("clears Fitness OS data without removing unrelated browser data", () => {
  const storage = createStorage([
    [FITNESS_OS_CACHE_USER_KEY, "account-a"],
    ["fitness-os-workout-history", "[]"],
    ["fitness-os-active-workout", "{}"],
    ["sb-project-auth-token", "session"],
    ["unrelated-preference", "keep"],
  ]);

  clearLocalFitnessOsData(storage);

  assert.equal(storage.has(FITNESS_OS_CACHE_USER_KEY), false);
  assert.equal(storage.has("fitness-os-workout-history"), false);
  assert.equal(storage.has("fitness-os-active-workout"), false);
  assert.equal(storage.has("sb-project-auth-token"), true);
  assert.equal(storage.has("unrelated-preference"), true);
});

test("keeps a returning account's local data and binds an untagged legacy cache", () => {
  const storage = createStorage([["fitness-os-workout-history", "[]"]]);

  ensureLocalFitnessOsCacheOwner("account-a", storage);
  assert.equal(storage.getItem("fitness-os-workout-history"), "[]");
  assert.equal(storage.getItem(FITNESS_OS_CACHE_USER_KEY), "account-a");

  ensureLocalFitnessOsCacheOwner("account-a", storage);
  assert.equal(storage.getItem("fitness-os-workout-history"), "[]");
});

test("clears another account's cached and active data before binding the new account", () => {
  const storage = createStorage([
    [FITNESS_OS_CACHE_USER_KEY, "account-a"],
    ["fitness-os-workout-history", "private history"],
    ["fitness-os-active-workout", "private active session"],
    ["sb-project-auth-token", "new session"],
  ]);

  ensureLocalFitnessOsCacheOwner("account-b", storage);

  assert.equal(storage.has("fitness-os-workout-history"), false);
  assert.equal(storage.has("fitness-os-active-workout"), false);
  assert.equal(storage.getItem(FITNESS_OS_CACHE_USER_KEY), "account-b");
  assert.equal(storage.getItem("sb-project-auth-token"), "new session");
});
