import { NextResponse, type NextRequest } from "next/server";

import {
  OwnerAuthorizationError,
  requireOwner,
} from "@/lib/auth/require-owner";
import { createClient } from "@/lib/supabase/server";

type PreviewRouteProps = {
  params: Promise<{ trackId: string }>;
};

export async function GET(_request: NextRequest, { params }: PreviewRouteProps) {
  try {
    await requireOwner();
  } catch (error) {
    if (error instanceof OwnerAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }

  const { trackId } = await params;
  const supabase = await createClient();
  const { data: track, error } = await supabase
    .from("tracks")
    .select("audio_path")
    .eq("id", trackId)
    .single();

  if (error || !track) {
    return NextResponse.json({ error: "Track not found." }, { status: 404 });
  }

  const { data, error: signedUrlError } = await supabase.storage
    .from("track-audio")
    .createSignedUrl(track.audio_path, 15 * 60);

  if (signedUrlError || !data) {
    return NextResponse.json(
      { error: signedUrlError?.message ?? "Preview is unavailable." },
      { status: 409 },
    );
  }

  return new NextResponse(null, {
    status: 307,
    headers: {
      Location: data.signedUrl,
      "Cache-Control": "private, no-store",
    },
  });
}
