import { NextResponse, type NextRequest } from "next/server";

import {
  OwnerAuthorizationError,
  requireOwner,
} from "@/lib/auth/require-owner";
import { createClient } from "@/lib/supabase/server";

type CoverRouteProps = {
  params: Promise<{ trackId: string }>;
};

export async function GET(request: NextRequest, { params }: CoverRouteProps) {
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
  const { data: track } = await supabase
    .from("tracks")
    .select("cover_path")
    .eq("id", trackId)
    .single();

  if (!track?.cover_path) {
    return new NextResponse(null, { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from("track-covers")
    .createSignedUrl(track.cover_path, 15 * 60);
  if (error || !data) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.redirect(new URL(data.signedUrl, request.url));
}
