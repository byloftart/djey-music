import "server-only";

import type { User } from "@supabase/supabase-js";

import { isOwnerEmailAllowed } from "@/lib/auth/owner-email";
import { createClient } from "@/lib/supabase/server";

export class OwnerAuthorizationError extends Error {
  constructor() {
    super("An allowlisted owner session is required.");
    this.name = "OwnerAuthorizationError";
  }
}

export async function requireOwner(): Promise<User> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (
    error ||
    !data.user ||
    !isOwnerEmailAllowed(data.user.email, process.env.OWNER_EMAIL_ALLOWLIST)
  ) {
    throw new OwnerAuthorizationError();
  }

  return data.user;
}
