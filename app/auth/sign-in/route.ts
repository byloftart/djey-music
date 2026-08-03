import { NextResponse } from "next/server";

import { resolveOwnerLoginEmail } from "@/lib/auth/owner-login";
import { createClient } from "@/lib/supabase/server";

const INVALID_CREDENTIALS = "Unable to sign in with those credentials.";

export async function POST(request: Request) {
  let credentials: { login?: unknown; password?: unknown };

  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 400 });
  }

  const login = typeof credentials.login === "string" ? credentials.login : "";
  const password =
    typeof credentials.password === "string" ? credentials.password : "";
  const email = resolveOwnerLoginEmail(
    login,
    process.env.OWNER_LOGIN,
    process.env.OWNER_LOGIN_EMAIL,
    process.env.OWNER_EMAIL_ALLOWLIST,
  );

  if (!email || !password) {
    return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Owner authentication is not configured yet." },
      { status: 503 },
    );
  }
}
