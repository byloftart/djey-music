import { NextResponse, type NextRequest } from "next/server";

import { getSafeAdminRedirect } from "@/lib/auth/redirect-path";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextPath = getSafeAdminRedirect(url.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(nextPath, url.origin));
    }
  }

  const signInUrl = new URL("/admin/sign-in", url.origin);
  signInUrl.searchParams.set("error", "callback");
  signInUrl.searchParams.set("next", nextPath);
  return NextResponse.redirect(signInUrl);
}
