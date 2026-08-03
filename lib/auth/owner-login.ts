import { normalizeEmail, parseOwnerEmailAllowlist } from "./owner-email";

export function resolveOwnerLoginEmail(
  submittedLogin: string,
  configuredLogin: string | undefined,
  configuredEmail: string | undefined,
  allowlistValue: string | undefined,
): string | null {
  const login = submittedLogin.trim().toLowerCase();
  const expectedLogin = configuredLogin?.trim().toLowerCase();
  const email = configuredEmail ? normalizeEmail(configuredEmail) : "";

  if (!expectedLogin || login !== expectedLogin) {
    return null;
  }

  return parseOwnerEmailAllowlist(allowlistValue).has(email) ? email : null;
}
