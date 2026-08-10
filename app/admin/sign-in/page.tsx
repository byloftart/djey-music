import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/admin/sign-in-form";
import { getSafeAdminRedirect } from "@/lib/auth/redirect-path";
import { SITE_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Owner Sign In · ${SITE_CONFIG.name}`,
};

type SignInPageProps = {
  searchParams: Promise<{
    error?: string;
    login?: string;
    next?: string;
    password?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;

  if (params.login !== undefined || params.password !== undefined) {
    const cleanNext = getSafeAdminRedirect(params.next);
    redirect(
      cleanNext === "/admin"
        ? "/admin/sign-in"
        : `/admin/sign-in?next=${encodeURIComponent(cleanNext)}`,
    );
  }

  const callbackFailed = params.error === "callback";

  return (
    <main className="admin-auth-page">
      <section className="admin-auth-card" aria-labelledby="owner-sign-in-title">
        <div className="admin-auth-brand">
          <h1 id="owner-sign-in-title">
            {SITE_CONFIG.brandLead ? `${SITE_CONFIG.brandLead} ` : null}
            <span>{SITE_CONFIG.brandAccent}</span>
          </h1>
          <p>Admin Panel</p>
        </div>
        <div className="admin-auth-display">OWNER ACCESS</div>
        <SignInForm
          callbackFailed={callbackFailed}
          nextPath={getSafeAdminRedirect(params.next)}
        />
      </section>
    </main>
  );
}
