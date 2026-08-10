import assert from "node:assert/strict";
import test from "node:test";

import {
  isOwnerEmailAllowed,
  normalizeEmail,
  parseOwnerEmailAllowlist,
} from "../lib/auth/owner-email";

test("normalizes owner email addresses", () => {
  assert.equal(normalizeEmail("  OWNER@Example.COM "), "owner@example.com");
});

test("parses a comma-separated allowlist and removes duplicates", () => {
  assert.deepEqual(
    [...parseOwnerEmailAllowlist("owner@example.com, OWNER@example.com, invalid")],
    ["owner@example.com"],
  );
});

test("matches only an exact normalized allowlisted email", () => {
  const allowlist = "owner@example.com, collaborator@example.com";

  assert.equal(isOwnerEmailAllowed("OWNER@example.com", allowlist), true);
  assert.equal(isOwnerEmailAllowed("stranger@example.com", allowlist), false);
  assert.equal(isOwnerEmailAllowed(undefined, allowlist), false);
});
