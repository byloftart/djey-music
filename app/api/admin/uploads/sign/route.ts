import { NextResponse, type NextRequest } from "next/server";

import {
  OwnerAuthorizationError,
  requireOwner,
} from "@/lib/auth/require-owner";
import { createClient } from "@/lib/supabase/server";
import {
  buildTrackStoragePath,
  getConfiguredUploadLimit,
  validateMediaFile,
} from "@/lib/tracks/track-editor";

const DEFAULT_AUDIO_LIMIT = 50 * 1024 * 1024;
const DEFAULT_COVER_LIMIT = 10 * 1024 * 1024;

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
    trackId?: unknown;
    kind?: unknown;
    file?: { name?: unknown; type?: unknown; size?: unknown };
  } | null;
  const kind = body?.kind;

  if (
    typeof body?.trackId !== "string" ||
    (kind !== "audio" && kind !== "cover") ||
    !body.file ||
    typeof body.file.name !== "string" ||
    typeof body.file.type !== "string" ||
    typeof body.file.size !== "number"
  ) {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const maxBytes =
    kind === "audio"
      ? getConfiguredUploadLimit(process.env.MAX_AUDIO_UPLOAD_BYTES, DEFAULT_AUDIO_LIMIT)
      : getConfiguredUploadLimit(process.env.MAX_COVER_UPLOAD_BYTES, DEFAULT_COVER_LIMIT);

  try {
    validateMediaFile(
      {
        name: body.file.name,
        type: body.file.type,
        size: body.file.size,
      },
      kind,
      maxBytes,
    );
    const path = buildTrackStoragePath(body.trackId, kind, body.file.name);
    const bucket = kind === "audio" ? "track-audio" : "track-covers";
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Could not authorize the upload." },
        { status: 409 },
      );
    }

    return NextResponse.json({
      bucket,
      path,
      signedUrl: data.signedUrl,
      maxBytes,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid upload." },
      { status: 400 },
    );
  }
}
