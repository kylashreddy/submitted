import { ImageResponse } from "next/og";

// Favicon: ink square, paper "S." with the blue full stop — the wordmark in miniature.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0E0E0E", color: "#ECEAE4", fontSize: 46, fontWeight: 900, letterSpacing: -3 }}>
        S<span style={{ color: "#2F4BFF" }}>.</span>
      </div>
    ),
    size,
  );
}
