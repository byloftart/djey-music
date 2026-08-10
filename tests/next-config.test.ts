import assert from "node:assert/strict";
import test from "node:test";

import nextConfig from "../next.config";

test("local development origins allow hydration on localhost and loopback", () => {
  assert.ok(nextConfig.allowedDevOrigins?.includes("localhost"));
  assert.ok(nextConfig.allowedDevOrigins?.includes("127.0.0.1"));
});
