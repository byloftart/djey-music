import { randomUUID } from "node:crypto";

import { AdminShell } from "@/components/admin/admin-shell";
import { TrackEditor } from "@/components/admin/track-editor";
import { createClient } from "@/lib/supabase/server";
import { getConfiguredUploadLimit } from "@/lib/tracks/track-editor";

const DEFAULT_AUDIO_LIMIT = 50 * 1024 * 1024;

export default async function AddTrackPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tracks")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <AdminShell title={null}>
      <TrackEditor
        maxAudioBytes={getConfiguredUploadLimit(process.env.MAX_AUDIO_UPLOAD_BYTES, DEFAULT_AUDIO_LIMIT)}
        nextDisplayOrder={(data?.display_order ?? -1) + 1}
        trackId={randomUUID()}
      />
    </AdminShell>
  );
}
