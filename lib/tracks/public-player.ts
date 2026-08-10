export type PublicTrackRow = {
  id: string;
  title: string;
  audio_path: string;
  duration_seconds: number | string;
  genre: string | null;
  status: "draft" | "published";
  published_at: string | null;
  display_order: number;
};

export type PublicPlayerTrack = {
  id: string;
  title: string;
  durationSeconds: number;
  genre: string;
  format: string;
  year: string;
  audioUrl: string;
};

function getTrackFormat(audioPath: string): string {
  const extension = audioPath.split(".").pop()?.trim().toUpperCase();
  return extension || "AUDIO";
}

function getPublishedYear(publishedAt: string | null): string {
  if (!publishedAt) return "—";
  const date = new Date(publishedAt);
  return Number.isNaN(date.getTime()) ? "—" : String(date.getUTCFullYear());
}

export function buildPublicPlayerTracks(
  rows: readonly PublicTrackRow[],
): PublicPlayerTrack[] {
  return rows
    .filter((row) => row.status === "published")
    .sort((left, right) => left.display_order - right.display_order)
    .map((row) => ({
      id: row.id,
      title: row.title,
      durationSeconds: Number(row.duration_seconds),
      genre: row.genre?.trim().toUpperCase() || "UNCLASSIFIED",
      format: getTrackFormat(row.audio_path),
      year: getPublishedYear(row.published_at),
      audioUrl: `/api/tracks/${encodeURIComponent(row.id)}/audio`,
    }));
}

export function formatPlayerTime(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "0:00";

  const totalSeconds = Math.floor(value);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function getAdjacentTrackIndex(
  currentIndex: number,
  trackCount: number,
  direction: -1 | 1,
): number {
  if (trackCount < 1) return 0;
  return (currentIndex + direction + trackCount) % trackCount;
}

type Rgb = readonly [number, number, number];

const SPECTRUM_STOPS: readonly { at: number; color: Rgb }[] = [
  { at: 0, color: [6, 140, 100] },
  { at: 0.3, color: [12, 215, 65] },
  { at: 0.72, color: [180, 232, 25] },
  { at: 1, color: [255, 140, 40] },
];

export function getSpectrumColumnColor(index: number, columnCount: number): string {
  const safeCount = Math.max(2, Math.floor(columnCount));
  const progress = Math.min(1, Math.max(0, index / (safeCount - 1)));
  const rightStop =
    SPECTRUM_STOPS.findIndex((stop) => stop.at >= progress) || 1;
  const right = SPECTRUM_STOPS[Math.max(1, rightStop)];
  const left = SPECTRUM_STOPS[Math.max(0, rightStop - 1)];
  const localProgress = (progress - left.at) / (right.at - left.at || 1);
  const color = left.color.map((channel, channelIndex) =>
    Math.round(channel + (right.color[channelIndex] - channel) * localProgress),
  );

  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}

export function getSpectrumSegmentCount(
  intensity: number,
  maximumSegments: number,
): number {
  const safeMaximum = Math.max(1, Math.floor(maximumSegments));
  const safeIntensity = Number.isFinite(intensity)
    ? Math.min(1, Math.max(0, intensity))
    : 0;
  return Math.round(safeIntensity * safeMaximum);
}

export function getSpectrumIntensity(rawValue: number): number {
  const safeValue = Number.isFinite(rawValue)
    ? Math.min(1, Math.max(0, rawValue))
    : 0;
  const noiseFloor = 0.06;
  if (safeValue <= noiseFloor) return 0;

  const normalized = (safeValue - noiseFloor) / (1 - noiseFloor);
  return Math.pow(normalized, 1.15);
}
