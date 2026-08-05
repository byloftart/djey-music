import type { NextConfig } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL;
const allowedDevOrigins = new Set(["localhost", "127.0.0.1"]);

if (appUrl) allowedDevOrigins.add(new URL(appUrl).hostname);

const nextConfig: NextConfig = {
  allowedDevOrigins: [...allowedDevOrigins],
  poweredByHeader: false,
};

export default nextConfig;
