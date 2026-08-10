import assert from "node:assert/strict";
import test from "node:test";

import {
  EQUALIZER_BANDS,
  EQUALIZER_PRESETS,
  getAudioRoutingMix,
  getEffectiveEqualizerGains,
  getSoundModeParameters,
  normalizeEqualizerGains,
} from "../lib/tracks/equalizer";

test("flat settings preserve a unity dry path through every optional stage", () => {
  assert.deepEqual(
    getAudioRoutingMix(EQUALIZER_PRESETS.Flat, {
      bassBoost: false,
      normalize: false,
      spatial: false,
      stereoWidth: false,
    }),
    {
      equalizer: { dry: 1, wet: 0 },
      compressor: { dry: 1, wet: 0 },
      stereo: { dry: 1, wet: 0 },
    },
  );
});

test("optional processing activates only the stages requested by the listener", () => {
  assert.deepEqual(
    getAudioRoutingMix([0, 0, 0, 2, 0, 0, 0, 0, 0, 0], {
      bassBoost: false,
      normalize: true,
      spatial: false,
      stereoWidth: false,
    }),
    {
      equalizer: { dry: 0, wet: 1 },
      compressor: { dry: 0, wet: 1 },
      stereo: { dry: 1, wet: 0 },
    },
  );

  assert.deepEqual(
    getAudioRoutingMix(EQUALIZER_PRESETS.Flat, {
      bassBoost: true,
      normalize: false,
      spatial: true,
      stereoWidth: false,
    }),
    {
      equalizer: { dry: 0, wet: 1 },
      compressor: { dry: 1, wet: 0 },
      stereo: { dry: 0, wet: 1 },
    },
  );
});

test("every equalizer preset provides one safe value for every rendered band", () => {
  assert.deepEqual(EQUALIZER_BANDS, [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]);
  assert.deepEqual(EQUALIZER_PRESETS.Flat, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(EQUALIZER_PRESETS.Rock, [4, 3, 2, 0, -1, -1, 0, 2, 3, 4]);

  for (const gains of Object.values(EQUALIZER_PRESETS)) {
    assert.equal(gains.length, EQUALIZER_BANDS.length);
    assert.ok(gains.every((gain) => gain >= -12 && gain <= 12));
  }
});

test("equalizer input normalization fills missing bands and clamps unsafe gain", () => {
  assert.deepEqual(
    normalizeEqualizerGains([18, -20, 3.4]),
    [12, -12, 3, 0, 0, 0, 0, 0, 0, 0],
  );
});

test("bass mode adds low-frequency energy without changing the visible preset", () => {
  assert.deepEqual(
    getEffectiveEqualizerGains([10, 11, 12, 1, 0, 0, 0, 0, 0, 0], true),
    [12, 12, 12, 1, 0, 0, 0, 0, 0, 0],
  );
  assert.deepEqual(
    getEffectiveEqualizerGains(EQUALIZER_PRESETS.Flat, false),
    EQUALIZER_PRESETS.Flat,
  );
});

test("sound mode parameters map toggles to audible Web Audio settings", () => {
  assert.deepEqual(
    getSoundModeParameters({ normalize: false, spatial: false, stereoWidth: false }),
    { compressorRatio: 1, compressorThreshold: 0, spatialDelaySeconds: 0, stereoWidth: 1 },
  );
  assert.deepEqual(
    getSoundModeParameters({ normalize: true, spatial: true, stereoWidth: true }),
    { compressorRatio: 3, compressorThreshold: -18, spatialDelaySeconds: 0.012, stereoWidth: 1.5 },
  );
});
