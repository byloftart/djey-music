"use client";

import Link from "next/link";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { AdminIcon } from "@/components/admin/admin-icon";
import {
  buildTrackMutation,
  deriveTrackSlug,
  deriveTrackTitleFromFilename,
  formatTrackDuration,
  validateMediaFile,
  type TrackEditorValues,
  type TrackStatus,
} from "@/lib/tracks/track-editor";

export type EditableTrack = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  audio_path: string;
  cover_path: string | null;
  duration_seconds: number | string;
  genre: string | null;
  tags: string[];
  status: TrackStatus;
  download_enabled: boolean;
  display_order: number;
  rights_notice: string | null;
};

type TrackEditorProps = {
  initialTrack?: EditableTrack;
  maxAudioBytes: number;
  nextDisplayOrder: number;
  trackId: string;
};

type UploadTicket = {
  path: string;
  signedUrl: string;
};

function uploadWithProgress(
  ticket: UploadTicket,
  file: File,
  onProgress: (progress: number) => void,
  registerRequest: (request?: XMLHttpRequest) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    registerRequest(request);
    request.open("PUT", ticket.signedUrl);
    const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (publicKey) {
      request.setRequestHeader("apikey", publicKey);
      request.setRequestHeader("authorization", `Bearer ${publicKey}`);
    }
    request.setRequestHeader("x-upsert", "false");
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    });
    request.addEventListener("load", () => {
      registerRequest(undefined);
      if (request.status >= 200 && request.status < 300) resolve();
      else reject(new Error("The upload could not be completed."));
    });
    request.addEventListener("error", () => {
      registerRequest(undefined);
      reject(new Error("The upload connection failed."));
    });
    request.addEventListener("abort", () => {
      registerRequest(undefined);
      reject(new Error("Upload cancelled."));
    });
    const payload = new FormData();
    payload.append("cacheControl", "3600");
    payload.append("", file);
    request.send(payload);
  });
}

function readAudioDuration(file: File) {
  return new Promise<number>((resolve, reject) => {
    const audio = document.createElement("audio");
    const url = URL.createObjectURL(file);
    audio.preload = "metadata";
    audio.addEventListener("loadedmetadata", () => {
      const duration = audio.duration;
      URL.revokeObjectURL(url);
      if (Number.isFinite(duration) && duration > 0) {
        resolve(Number(duration.toFixed(3)));
      } else {
        reject(new Error("Audio duration could not be read."));
      }
    });
    audio.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      reject(new Error("Audio metadata could not be read."));
    });
    audio.src = url;
  });
}

