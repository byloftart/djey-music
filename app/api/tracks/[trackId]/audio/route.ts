import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type PublicAudioRouteProps = {
  params: Promise<{ trackId: string }>;
};

export async function GET(
  _request: Request,
  { params }: PublicAudioRouteProps,
) {
  const { trackId } = await params;

  try {
    const supabase = await createClient();
    const { data: track, error: trackError } = await supabase
      .from("tracks")
      .select("audio_path")
      .eq("id", trackId)
      .eq("status", "published")
      .maybeSingle();

    if (trackError || !track) {
      return NextResponse.json({ error: "Track not found." }, { status: 404 });
    }

    const { data, error: signedUrlError } = await supabase.storage
      .from("track-audio")
      .createSignedUrl(track.audio_path, 60 * 60);

    if (signedUrlError || !data) {
      return NextResponse.json(
        { error: "Audio is temporarily unavailable." },
        { status: 503 },
      );
    }

    return new NextResponse(null, {
      status: 307,
      headers: {
        Location: data.signedUrl,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Audio is temporarily unavailable." },
      { status: 503 },
    );
  }
}
