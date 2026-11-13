import { ImageResponse } from "next/og";

// Link preview for WhatsApp / Instagram / iMessage shares.
export const alt = "SUBMITTED. — your project, actually done.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#ECEAE4", color: "#0E0E0E", padding: "56px 64px", border: "2px solid #0E0E0E" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, letterSpacing: 3 }}>
          <span>FOR JAIN UNIVERSITY BTECH · 1ST TO 4TH YEAR</span>
          <span>REPLY IN 24H</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 150, fontWeight: 900, letterSpacing: -8, lineHeight: 0.9 }}>YOUR PROJECT,</div>
          <div style={{ display: "flex", fontSize: 150, fontWeight: 900, letterSpacing: -8, lineHeight: 0.9 }}>
            ACTUALLY DONE<span style={{ color: "#2F4BFF" }}>.</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <span style={{ fontSize: 30 }}>Not bought. Built — with you. Kits, mentors, report + viva prep.</span>
          <span style={{ fontSize: 44, fontWeight: 900, letterSpacing: -2 }}>SUBMITTED.</span>
        </div>
      </div>
    ),
    size,
  );
}
