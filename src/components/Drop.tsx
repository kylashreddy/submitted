import { DROP } from "@/lib/content";
import { Reveal } from "./Reveal";
import { NumberedRow, SectionLabel, rich } from "./ui";

export function Drop() {
  return (
    <section className="mx-auto max-w-[1600px] px-4 py-20 md:px-8 md:py-32">
      <SectionLabel n="05">WHAT&apos;S IN THE DROP</SectionLabel>
      <div className="mt-8 grid gap-6 md:mt-12 md:grid-cols-[1.4fr_1fr] md:items-end">
        <Reveal className="display text-[13vw] md:text-[6.6vw]">{rich("THE *whole* KIT.")}</Reveal>
        <p className="mono max-w-sm text-ink/60 md:justify-self-end">
          ONE INBOX DROP · ZIP + LINKS · EXACT CONTENTS DEPEND ON YOUR TRACK
        </p>
      </div>
      <ol className="mt-12 border-t border-ink">
        {DROP.map((d, i) => (
          <NumberedRow key={d.title} n={String(i + 1).padStart(2, "0")} title={d.title} body={d.body} />
        ))}
      </ol>
    </section>
  );
}
