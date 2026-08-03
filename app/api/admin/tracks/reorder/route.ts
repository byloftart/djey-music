import { NextResponse, type NextRequest } from "next/server";

import {
  OwnerAuthorizationError,
  requireOwner,
} from "@/lib/auth/require-owner";
import { createClient } from "@/lib/supabase/server";

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

  const body: unknown = await request.json().catch(() => null);
  const orderedIds =
    body && typeof body === "object" && "orderedIds" in body
      ? (body as { orderedIds?: unknown }).orderedIds
      : undefined;

  if (
    !Array.isArray(orderedIds) ||
    orderedIds.length === 0 ||
    orderedIds.some((id) => typeof id !== "string" || !UUID_PATTERN.test(id)) ||
    new Set(orderedIds).size !== orderedIds.length
  ) {
    return NextResponse.json(
      { error: "A unique ordered track id list is required." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("reorder_tracks", {
    ordered_ids: orderedIds,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
