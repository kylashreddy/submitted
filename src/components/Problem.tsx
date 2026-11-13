import { Reveal } from "./Reveal";
import { SectionLabel } from "./ui";

const LINES = [
  { text: "3 DAYS TO SUBMISSION.", note: "T-72:00:00" },
  { text: "0 LINES OF CODE.", note: "GIT LOG: EMPTY" },
  { text: "GUIDE NOT REPLYING.", note: "SEEN 11:42 PM" },
];

export function Problem() {
  return (
    <section className="mx-auto max-w-[1600px] px-4 py-20 md:px-8 md:py-36">
      <SectionLabel n="01">THE PROBLEM</SectionLabel>
      <div className="mt-10 md:mt-16">
        {LINES.map((l, i) => (
          <div key={l.text} className="flex flex-col border-b border-ink/20 py-2 md:flex-row md:items-end md:justify-between md:gap-6">
            <Reveal className="display text-[12.5vw] md:text-[7.4vw]" delay={i * 0.08}>
              {l.text}
            </Reveal>
            <span className="mono pb-1 text-ink/65 md:pb-[1.2vw]">{l.note}</span>
          </div>
        ))}
        <Reveal as="p" className="display mt-4 text-right text-[20vw] md:text-[11vw]" delay={0.2}>
          <em>we know.</em>
        </Reveal>
      </div>
      <p className="mt-8 max-w-md text-lg leading-snug md:ml-auto md:mr-0">
        Every one of us has been that kid at 3 AM googling &ldquo;final year project ideas with source code&rdquo;. That&apos;s why
        this exists.
      </p>
    </section>
  );
}
