export const EQUALIZER_BANDS = [
  31,
  62,
  125,
  250,
  500,
  1000,
  2000,
  4000,
  8000,
  16000,
] as const;

export const EQUALIZER_PRESETS = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  "Bass Boost": [6, 5, 4, 2, 0, 0, 0, 0, 0, 0],
  "Bass Reducer": [-6, -5, -4, -2, 0, 0, 0, 0, 0, 0],
  "Treble Boost": [0, 0, 0, 0, 0, 2, 4, 6, 7, 8],
  Vocal: [-2, -1, 2, 4, 5, 4, 2, 1, 0, -2],
  Pop: [-2, -1, 0, 2, 4, 4, 2, 0, -1, -2],
  Rock: [4, 3, 2, 0, -1, -1, 0, 2, 3, 4],
  "Electronic / EDM": [6, 5, 2, 0, -2, 1, 3, 5, 6, 7],
  "Hip-Hop": [7, 6, 4, 1, -1, 0, 2, 3, 1, 0],
  Acoustic: [2, 2, 1, 0, 1, 3, 4, 3, 2, 1],
} as const satisfies Record<string, readonly number[]>;

export type EqualizerPresetName = keyof typeof EQUALIZER_PRESETS;

export const EQUALIZER_PRESET_NAMES = Object.keys(
  EQUALIZER_PRESETS,
) as EqualizerPresetName[];

export type SoundModes = {
  bassBoost: boolean;
  normalize: boolean;
  spatial: boolean;
  stereoWidth: boolean;
};

type RoutingStageMix = {
  dry: 0 | 1;
  wet: 0 | 1;
};

export type AudioRoutingMix = {
  equalizer: RoutingStageMix;
  compressor: RoutingStageMix;
  stereo: RoutingStageMix;
};

const BASS_BOOST_GAINS = [4, 3, 2, 0, 0, 0, 0, 0, 0, 0] as const;

function clampGain(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(12, Math.max(-12, Math.round(value)));
}

export function normalizeEqualizerGains(gains: readonly number[]) {
  return EQUALIZER_BANDS.map((_, index) => clampGain(gains[index] ?? 0));
}

export function getEffectiveEqualizerGains(
  gains: readonly number[],
  bassBoost: boolean,
) {
  const normalized = normalizeEqualizerGains(gains);
  if (!bassBoost) return normalized;
  return normalized.map((gain, index) =>
    clampGain(gain + BASS_BOOST_GAINS[index]),
  );
}

function stageMix(enabled: boolean): RoutingStageMix {
  return enabled ? { dry: 0, wet: 1 } : { dry: 1, wet: 0 };
}

export function getAudioRoutingMix(
  gains: readonly number[],
  modes: SoundModes,
): AudioRoutingMix {
  const equalizerEnabled =
    modes.bassBoost || normalizeEqualizerGains(gains).some((gain) => gain !== 0);

  return {
    equalizer: stageMix(equalizerEnabled),
    compressor: stageMix(modes.normalize),
    stereo: stageMix(modes.spatial || modes.stereoWidth),
  };
}

export function getSoundModeParameters(
  modes: Pick<SoundModes, "normalize" | "spatial" | "stereoWidth">,
) {
  return {
    compressorRatio: modes.normalize ? 3 : 1,
    compressorThreshold: modes.normalize ? -18 : 0,
    spatialDelaySeconds: modes.spatial ? 0.012 : 0,
    stereoWidth: modes.stereoWidth ? 1.5 : 1,
  };
}
