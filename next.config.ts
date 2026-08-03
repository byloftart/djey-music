import type { NextConfig } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL;

const nextConfig: NextConfig = {
  allowedDevOrigins: appUrl ? [new URL(appUrl).hostname] : [],
  poweredByHeader: false,
};

export default nextConfig;