export function TrackEditor({
  initialTrack,
  maxAudioBytes,
  nextDisplayOrder,
  trackId,
}: TrackEditorProps) {
  const router = useRouter();
  const activeUpload = useRef<XMLHttpRequest | undefined>(undefined);
  const [values, setValues] = useState<TrackEditorValues>({
    title: initialTrack?.title ?? "",
    slug: initialTrack?.slug ?? "",
    description: initialTrack?.description ?? "",
    genre: initialTrack?.genre ?? "",
    tags: initialTrack?.tags.join(", ") ?? "",
    durationSeconds: String(initialTrack?.duration_seconds ?? ""),
    rightsNotice: initialTrack?.rights_notice ?? "",
    displayOrder: String(initialTrack?.display_order ?? nextDisplayOrder),
  });
  const [audioFile, setAudioFile] = useState<File>();
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadLabel, setUploadLabel] = useState("");
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState<"error" | "success">("success");
  const [confirmDelete, setConfirmDelete] = useState(false);

  function updateValue<Key extends keyof TrackEditorValues>(
    key: Key,
    value: TrackEditorValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function selectAudio(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      validateMediaFile(file, "audio", maxAudioBytes);
      setAudioFile(file);
      setMessage("");
      const title = deriveTrackTitleFromFilename(file.name);
      setValues((current) => ({
        ...current,
        title,
        slug: deriveTrackSlug(title),
      }));
      const duration = await readAudioDuration(file);
      updateValue("durationSeconds", String(duration));
    } catch (error) {
      event.target.value = "";
      setAudioFile(undefined);
      setMessageKind("error");
      setMessage(error instanceof Error ? error.message : "Invalid audio file.");
    }
  }

  async function requestUpload(file: File): Promise<UploadTicket> {
    const response = await fetch("/api/admin/uploads/sign", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        trackId,
        kind: "audio",
        file: { name: file.name, type: file.type, size: file.size },
      }),
    });
    const payload = (await response.json()) as UploadTicket & { error?: string };
    if (!response.ok) throw new Error(payload.error || "Upload could not be authorized.");
    return payload;
  }

  async function uploadFile(file: File) {
    setUploadLabel("Uploading track");
    setProgress(0);
    const ticket = await requestUpload(file);
    await uploadWithProgress(
      ticket,
      file,
      setProgress,
      (request) => { activeUpload.current = request; },
    );
    setProgress(100);
    return ticket.path;
  }

  async function saveTrack(status: TrackStatus) {
    setPending(true);
    setMessage("");
    setMessageKind("success");

    try {
      buildTrackMutation(values, status);
      let uploadedAudioPath: string | undefined;

      if (audioFile) uploadedAudioPath = await uploadFile(audioFile);
      if (!initialTrack?.audio_path && !uploadedAudioPath) {
        throw new Error("Choose an audio file before saving this track.");
      }
      const endpoint = initialTrack
        ? `/api/admin/tracks/${trackId}`
        : "/api/admin/tracks";
      const response = await fetch(endpoint, {
        method: initialTrack ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: trackId,
          values,
          status,
          audioPath: uploadedAudioPath,
          coverPath: initialTrack ? undefined : null,
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        warnings?: string[];
      };
      if (!response.ok) throw new Error(payload.error || "Track could not be saved.");

      const success = status === "published"
        ? "Track published."
        : initialTrack
          ? "Changes saved."
          : "Draft saved.";
      setMessage(payload.warnings?.length ? `${success} ${payload.warnings.join(" ")}` : success);
      setMessageKind("success");
      setAudioFile(undefined);

      if (!initialTrack) {
        router.replace(`/admin/tracks/${trackId}/edit?created=1`);
      }
      router.refresh();
    } catch (error) {
      setMessageKind("error");
      setMessage(error instanceof Error ? error.message : "Track could not be saved.");
    } finally {
      activeUpload.current = undefined;
      setPending(false);
      setUploadLabel("");
    }
  }

  async function deleteTrack() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/tracks/${trackId}`, { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Track could not be deleted.");
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setConfirmDelete(false);
      setMessageKind("error");
      setMessage(error instanceof Error ? error.message : "Track could not be deleted.");
      setPending(false);
    }
  }

  function submitCurrent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void saveTrack(initialTrack?.status ?? "draft");
  }

  const currentStatus = initialTrack?.status ?? "draft";
  return (
    <main className="editor-main">
      <form className="track-editor" onSubmit={submitCurrent}>
        <div className="editor-nav">
          <Link href="/admin" aria-label="Back to track catalog">
            <AdminIcon name="arrow-left" />
            <span>Catalog</span>
          </Link>
          <div className="admin-readout">{initialTrack ? "EDIT TRACK" : "NEW TRACK"}</div>
        </div>

        <label className="editor-upload admin-raised">
          <span>{audioFile?.name || (initialTrack ? "Replace Track" : "Upload Track")}</span>
          <input accept=".mp3,.m4a,.aac,.wav,audio/*" onChange={selectAudio} type="file" />
        </label>

        <section className="editor-section admin-inset">
          <h2>Track Details</h2>
          <div className="editor-fields">
            <label className="editor-field">
              <span>Title</span>
              <input
                maxLength={160}
                onChange={(event) => updateValue("title", event.target.value)}
                required
                value={values.title}
              />
            </label>
            <label className="editor-field">
              <span>Genre</span>
              <input
                maxLength={80}
                onChange={(event) => updateValue("genre", event.target.value)}
                value={values.genre}
              />
            </label>
            <label className="editor-field">
              <span>Tags</span>
              <input
                onChange={(event) => updateValue("tags", event.target.value)}
                value={values.tags}
              />
            </label>
            <label className="editor-field editor-duration-field">
              <span>Duration</span>
              <output aria-label="Detected track duration">
                {formatTrackDuration(values.durationSeconds)}
              </output>
            </label>
            <label className="editor-field editor-field-wide">
              <span>Description</span>
              <textarea
                maxLength={5000}
                onChange={(event) => updateValue("description", event.target.value)}
                rows={2}
                value={values.description}
              />
            </label>
          </div>
        </section>

        {pending && uploadLabel ? (
          <section className="upload-progress admin-raised" aria-live="polite">
            <div><span>{uploadLabel}</span><strong>{progress}%</strong></div>
            <progress max="100" value={progress} />
            <button onClick={() => activeUpload.current?.abort()} type="button">Cancel Upload</button>
          </section>
        ) : null}

        {message ? (
          <p className={`editor-message is-${messageKind}`} aria-live="polite">{message}</p>
        ) : null}

        <section className="editor-actions admin-raised">
          <div className="editor-primary-actions">
            <button className="editor-save" disabled={pending} type="submit">
              {pending ? "Working…" : initialTrack ? "Save Changes" : "Save Draft"}
            </button>
            <button
              className="editor-publish"
              disabled={pending}
              onClick={() => void saveTrack(currentStatus === "published" ? "draft" : "published")}
              type="button"
            >
              {currentStatus === "published" ? "Unpublish" : "Publish"}
            </button>
          </div>
          {initialTrack ? (
            <button
              className="editor-delete"
              disabled={pending}
              onClick={() => setConfirmDelete(true)}
              type="button"
            >
              <AdminIcon name="trash" size={17} />
              Permanently Delete
            </button>
          ) : null}
        </section>
      </form>

      {confirmDelete ? (
        <div className="delete-dialog-backdrop" role="presentation">
          <section aria-labelledby="delete-title" aria-modal="true" className="delete-dialog admin-raised" role="dialog">
            <h2 id="delete-title">Permanently delete this track?</h2>
            <p>Its audio and catalog record will be removed. This cannot be undone.</p>
            <div>
              <button disabled={pending} onClick={() => setConfirmDelete(false)} type="button">Cancel</button>
              <button className="confirm-delete" disabled={pending} onClick={deleteTrack} type="button">
                {pending ? "Deleting…" : "Delete Track"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
