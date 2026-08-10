export type TrackStatus = "draft" | "published";

export type TrackEditorValues = {
  title: string;
  slug: string;
  description: string;
  genre: string;
  tags: string;
  durationSeconds: string;
  rightsNotice: string;
  displayOrder: string;
};

export type TrackMutation = {
  title: string;
  slug: string;
  description: string | null;
  genre: string | null;
  tags: string[];
  duration_seconds: number;
  rights_notice: string | null;
  download_enabled: boolean;
  display_order: number;
  status: TrackStatus;
  published_at: string | null;
};

type MediaKind = "audio" | "cover";

type MediaFile = {
  name: string;
  type: string;
  size: number;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MEDIA_TYPES: Record<
  MediaKind,
  Record<string, ReadonlySet<string>>
> = {
  audio: {
    mp3: new Set(["audio/mpeg"]),
    m4a: new Set(["audio/mp4", "audio/x-m4a"]),
    aac: new Set(["audio/aac"]),
    wav: new Set(["audio/wav", "audio/x-wav"]),
  },
  cover: {
    jpg: new Set(["image/jpeg"]),
    jpeg: new Set(["image/jpeg"]),
    png: new Set(["image/png"]),
    webp: new Set(["image/webp"]),
    avif: new Set(["image/avif"]),
  },
};

function optionalText(value: string): string | null {
  const normalized = value.trim();
  return normalized || null;
}

export function deriveTrackTitleFromFilename(fileName: string): string {
  const normalized = fileName.trim();
  const extensionIndex = normalized.lastIndexOf(".");
  const baseName = extensionIndex > 0 ? normalized.slice(0, extensionIndex) : normalized;

  return baseName.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

export function deriveTrackSlug(title: string): string {
  const safeName = normalizeStorageFileName(title);
  const extensionIndex = safeName.lastIndexOf(".");
  return extensionIndex > 0 ? safeName.slice(0, extensionIndex) : safeName;
}

export function formatTrackDuration(duration: number | string): string {
  const totalSeconds = Math.max(0, Math.round(Number(duration)));
  if (!Number.isFinite(totalSeconds) || totalSeconds === 0) return "00:00";

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function buildTrackMutation(
  values: TrackEditorValues,
  status: TrackStatus,
  now = new Date(),
): TrackMutation {
  const title = values.title.trim();
  const slug = values.slug.trim().toLowerCase();
  const durationSeconds = Number(values.durationSeconds);
  const displayOrder = Number(values.displayOrder);

  if (!title) {
    throw new Error("Title is required.");
  }
  if (title.length > 160) {
    throw new Error("Title must be 160 characters or fewer.");
  }
  if (!SLUG_PATTERN.test(slug) || slug.length > 120) {
    throw new Error("Slug must use lowercase letters, numbers, and hyphens.");
  }
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds > 86_400) {
    throw new Error("Duration must be greater than 0 seconds.");
  }
  if (!Number.isInteger(displayOrder) || displayOrder < 0) {
    throw new Error("Display order must be a non-negative whole number.");
  }

  const description = optionalText(values.description);
  const genre = optionalText(values.genre);
  const rightsNotice = optionalText(values.rightsNotice);
  const tags = [...new Set(
    values.tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean),
  )];

  if (description && description.length > 5_000) {
    throw new Error("Description must be 5,000 characters or fewer.");
  }
  if (genre && genre.length > 80) {
    throw new Error("Genre must be 80 characters or fewer.");
  }
  if (rightsNotice && rightsNotice.length > 500) {
    throw new Error("Rights notice must be 500 characters or fewer.");
  }
  if (tags.length > 20) {
    throw new Error("Use no more than 20 tags.");
  }

  return {
    title,
    slug,
    description,
    genre,
    tags,
    duration_seconds: durationSeconds,
    rights_notice: rightsNotice,
    download_enabled: false,
    display_order: displayOrder,
    status,
    published_at: status === "published" ? now.toISOString() : null,
  };
}

export function normalizeStorageFileName(fileName: string): string {
  const normalized = fileName.trim().toLowerCase();
  const extensionIndex = normalized.lastIndexOf(".");
  const rawBase = extensionIndex > 0 ? normalized.slice(0, extensionIndex) : normalized;
  const extension = extensionIndex > 0 ? normalized.slice(extensionIndex + 1) : "";
  const safeBase = rawBase
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "media";

  return extension ? `${safeBase}.${extension}` : safeBase;
}

export function buildTrackStoragePath(
  trackId: string,
  kind: MediaKind,
  fileName: string,
  timestamp = Date.now(),
): string {
  if (!UUID_PATTERN.test(trackId)) {
    throw new Error("A valid track id is required for uploads.");
  }

  const safeFileName = normalizeStorageFileName(fileName);
  return `tracks/${trackId.toLowerCase()}/${kind}/${timestamp}-${safeFileName}`;
}

export function isTrackStoragePath(
  path: string,
  trackId: string,
  kind: MediaKind,
): boolean {
  if (!UUID_PATTERN.test(trackId)) return false;
  const extensions = kind === "audio" ? "mp3|m4a|aac|wav" : "jpg|jpeg|png|webp|avif";
  const escapedId = trackId.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `^tracks/${escapedId}/${kind}/[a-z0-9][a-z0-9._-]{0,127}\\.(${extensions})$`,
  ).test(path);
}

export function getConfiguredUploadLimit(
  configuredValue: string | undefined,
  fallbackBytes: number,
): number {
  const parsed = Number(configuredValue);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallbackBytes;
}

export function validateMediaFile(
  file: MediaFile,
  kind: MediaKind,
  maxBytes: number,
): { extension: string; contentType: string } {
  const normalizedName = normalizeStorageFileName(file.name);
  const extension = normalizedName.split(".").pop() ?? "";
  const acceptedTypes = MEDIA_TYPES[kind][extension];
  const label = kind === "audio" ? "MP3, M4A, AAC, or WAV" : "JPG, PNG, WebP, or AVIF";

  if (!acceptedTypes || !acceptedTypes.has(file.type)) {
    throw new Error(`Choose a ${label} file.`);
  }
  if (!Number.isFinite(maxBytes) || maxBytes <= 0) {
    throw new Error("The upload size limit is not configured.");
  }
  if (file.size <= 0) {
    throw new Error("The selected file is empty.");
  }
  if (file.size > maxBytes) {
    const limitInMb = (maxBytes / 1_048_576).toFixed(1);
    throw new Error(`The selected file exceeds the ${limitInMb} MB limit.`);
  }

  return { extension, contentType: file.type };
}
