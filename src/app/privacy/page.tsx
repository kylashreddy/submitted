import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = { title: "Privacy — SUBMITTED." };

// Meta requires a public privacy policy + data-deletion instructions for the Instagram DM bot.
const SECTIONS = [
  {
    h: "WHAT WE COLLECT",
    p: "From the request form: your name, email, branch, year, project domain, title, deadline and notes. From Instagram DMs to @submitted.co: your messages and Instagram user ID, so we can reply.",
  },
  {
    h: "WHY",
    p: "Only to reply to you and help with your project. We don't sell or share your data, and we don't run ads with it.",
  },
  {
    h: "THE DM BOT",
    p: "Our Instagram account answers some messages automatically — like checking a REQ number you send. It only shows a request's status, never your name or project details.",
  },
  {
    h: "WHERE IT LIVES",
    p: "Requests are stored in our database (Supabase). Instagram messages stay in Instagram / Meta Business Suite.",
  },
  {
    h: "DELETE YOUR DATA",
    p: "DM @submitted.co or mail bit.geniuses.ac@gmail.com with \"DELETE\" and your REQ number or email. We remove your request within 7 days and confirm when it's done.",
  },
];

export default function Privacy() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <Link href="/" className="mono underline-offset-4 hover:underline">
          ← SUBMITTED.
        </Link>
        <h1 className="display mt-10 text-[15vw] leading-[0.85] md:text-[6rem]">PRIVACY.</h1>
        <p className="mono mt-4 text-ink/60">LAST UPDATED · 13 NOV 2026</p>
        <div className="mt-12 space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.h} className="border-t border-ink pt-4">
              <h2 className="mono">{s.h}</h2>
              <p className="mt-3 text-lg leading-relaxed">{s.p}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
