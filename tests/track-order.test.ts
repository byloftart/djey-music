import assert from "node:assert/strict";
import test from "node:test";

import { reorderVisibleTracks } from "../lib/tracks/track-order";

const tracks = [
  { id: "a", status: "published" },
  { id: "b", status: "draft" },
  { id: "c", status: "published" },
  { id: "d", status: "draft" },
];

test("reorders the complete catalog by source and destination id", () => {
  assert.deepEqual(
    reorderVisibleTracks(tracks, tracks, "d", "b").map((track) => track.id),
    ["a", "d", "b", "c"],
  );
});

test("reorders a filtered subset without moving hidden track slots", () => {
  const published = tracks.filter((track) => track.status === "published");
  assert.deepEqual(
    reorderVisibleTracks(tracks, published, "c", "a").map((track) => track.id),
    ["c", "b", "a", "d"],
  );
});

test("keeps the current order when either track is outside the visible set", () => {
  const published = tracks.filter((track) => track.status === "published");
  assert.equal(reorderVisibleTracks(tracks, published, "b", "a"), tracks);
});
