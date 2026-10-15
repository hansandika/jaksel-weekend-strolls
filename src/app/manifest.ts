import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jaksel Weekend Strolls",
    short_name: "Jaksel Strolls",
    description:
      "Finite Sat/Sun food and café strolls for Jakarta Selatan, with TikTok proof and Maps walking routes.",
    start_url: "/",
    display: "standalone",
    background_color: "#1A1614",
    theme_color: "#1A1614",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
