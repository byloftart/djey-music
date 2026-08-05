import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPublicPlayerTracks,
  formatPlayerTime,
  getAdjacentTrackIndex,
  getSpectrumColumnColor,
  getSpectrumIntensity,
  getSpectrumSegmentCount,
} from "../lib/tracks/public-player";

test("public player keeps only published tracks in persisted order and hides storage paths", () => {
  const tracks = buildPublicPlayerTracks([
    {
      id: "00000000-0000-4000-8000-000000000003",
      title: "Equals",
      audio_path: "tracks/00000000-0000-4000-8000-000000000003/audio/equals.mp3",
      duration_seconds: "193.4",
      genre: "Electronic",
      status: "published",
      published_at: "2026-08-03T16:00:00.000Z",
      display_order: 2,
    },
    {
      id: "00000000-0000-4000-8000-000000000099",
      title: "Private Draft",
      audio_path: "tracks/00000000-0000-4000-8000-000000000099/audio/private.wav",
      duration_seconds: 90,
      genre: null,
      status: "draft",
      published_at: null,
      display_order: 0,
    },
    {
      id: "00000000-0000-4000-8000-000000000001",
      title: "Kisses your back",
      audio_path: "tracks/00000000-0000-4000-8000-000000000001/audio/kisses-your-back.mp3",
      duration_seconds: 218,
      genre: null,
      status: "published",
      published_at: "2026-01-01T00:00:00.000Z",
      display_order: 0,
    },
  ]);

  assert.deepEqual(tracks, [
    {
      id: "00000000-0000-4000-8000-000000000001",
      title: "Kisses your back",
      durationSeconds: 218,
      genre: "UNCLASSIFIED",
      format: "MP3",
      year: "2026",
      audioUrl: "/api/tracks/00000000-0000-4000-8000-000000000001/audio",
    },
    {
      id: "00000000-0000-4000-8000-000000000003",
      title: "Equals",
      durationSeconds: 193.4,
      genre: "ELECTRONIC",
      format: "MP3",
      year: "2026",
      audioUrl: "/api/tracks/00000000-0000-4000-8000-000000000003/audio",
    },
  ]);
});

test("player time remains stable for unloaded and hour-long media", () => {
  assert.equal(formatPlayerTime(Number.NaN), "0:00");
  assert.equal(formatPlayerTime(65.9), "1:05");
  assert.equal(formatPlayerTime(3661), "1:01:01");
});

test("previous and next navigation wrap through the published queue", () => {
  assert.equal(getAdjacentTrackIndex(0, 3, -1), 2);
  assert.equal(getAdjacentTrackIndex(2, 3, 1), 0);
  assert.equal(getAdjacentTrackIndex(1, 3, 1), 2);
  assert.equal(getAdjacentTrackIndex(0, 0, 1), 0);
});

test("remaining player time is shown as a negative countdown", () => {
  assert.equal(formatPlayerTime(193), "3:13");
  assert.equal(`-${formatPlayerTime(Math.max(0, 295 - 102))}`, "-3:13");
});

test("spectrum colors interpolate smoothly from emerald to light orange", () => {
  const first = getSpectrumColumnColor(0, 38);
  const middle = getSpectrumColumnColor(19, 38);
  const last = getSpectrumColumnColor(37, 38);

  assert.equal(first, "rgb(6, 140, 100)");
  assert.match(middle, /^rgb\(\d+, \d+, \d+\)$/);
  assert.equal(last, "rgb(255, 140, 40)");

  for (let index = 1; index < 38; index += 1) {
    const previous = getSpectrumColumnColor(index - 1, 38)
      .match(/\d+/g)!
      .map(Number);
    const current = getSpectrumColumnColor(index, 38)
      .match(/\d+/g)!
      .map(Number);
    const largestChannelStep = Math.max(
      ...current.map((channel, channelIndex) =>
        Math.abs(channel - previous[channelIndex]),
      ),
    );
    assert.ok(largestChannelStep <= 12);
  }
});

test("silent spectrum has no fixed LED rows but real peaks retain the full range", () => {
  assert.equal(getSpectrumSegmentCount(0, 25), 0);
  assert.equal(getSpectrumSegmentCount(1, 25), 25);
  assert.equal(getSpectrumSegmentCount(0.5, 25), 13);
});

test("spectrum response follows musical energy without boosting normal audio to the ceiling", () => {
  assert.equal(getSpectrumIntensity(0), 0);
  assert.equal(getSpectrumIntensity(0.06), 0);

  const normal = getSpectrumIntensity(0.5);
  const loud = getSpectrumIntensity(0.8);

  assert.ok(normal > 0.3 && normal < 0.55);
  assert.ok(loud > normal && loud < 0.9);
  assert.equal(getSpectrumIntensity(1), 1);
});
