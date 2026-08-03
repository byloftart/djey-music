import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ service: "djey-music", status: "ok" });
}
