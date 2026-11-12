import type { Metadata, Viewport } from "next";
import { Archivo, Archivo_Black, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], display: "swap" });
const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  style: "italic",
  subsets: ["latin"],
  display: "swap",
});
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "SUBMITTED. — your project, actually done.",
  description:
    "Project help for Jain University BTech students, 1st to 4th year. Kits, mentors, report structure and viva prep — built with you, delivered to your inbox before the deadline.",
  openGraph: {
    title: "SUBMITTED. — your project, actually done.",
    description: "Not bought. Built — with you. Kits, mentors, report + viva prep for Jain University BTech students.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ECEAE4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${archivoBlack.variable} ${instrument.variable} ${jetbrains.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
