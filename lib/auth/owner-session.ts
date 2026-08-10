import { isOwnerEmailAllowed } from "@/lib/auth/owner-email";

export class OwnerAuthorizationError extends Error {
  constructor() {
    super("An allowlisted owner session is required.");
    this.name = "OwnerAuthorizationError";
  }
}

export function authorizeOwnerIdentity<
  TIdentity extends { email?: string | null },
>(
  identity: TIdentity | null | undefined,
  verificationError: unknown,
  allowlistValue: string | undefined,
): TIdentity {
  if (
    verificationError ||
    !identity ||
    !isOwnerEmailAllowed(identity.email, allowlistValue)
  ) {
    throw new OwnerAuthorizationError();
  }

  return identity;
}
