import { PublicPlayer } from "@/components/player/public-player";
import { createClient } from "@/lib/supabase/server";
import {
  buildPublicPlayerTracks,
  type PublicTrackRow,
} from "@/lib/tracks/public-player";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let rows: PublicTrackRow[] = [];
  let loadError = false;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tracks")
      .select(
        "id,title,audio_path,duration_seconds,genre,status,published_at,display_order",
      )
      .eq("status", "published")
      .order("display_order", { ascending: true });

    if (error) {
      loadError = true;
    } else {
      rows = (data ?? []) as PublicTrackRow[];
    }
  } catch {
    loadError = true;
  }

  return (
    <PublicPlayer
      initialTracks={buildPublicPlayerTracks(rows)}
      loadError={loadError}
    />
  );
}
