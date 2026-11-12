"use client";

import { useState } from "react";
import { FAQ } from "@/lib/content";
import { Reveal } from "./Reveal";
import { SectionLabel, rich } from "./ui";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-[1600px] scroll-mt-16 px-4 py-20 md:px-8 md:py-32">
      <SectionLabel n="07">FAQ</SectionLabel>
      <div className="mt-8 grid gap-10 md:mt-12 md:grid-cols-[1fr_1.6fr] md:gap-16">
        <Reveal className="display text-[13vw] md:sticky md:top-24 md:self-start md:text-[5.6vw]">{rich("ASKED *a lot*.")}</Reveal>
        <dl className="border-t border-ink">
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="border-b border-ink">
                <dt>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="mono flex w-full items-center justify-between gap-4 py-5 text-left text-[0.8rem] hover:text-blue"
                  >
                    <span>
                      <span className="mr-3 text-ink/45">Q.0{i + 1}</span>
                      {f.q}
                    </span>
                    <span aria-hidden className="text-lg">{isOpen ? "−" : "+"}</span>
                  </button>
                </dt>
                <dd id={`faq-${i}`} className="expand" data-open={isOpen}>
                  <div>
                    <p className="pb-7 text-2xl leading-[1.15] tracking-tight md:text-[2.1rem]">{f.a}</p>
                  </div>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
