import assert from "node:assert/strict";
import test from "node:test";

import {
  buildTrackStoragePath,
  buildTrackMutation,
  deriveTrackSlug,
  deriveTrackTitleFromFilename,
  formatTrackDuration,
  getConfiguredUploadLimit,
  isTrackStoragePath,
  normalizeStorageFileName,
  validateMediaFile,
} from "../lib/tracks/track-editor";

test("derives the visible title and hidden slug from an uploaded filename", () => {
  assert.equal(
    deriveTrackTitleFromFilename("  Between-Two_Cities (Final).WAV  "),
    "Between Two Cities (Final)",
  );
  assert.equal(deriveTrackSlug("Between Two Cities (Final)"), "between-two-cities-final");
});

test("formats detected audio duration as whole minutes and seconds", () => {
  assert.equal(formatTrackDuration(305), "05:05");
  assert.equal(formatTrackDuration("265"), "04:25");
  assert.equal(formatTrackDuration(304.6), "05:05");
  assert.equal(formatTrackDuration("not-a-duration"), "00:00");
});

const validDraft = {
  title: "  Between Two Cities  ",
  slug: "between-two-cities",
  description: "  A late-night electronic piece.  ",
  genre: " Electronic ",
  tags: "night, electronic, night",
  durationSeconds: "243.5",
  rightsNotice: " © DJey ",
  displayOrder: "2",
};

test("normalizes editor values into a database mutation", () => {
  assert.deepEqual(buildTrackMutation(validDraft, "draft"), {
    title: "Between Two Cities",
    slug: "between-two-cities",
    description: "A late-night electronic piece.",
    genre: "Electronic",
    tags: ["night", "electronic"],
    duration_seconds: 243.5,
    rights_notice: "© DJey",
    download_enabled: false,
    display_order: 2,
    status: "draft",
    published_at: null,
  });
});

test("keeps public downloads disabled even for legacy editor payloads", () => {
  const legacyPayload = { ...validDraft, downloadEnabled: true };
  assert.equal(
    buildTrackMutation(legacyPayload, "published").download_enabled,
    false,
  );
});

test("requires schema-valid editor values before saving", () => {
  assert.throws(
    () =>
      buildTrackMutation(
        {
          ...validDraft,
          title: " ",
          slug: "Not Valid",
          durationSeconds: "0",
        },
        "draft",
      ),
    /Title is required/,
  );
});

test("publishing stamps the current time without changing draft behavior", () => {
  const now = new Date("2026-08-03T09:00:00.000Z");
  assert.equal(
    buildTrackMutation(validDraft, "published", now).published_at,
    "2026-08-03T09:00:00.000Z",
  );
});

test("normalizes upload names to storage-policy-safe lowercase paths", () => {
  assert.equal(
    normalizeStorageFileName("  My New Track (Final).MP3  "),
    "my-new-track-final.mp3",
  );
});

test("builds storage-policy-safe paths inside the selected track boundary", () => {
  assert.equal(
    buildTrackStoragePath(
      "8d0e7e90-9f09-4bc4-90b1-c70b132ce932",
      "audio",
      "My New Track.MP3",
      1_722_678_000_000,
    ),
    "tracks/8d0e7e90-9f09-4bc4-90b1-c70b132ce932/audio/1722678000000-my-new-track.mp3",
  );
  assert.equal(
    isTrackStoragePath(
      "tracks/8d0e7e90-9f09-4bc4-90b1-c70b132ce932/audio/1722678000000-my-new-track.mp3",
      "8d0e7e90-9f09-4bc4-90b1-c70b132ce932",
      "audio",
    ),
    true,
  );
  assert.equal(
    isTrackStoragePath(
      "tracks/83d395fa-631a-4a61-b64a-d2e0a417dbfe/audio/track.mp3",
      "8d0e7e90-9f09-4bc4-90b1-c70b132ce932",
      "audio",
    ),
    false,
  );
});

test("uses a positive configured upload limit or a central fallback", () => {
  assert.equal(getConfiguredUploadLimit("5000000", 10), 5_000_000);
  assert.equal(getConfiguredUploadLimit("invalid", 10), 10);
  assert.equal(getConfiguredUploadLimit("0", 10), 10);
});

test("accepts configured audio files and rejects wrong type or size", () => {
  assert.deepEqual(
    validateMediaFile(
      { name: "track.mp3", type: "audio/mpeg", size: 4_000_000 },
      "audio",
      5_000_000,
    ),
    { extension: "mp3", contentType: "audio/mpeg" },
  );
  assert.throws(
    () =>
      validateMediaFile(
        { name: "track.exe", type: "application/octet-stream", size: 10 },
        "audio",
        5_000_000,
      ),
    /MP3, M4A, AAC, or WAV/,
  );
  assert.throws(
    () =>
      validateMediaFile(
        { name: "track.wav", type: "audio/wav", size: 6_000_000 },
        "audio",
        5_000_000,
      ),
    /exceeds the 4.8 MB limit/,
  );
});
