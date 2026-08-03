import Link from "next/link";

import { AdminCatalog, type AdminTrack } from "@/components/admin/admin-catalog";
import { AdminIcon } from "@/components/admin/admin-icon";
import { AdminShell } from "@/components/admin/admin-shell";
import { createClient } from "@/lib/supabase/server";

export default async function AdminCatalogPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tracks")
    .select("id,title,slug,genre,status,display_order")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  const tracks = (data ?? []) as AdminTrack[];

  return (
    <AdminShell
      dock={
        <div className="admin-dock-plaque admin-raised">
          <Link className="admin-primary-action" href="/admin/tracks/new">
            <AdminIcon name="plus" />
            <span>Add Track</span>
          </Link>
        </div>
      }
    >
      <AdminCatalog initialTracks={tracks} loadError={error?.message} />
    </AdminShell>
  );
}
