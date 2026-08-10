import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { TrackEditor, type EditableTrack } from "@/components/admin/track-editor";
import { createClient } from "@/lib/supabase/server";
import { getConfiguredUploadLimit } from "@/lib/tracks/track-editor";

const DEFAULT_AUDIO_LIMIT = 50 * 1024 * 1024;

type EditTrackPageProps = {
  params: Promise<{ trackId: string }>;
};

export default async function EditTrackPage({ params }: EditTrackPageProps) {
  const { trackId } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tracks")
    .select("id,title,slug,description,audio_path,cover_path,duration_seconds,genre,tags,status,download_enabled,display_order,rights_notice")
    .eq("id", trackId)
    .single();

  if (error || !data) notFound();

  return (
    <AdminShell title={null}>
      <TrackEditor
        initialTrack={data as EditableTrack}
        maxAudioBytes={getConfiguredUploadLimit(process.env.MAX_AUDIO_UPLOAD_BYTES, DEFAULT_AUDIO_LIMIT)}
        nextDisplayOrder={data.display_order}
        trackId={trackId}
      />
    </AdminShell>
  );
}
