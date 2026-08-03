import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSafeAdminRedirect } from "@/lib/auth/redirect-path";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let response = NextResponse.next({ request });

  if (!url || !key) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data } = await supabase.auth.getClaims();

  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    request.nextUrl.pathname !== "/admin/sign-in" &&
    !data?.claims
  ) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/admin/sign-in";
    signInUrl.search = "";
    signInUrl.searchParams.set(
      "next",
      getSafeAdminRedirect(`${request.nextUrl.pathname}${request.nextUrl.search}`),
    );
    return NextResponse.redirect(signInUrl);
  }

  return response;
}
