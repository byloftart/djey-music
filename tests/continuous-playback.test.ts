import assert from "node:assert/strict";
import test from "node:test";

import {
  createEqualPowerCurve,
  getEqualPowerGains,
  resolveQueuedTrackIndex,
  shouldStartCrossfade,
} from "../lib/tracks/continuous-playback";

test("gain curves sample the same equal-power endpoints used by transitions", () => {
  const outgoing = createEqualPowerCurve("outgoing", 3);
  const incoming = createEqualPowerCurve("incoming", 3);

  assert.deepEqual([...outgoing].map((value) => Math.round(value * 1_000_000)), [
    1_000_000,
    707107,
    0,
  ]);
  assert.deepEqual([...incoming].map((value) => Math.round(value * 1_000_000)), [
    0,
    707107,
    1_000_000,
  ]);
});

test("equal-power gains preserve full endpoints and a balanced midpoint", () => {
  assert.deepEqual(getEqualPowerGains(0), { outgoing: 1, incoming: 0 });

  const midpoint = getEqualPowerGains(0.5);
  assert.ok(Math.abs(midpoint.outgoing - Math.SQRT1_2) < 0.000001);
  assert.ok(Math.abs(midpoint.incoming - Math.SQRT1_2) < 0.000001);

  const end = getEqualPowerGains(1);
  assert.ok(Math.abs(end.outgoing) < 0.000001);
  assert.equal(end.incoming, 1);
});

test("crossfade starts only inside the final three seconds with a queued track", () => {
  assert.equal(shouldStartCrossfade(96.9, 100, true, false), false);
  assert.equal(shouldStartCrossfade(97, 100, true, false), true);
  assert.equal(shouldStartCrossfade(99, 100, false, false), false);
  assert.equal(shouldStartCrossfade(99, 100, true, true), false);
  assert.equal(shouldStartCrossfade(1, 2.5, true, false), true);
  assert.equal(shouldStartCrossfade(0, Number.NaN, true, false), false);
});

test("automatic queue resolution preserves repeat-off, repeat-all, and repeat-one", () => {
  assert.equal(resolveQueuedTrackIndex({
    currentIndex: 2,
    trackCount: 3,
    intent: "automatic",
    repeatMode: "off",
    shuffleEnabled: false,
  }), null);
  assert.equal(resolveQueuedTrackIndex({
    currentIndex: 2,
    trackCount: 3,
    intent: "automatic",
    repeatMode: "all",
    shuffleEnabled: false,
  }), 0);
  assert.equal(resolveQueuedTrackIndex({
    currentIndex: 1,
    trackCount: 3,
    intent: "automatic",
    repeatMode: "one",
    shuffleEnabled: false,
  }), 1);
});

test("manual next and previous keep wraparound while shuffle affects forward only", () => {
  assert.equal(resolveQueuedTrackIndex({
    currentIndex: 2,
    trackCount: 3,
    intent: "next",
    repeatMode: "off",
    shuffleEnabled: false,
  }), 0);
  assert.equal(resolveQueuedTrackIndex({
    currentIndex: 0,
    trackCount: 3,
    intent: "previous",
    repeatMode: "off",
    shuffleEnabled: true,
    shuffledIndex: 1,
  }), 2);
  assert.equal(resolveQueuedTrackIndex({
    currentIndex: 1,
    trackCount: 3,
    intent: "next",
    repeatMode: "off",
    shuffleEnabled: true,
    shuffledIndex: 2,
  }), 2);
});

test("queue resolution rejects empty queues and invalid shuffled targets", () => {
  assert.equal(resolveQueuedTrackIndex({
    currentIndex: 0,
    trackCount: 0,
    intent: "next",
    repeatMode: "off",
    shuffleEnabled: false,
  }), null);
  assert.equal(resolveQueuedTrackIndex({
    currentIndex: 0,
    trackCount: 3,
    intent: "next",
    repeatMode: "off",
    shuffleEnabled: true,
    shuffledIndex: 7,
  }), 1);
});
