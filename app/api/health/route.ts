import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ service: "open-music-player", status: "ok" });
}
