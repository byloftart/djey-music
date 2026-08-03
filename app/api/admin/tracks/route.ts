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

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  try {
    await requireOwner();
  } catch (error) {
    if (error instanceof OwnerAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }

  const body = (await request.json().catch(() => null)) as {
    id?: unknown;
    values?: TrackEditorValues;
    status?: TrackStatus;
    audioPath?: unknown;
    coverPath?: unknown;
  } | null;

  if (
    typeof body?.id !== "string" ||
    !UUID_PATTERN.test(body.id) ||
    (body.status !== "draft" && body.status !== "published") ||
    typeof body.audioPath !== "string" ||
    !isTrackStoragePath(body.audioPath, body.id, "audio") ||
    (body.coverPath !== null &&
      (typeof body.coverPath !== "string" ||
        !isTrackStoragePath(body.coverPath, body.id, "cover")))
  ) {
    return NextResponse.json({ error: "Invalid track request." }, { status: 400 });
  }

  try {
    const mutation = buildTrackMutation(body.values as TrackEditorValues, body.status);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tracks")
      .insert({
        id: body.id,
        ...mutation,
        audio_path: body.audioPath,
        cover_path: body.coverPath,
      })
      .select()
      .single();

    if (error) {
      await Promise.all([
        supabase.storage.from("track-audio").remove([body.audioPath]),
        body.coverPath
          ? supabase.storage.from("track-covers").remove([body.coverPath])
          : Promise.resolve(),
      ]);
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json({ track: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid track values." },
      { status: 400 },
    );
  }
}
