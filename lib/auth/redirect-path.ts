const ADMIN_PATH = /^\/admin(?:\/|\?|$)/;

export function getSafeAdminRedirect(value: string | null | undefined): string {
  if (!value || !ADMIN_PATH.test(value) || value.startsWith("//")) {
    return "/admin";
  }

  return value;
}
