"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { getSafeAdminRedirect } from "@/lib/auth/redirect-path";

type SignInFormProps = {
  callbackFailed: boolean;
  nextPath: string;
};

export function SignInForm({ callbackFailed, nextPath }: SignInFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(
    callbackFailed ? "The sign-in link could not be completed. Try again." : "",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const login = String(formData.get("login") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const response = await fetch("/auth/sign-in", {
        body: JSON.stringify({ login, password }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        setMessage("Unable to sign in with those credentials.");
        return;
      }

      router.replace(getSafeAdminRedirect(nextPath));
      router.refresh();
    } catch {
      setMessage("Owner authentication is not configured yet.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-auth-form" method="post" onSubmit={handleSubmit}>
      <label>
        <span>Login</span>
        <input
          autoCapitalize="none"
          autoComplete="username"
          name="login"
          required
          spellCheck={false}
          type="text"
        />
      </label>
      <label>
        <span>Password</span>
        <input
          autoComplete="current-password"
          name="password"
          required
          type="password"
        />
      </label>
      <p className="admin-auth-message" aria-live="polite">
        {message}
      </p>
      <button disabled={pending} type="submit">
        {pending ? "Signing In…" : "Sign In"}
      </button>
    </form>
  );
}
