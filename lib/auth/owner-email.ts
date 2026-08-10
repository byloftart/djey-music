const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function parseOwnerEmailAllowlist(value: string | undefined): Set<string> {
  if (!value) {
    return new Set();
  }

  return new Set(
    value
      .split(",")
      .map(normalizeEmail)
      .filter((email) => EMAIL_PATTERN.test(email)),
  );
}

export function isOwnerEmailAllowed(
  email: string | null | undefined,
  allowlistValue: string | undefined,
): boolean {
  if (!email) {
    return false;
  }

  return parseOwnerEmailAllowlist(allowlistValue).has(normalizeEmail(email));
}
