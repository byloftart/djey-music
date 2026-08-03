import { NextResponse, type NextRequest } from "next/server";

import {
  OwnerAuthorizationError,
  requireOwner,
} from "@/lib/auth/require-owner";
import { createClient } from "@/lib/supabase/server";
import {
  buildTrackMutation,
  isTrackStoragePath,
  type TrackEditorValues,
  type TrackStatus,
} from "@/lib/tracks/track-editor";

type TrackRouteProps = {
  params: Promise<{ trackId: string }>;
};

async function authorizeRoute() {
  try {
    await requireOwner();
    return null;
  } catch (error) {
    if (error instanceof OwnerAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }
}

export async function PATCH(request: NextRequest, { params }: TrackRouteProps) {
  const unauthorized = await authorizeRoute();
  if (unauthorized) return unauthorized;

  const { trackId } = await params;
  const body = (await request.json().catch(() => null)) as {
    values?: TrackEditorValues;
    status?: TrackStatus;
    audioPath?: unknown;
    coverPath?: unknown;
  } | null;

  if (
    (body?.status !== "draft" && body?.status !== "published") ||
    (body.audioPath !== undefined &&
      (typeof body.audioPath !== "string" ||
        !isTrackStoragePath(body.audioPath, trackId, "audio"))) ||
    (body.coverPath !== undefined &&
      body.coverPath !== null &&
      (typeof body.coverPath !== "string" ||
        !isTrackStoragePath(body.coverPath, trackId, "cover")))
  ) {
    return NextResponse.json({ error: "Invalid track request." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: current, error: currentError } = await supabase
    .from("tracks")
    .select("audio_path,cover_path,status,published_at")
    .eq("id", trackId)
    .single();

  if (currentError || !current) {
    return NextResponse.json({ error: "Track not found." }, { status: 404 });
  }

  try {
    const mutation = buildTrackMutation(body.values as TrackEditorValues, body.status);
    if (body.status === "published" && current.status === "published") {
      mutation.published_at = current.published_at;
    }
    const nextAudioPath = body.audioPath ?? current.audio_path;
    const nextCoverPath = body.coverPath === undefined ? current.cover_path : body.coverPath;
    const { data, error } = await supabase
      .from("tracks")
      .update({
        ...mutation,
        audio_path: nextAudioPath,
        cover_path: nextCoverPath,
      })
      .eq("id", trackId)
      .select()
      .single();

    if (error) {
      const cleanup: PromiseLike<unknown>[] = [];
      if (body.audioPath && body.audioPath !== current.audio_path) {
        cleanup.push(supabase.storage.from("track-audio").remove([body.audioPath]));
      }
      if (typeof body.coverPath === "string" && body.coverPath !== current.cover_path) {
        cleanup.push(supabase.storage.from("track-covers").remove([body.coverPath]));
      }
      await Promise.all(cleanup);
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    const cleanupWarnings: string[] = [];
    if (body.audioPath && current.audio_path && body.audioPath !== current.audio_path) {
      const { error: cleanupError } = await supabase.storage
        .from("track-audio")
        .remove([current.audio_path]);
      if (cleanupError) cleanupWarnings.push("Previous audio cleanup needs retry.");
    }
    if (body.coverPath !== undefined && current.cover_path && body.coverPath !== current.cover_path) {
      const { error: cleanupError } = await supabase.storage
        .from("track-covers")
        .remove([current.cover_path]);
      if (cleanupError) cleanupWarnings.push("Previous cover cleanup needs retry.");
    }

    return NextResponse.json({ track: data, warnings: cleanupWarnings });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid track values." },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: TrackRouteProps) {
  const unauthorized = await authorizeRoute();
  if (unauthorized) return unauthorized;

  const { trackId } = await params;
  const supabase = await createClient();
  const { data: current, error: currentError } = await supabase
    .from("tracks")
    .select("audio_path,cover_path")
    .eq("id", trackId)
    .maybeSingle();

  if (currentError) {
    return NextResponse.json({ error: currentError.message }, { status: 409 });
  }
  if (!current) {
    return NextResponse.json({ ok: true });
  }

  const cleanupResults = await Promise.all([
    supabase.storage.from("track-audio").remove([current.audio_path]),
    current.cover_path
      ? supabase.storage.from("track-covers").remove([current.cover_path])
      : Promise.resolve({ error: null }),
  ]);
  const cleanupError = cleanupResults.find((result) => result.error)?.error;
  if (cleanupError) {
    return NextResponse.json(
      { error: `Media cleanup failed: ${cleanupError.message}` },
      { status: 502 },
    );
  }

  const { error: deleteError } = await supabase.from("tracks").delete().eq("id", trackId);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
