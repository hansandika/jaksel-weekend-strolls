import { ImageResponse } from "next/og";

export const alt = "Jaksel Weekend Strolls";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1A1614",
          padding: 72,
        }}
      >
        <p style={{ fontSize: 28, letterSpacing: 6, color: "rgba(250,247,242,0.45)" }}>
          JAKSEL
        </p>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <p style={{ fontSize: 72, fontWeight: 700, color: "#FAF7F2", lineHeight: 1.05 }}>
            Weekend Strolls
          </p>
          <p style={{ marginTop: 18, fontSize: 32, color: "rgba(250,247,242,0.62)" }}>
            Finite Sat / Sun food and café paths
          </p>
        </div>
        <p style={{ fontSize: 28, color: "#FF5A3C" }}>TikTok proof · Maps walking route</p>
      </div>
    ),
    size,
  );
}
