export const CROSSFADE_SECONDS = 3;

export type PlaybackIntent = "automatic" | "next" | "previous";
export type PlaybackRepeatMode = "off" | "all" | "one";

type QueueResolutionOptions = {
  currentIndex: number;
  trackCount: number;
  intent: PlaybackIntent;
  repeatMode: PlaybackRepeatMode;
  shuffleEnabled: boolean;
  shuffledIndex?: number;
};

export function getEqualPowerGains(progress: number) {
  const clamped = Number.isFinite(progress)
    ? Math.min(1, Math.max(0, progress))
    : 0;
  const angle = clamped * Math.PI * 0.5;

  return {
    outgoing: Math.cos(angle),
    incoming: Math.sin(angle),
  };
}

export function createEqualPowerCurve(
  channel: "outgoing" | "incoming",
  sampleCount = 64,
) {
  const safeSampleCount = Math.max(2, Math.floor(sampleCount));
  const curve = new Float32Array(safeSampleCount);

  for (let index = 0; index < safeSampleCount; index += 1) {
    const gains = getEqualPowerGains(index / (safeSampleCount - 1));
    curve[index] = gains[channel];
  }

  return curve;
}

export function shouldStartCrossfade(
  currentTime: number,
  duration: number,
  hasNext: boolean,
  transitioning: boolean,
) {
  if (
    !hasNext ||
    transitioning ||
    !Number.isFinite(currentTime) ||
    !Number.isFinite(duration) ||
    duration <= 0 ||
    currentTime < 0
  ) {
    return false;
  }

  return duration - currentTime <= CROSSFADE_SECONDS;
}

export function resolveQueuedTrackIndex({
  currentIndex,
  trackCount,
  intent,
  repeatMode,
  shuffleEnabled,
  shuffledIndex,
}: QueueResolutionOptions): number | null {
  if (
    !Number.isInteger(trackCount) ||
    trackCount <= 0 ||
    !Number.isInteger(currentIndex) ||
    currentIndex < 0 ||
    currentIndex >= trackCount
  ) {
    return null;
  }

  if (intent === "automatic" && repeatMode === "one") {
    return currentIndex;
  }

  if (intent === "previous") {
    return (currentIndex - 1 + trackCount) % trackCount;
  }

  if (shuffleEnabled && trackCount > 1) {
    if (
      Number.isInteger(shuffledIndex) &&
      shuffledIndex !== undefined &&
      shuffledIndex >= 0 &&
      shuffledIndex < trackCount &&
      shuffledIndex !== currentIndex
    ) {
      return shuffledIndex;
    }
    return (currentIndex + 1) % trackCount;
  }

  if (intent === "next") {
    return (currentIndex + 1) % trackCount;
  }

  if (currentIndex < trackCount - 1) {
    return currentIndex + 1;
  }

  return repeatMode === "all" ? 0 : null;
}
