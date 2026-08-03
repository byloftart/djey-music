import assert from "node:assert/strict";
import test from "node:test";

import { resolveOwnerLoginEmail } from "../lib/auth/owner-login";

test("resolves the configured owner login to its server-only Auth email", () => {
  assert.equal(
    resolveOwnerLoginEmail(
      "  DJey  ",
      "djey",
      "owner@example.test",
      "owner@example.test",
    ),
    "owner@example.test",
  );
});

test("rejects a different login without returning the owner Auth email", () => {
  assert.equal(
    resolveOwnerLoginEmail(
      "visitor",
      "djey",
      "owner@example.test",
      "owner@example.test",
    ),
    null,
  );
});

test("rejects missing or malformed server-side login configuration", () => {
  assert.equal(
    resolveOwnerLoginEmail(
      "djey",
      undefined,
      "owner@example.test",
      "owner@example.test",
    ),
    null,
  );
  assert.equal(
    resolveOwnerLoginEmail("djey", "djey", "not-an-email", "not-an-email"),
    null,
  );
});

test("rejects a configured Auth email outside the owner allowlist", () => {
  assert.equal(
    resolveOwnerLoginEmail(
      "djey",
      "djey",
      "owner@example.test",
      "another@example.test",
    ),
    null,
  );
});
