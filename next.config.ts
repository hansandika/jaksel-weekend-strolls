import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Phone testing uses a Cloudflare quick tunnel. next dev blocks /_next/*
  // from that origin unless it is allowlisted (the overlay Hans hit).
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
