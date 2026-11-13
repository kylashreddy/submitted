"use client";

import { useState } from "react";
import { TRACKS } from "@/lib/content";
import { Reveal } from "./Reveal";
import { Arrow, SectionLabel, rich } from "./ui";

export const PREFILL_EVENT = "submitted:prefill";

export function Tracks() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="tracks" className="mx-auto max-w-[1600px] scroll-mt-16 px-4 py-20 md:px-8 md:py-32">
      <SectionLabel n="03">TRACKS</SectionLabel>
      <Reveal className="display mt-8 text-[13vw] md:mt-12 md:text-[6.6vw]">{rich("PICK YOUR *era*.")}</Reveal>

      <div className="mt-12 border-t border-ink">
        {TRACKS.map((t, i) => {
          const isOpen = open === i;
          return (
            <div key={t.year} className={`border-b border-ink transition-colors ${isOpen ? "bg-ink text-paper" : ""}`}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`track-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group grid w-full grid-cols-[1fr_auto] items-center gap-x-4 px-1 py-6 text-left md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_3rem] md:gap-x-8 md:px-3 md:py-9"
              >
                <span className="display text-[11vw] leading-[0.85] md:text-[5vw]">{t.year}</span>
                <span className="display row-start-1 col-start-2 text-4xl leading-none md:col-start-4 md:justify-self-end md:text-5xl" aria-hidden>
                  <span className={`inline-block transition-transform duration-300 ${isOpen ? "rotate-45" : "group-hover:rotate-90"}`}>+</span>
                </span>
                <span className="serif-i col-span-2 mt-2 text-3xl normal-case md:col-span-1 md:col-start-2 md:row-start-1 md:mt-0 md:text-[2.6vw]">
                  &ldquo;{t.tag.toLowerCase()}&rdquo;
                </span>
                <span className={`mono col-span-2 mt-2 md:col-span-1 md:col-start-3 md:row-start-1 md:mt-0 ${isOpen ? "text-paper/70" : "text-ink/60"}`}>
                  {t.stack}
                </span>
              </button>

              <div id={`track-${i}`} className="expand" data-open={isOpen}>
                <div>
                  <div className="grid gap-8 px-1 pb-8 md:grid-cols-[1.1fr_2fr] md:px-3 md:pb-12">
                    <div>
                      <p className="mono text-paper/60">THE {t.year} KIT</p>
                      <p className="display mt-1 text-6xl md:text-7xl">
                        {String(t.includes.length).padStart(2, "0")} <em>things</em>
                      </p>
                      <p className="mono mt-2 text-paper/60">SCOPED TO YOUR SYLLABUS AFTER THE VIBE CHECK</p>
                    </div>
                    <div>
                      <p className="mono mb-3 text-paper/60">WHAT&apos;S INCLUDED</p>
                      <ul className="border-t border-paper/25">
                        {t.includes.map((x, j) => (
                          <li key={x} className="flex gap-4 border-b border-paper/25 py-2.5 text-lg">
                            <span className="mono pt-1 text-paper/65">{String(j + 1).padStart(2, "0")}</span>
                            {x}
                          </li>
                        ))}
                      </ul>
                      <a
                        href="#drop"
                        data-cursor="drop"
                        tabIndex={isOpen ? 0 : -1}
                        onClick={() => window.dispatchEvent(new CustomEvent(PREFILL_EVENT, { detail: { year: i + 1 } }))}
                        className="btn mt-6 w-full border-paper bg-paper text-ink hover:border-blue hover:bg-blue hover:text-paper sm:w-auto"
                      >
                        DROP A {t.year} REQ <Arrow className="arr" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
