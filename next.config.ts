import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Dev-only: next dev blocks /_next/* from Cloudflare quick tunnels unless
  // allowlisted. Harmless on Vercel production (`next start` ignores this).
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
