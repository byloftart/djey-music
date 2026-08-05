import assert from "node:assert/strict";
import test from "node:test";

import {
  getAdminPreviewButtonState,
  getAdminPreviewUrl,
} from "../lib/tracks/admin-preview";

test("admin preview URL remains on the authenticated application boundary", () => {
  assert.equal(
    getAdminPreviewUrl("track id/with spaces"),
    "/api/admin/tracks/track%20id%2Fwith%20spaces/preview",
  );
});

test("only the active playing or loading track changes its preview button state", () => {
  assert.equal(getAdminPreviewButtonState("a", {
    activeTrackId: "a",
    loadingTrackId: undefined,
    playing: true,
  }), "pause");
  assert.equal(getAdminPreviewButtonState("a", {
    activeTrackId: "a",
    loadingTrackId: "a",
    playing: false,
  }), "loading");
  assert.equal(getAdminPreviewButtonState("b", {
    activeTrackId: "a",
    loadingTrackId: "a",
    playing: false,
  }), "play");
});
