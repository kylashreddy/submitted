import { STEPS } from "@/lib/content";
import { Reveal } from "./Reveal";
import { NumberedRow, SectionLabel, rich } from "./ui";

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-[1600px] scroll-mt-16 px-4 py-20 md:px-8 md:py-32">
      <SectionLabel n="02">HOW IT WORKS</SectionLabel>
      <div className="mt-8 grid gap-6 md:mt-12 md:grid-cols-[1.4fr_1fr] md:items-end">
        <Reveal className="display text-[13vw] md:text-[6.6vw]">{rich("FIVE STEPS. *zero* PANIC.")}</Reveal>
        <p className="max-w-sm text-lg leading-snug md:justify-self-end">
          You stay in the driver&apos;s seat. We&apos;re the senior in the passenger seat who actually knows the route.
        </p>
      </div>
      <ol className="mt-12 border-t border-ink">
        {STEPS.map((s, i) => (
          <NumberedRow key={s.title} n={String(i + 1).padStart(2, "0")} title={s.title} body={s.body} />
        ))}
      </ol>
    </section>
  );
}
