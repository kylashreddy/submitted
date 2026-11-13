import Link from "next/link";
import { Footer } from "./Footer";

/** Shared layout for /privacy and /terms: big title, then numbered-feel sections. */
export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: { h: string; p: string }[] }) {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <Link href="/" className="mono underline-offset-4 hover:underline">
          ← SUBMITTED.
        </Link>
        <h1 className="display mt-10 text-[15vw] leading-[0.85] md:text-[6rem]">{title}</h1>
        <p className="mono mt-4 text-ink/60">LAST UPDATED · {updated}</p>
        <div className="mt-12 space-y-10">
          {sections.map((s) => (
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
