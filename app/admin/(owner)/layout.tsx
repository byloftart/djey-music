import { redirect } from "next/navigation";

import "../admin.css";

import {
  OwnerAuthorizationError,
  requireOwner,
} from "@/lib/auth/require-owner";

export const dynamic = "force-dynamic";

export default async function OwnerAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  try {
    await requireOwner();
  } catch (error) {
    if (error instanceof OwnerAuthorizationError) {
      redirect("/admin/sign-in?next=/admin");
    }
    throw error;
  }

  return children;
}
