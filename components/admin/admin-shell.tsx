"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminIcon } from "@/components/admin/admin-icon";
import { createClient } from "@/lib/supabase/client";

type AdminShellProps = {
  children: React.ReactNode;
  dock?: React.ReactNode;
  title?: string | null;
};

export function AdminShell({ children, dock, title = "Admin Panel" }: AdminShellProps) {
  const router = useRouter();
  const accountRef = useRef<HTMLDivElement>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const themeFrame = window.requestAnimationFrame(() => {
      setDark(window.localStorage.getItem("djey-admin-theme") === "dark-amber");
    });

    const updateViewport = () => {
      const height = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty("--admin-vh", `${height}px`);
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.visualViewport?.addEventListener("resize", updateViewport);
    return () => {
      window.cancelAnimationFrame(themeFrame);
      window.removeEventListener("resize", updateViewport);
      window.visualViewport?.removeEventListener("resize", updateViewport);
    };
  }, []);

  useEffect(() => {
    if (!accountOpen) return;
    const close = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [accountOpen]);

  function toggleTheme() {
    const nextDark = !dark;
    setDark(nextDark);
    window.localStorage.setItem(
      "djey-admin-theme",
      nextDark ? "dark-amber" : "white-neon",
    );
  }

  async function signOut() {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } finally {
      router.replace("/admin/sign-in");
      router.refresh();
    }
  }

  return (
    <div className="admin-stage">
      <div className={`admin-shell${dark ? " theme-dark-amber" : ""}`}>
        <header className="admin-header">
          <div className="admin-header-plaque admin-raised">
            <div className="admin-account" ref={accountRef}>
              <button
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                aria-label="Account"
                className="admin-round-button"
                onClick={() => setAccountOpen((open) => !open)}
                type="button"
              >
                <AdminIcon name="user" />
              </button>
              {accountOpen ? (
                <div className="admin-popover admin-account-menu" role="menu">
                  <button disabled={signingOut} onClick={signOut} role="menuitem" type="button">
                    <AdminIcon name="log-out" size={16} />
                    {signingOut ? "Signing Out…" : "Sign Out"}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="admin-brand">
              <p>
                DJey <span>Music</span>
              </p>
              {title ? <h1>{title}</h1> : null}
            </div>

            <button
              aria-label={dark ? "Switch to White Neon theme" : "Switch to Dark Amber theme"}
              className="admin-round-button admin-theme-button"
              onClick={toggleTheme}
              type="button"
            >
              <AdminIcon name={dark ? "sun" : "moon"} />
            </button>
          </div>
        </header>

        {children}

        {dock ? <footer className="admin-dock">{dock}</footer> : null}
      </div>
    </div>
  );
}
