import "server-only";

import type { User } from "@supabase/supabase-js";

import {
  authorizeOwnerIdentity,
} from "@/lib/auth/owner-session";
import { createClient } from "@/lib/supabase/server";

export { OwnerAuthorizationError } from "@/lib/auth/owner-session";

export async function requireOwner(): Promise<User> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  return authorizeOwnerIdentity(
    data.user,
    error,
    process.env.OWNER_EMAIL_ALLOWLIST,
  );
}
