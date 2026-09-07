import assert from "node:assert/strict";
import test from "node:test";

import {
  getAuthUserDisplayName,
} from "../../features/auth/utils/getAuthUserDisplayName.ts";


test("prefers the account display name", () => {
  assert.equal(
    getAuthUserDisplayName({
      email: "fallback@example.com",
      user_metadata: { display_name: "  Alex  " },
    }),
    "Alex",
  );
});


test("falls back to a readable email identity for existing accounts", () => {
  assert.equal(
    getAuthUserDisplayName({ email: "cody.graves@example.com" }),
    "Cody Graves",
  );
});


test("does not invent an identity when account data is unavailable", () => {
  assert.equal(getAuthUserDisplayName(null), null);
});
