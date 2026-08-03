import assert from "node:assert/strict";
import test from "node:test";

import { getSafeAdminRedirect } from "../lib/auth/redirect-path";

test("keeps an internal admin destination after authentication", () => {
  assert.equal(
    getSafeAdminRedirect("/admin/tracks/123/edit?from=catalog"),
    "/admin/tracks/123/edit?from=catalog",
  );
});

test("falls back to the catalog for external or non-admin destinations", () => {
  assert.equal(getSafeAdminRedirect("https://attacker.example"), "/admin");
  assert.equal(getSafeAdminRedirect("//attacker.example/admin"), "/admin");
  assert.equal(getSafeAdminRedirect("/listener"), "/admin");
  assert.equal(getSafeAdminRedirect(undefined), "/admin");
});
