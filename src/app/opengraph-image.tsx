import { ImageResponse } from "next/og";

// Link preview for WhatsApp / Instagram / iMessage shares.
export const alt = "SUBMITTED. — your project, actually done.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Pull just the glyphs we need from Google Fonts (rendered once at build time). */
async function font(family: string, text: string) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`)).text();
  const url = css.match(/src: url\((.+?)\) format/)?.[1];
  if (!url) throw new Error(`font ${family} not found`);
  return (await fetch(url)).arrayBuffer();
}

const HEAD = ["YOUR PROJECT,", "ACTUALLY DONE."];
const KICKER = "FOR JAIN UNIVERSITY BTECH · 1ST–4TH YEAR";
const SUB = "Not bought. Built — with you.";

export default async function OpengraphImage() {
  const [black, mono] = await Promise.all([
    font("Archivo+Black", HEAD.join("") + "SUBMITTED." + SUB),
    font("JetBrains+Mono", KICKER + "REPLY IN 24H"),
  ]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#ECEAE4", color: "#0E0E0E", padding: "56px 64px", fontFamily: "Archivo Black" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "JetBrains Mono", fontSize: 24, letterSpacing: 2, borderTop: "2px solid #0E0E0E", paddingTop: 16 }}>
          <span>{KICKER}</span>
          <span>REPLY IN 24H</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 118, lineHeight: 0.92, letterSpacing: -5 }}>
          <span>{HEAD[0]}</span>
          <span style={{ display: "flex" }}>
            ACTUALLY DONE<span style={{ color: "#2F4BFF" }}>.</span>
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <span style={{ fontSize: 34, letterSpacing: -1 }}>{SUB}</span>
          <span style={{ display: "flex", fontSize: 52, letterSpacing: -2 }}>
            SUBMITTED<span style={{ color: "#2F4BFF" }}>.</span>
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Archivo Black", data: black, weight: 400 },
        { name: "JetBrains Mono", data: mono, weight: 400 },
      ],
    },
  );
}
