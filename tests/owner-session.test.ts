import assert from "node:assert/strict";
import test from "node:test";

import { authorizeOwnerIdentity } from "../lib/auth/owner-session";

const owner = {
  id: "8d0e7e90-9f09-4bc4-90b1-c70b132ce932",
  email: "owner@example.com",
};

test("returns a freshly verified allowlisted owner identity", () => {
  assert.equal(
    authorizeOwnerIdentity(owner, undefined, "owner@example.com"),
    owner,
  );
});

test("rejects an authenticated identity outside the server allowlist", () => {
  assert.throws(
    () => authorizeOwnerIdentity(owner, undefined, "another@example.com"),
    { name: "OwnerAuthorizationError" },
  );
});

test("rejects missing or failed Supabase identity verification", () => {
  assert.throws(
    () => authorizeOwnerIdentity(undefined, undefined, "owner@example.com"),
    { name: "OwnerAuthorizationError" },
  );
  assert.throws(
    () =>
      authorizeOwnerIdentity(
        owner,
        new Error("Auth token is invalid"),
        "owner@example.com",
      ),
    { name: "OwnerAuthorizationError" },
  );
});
