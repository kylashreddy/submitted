"use client";

import { useEffect, useRef } from "react";
import { COUNTERS, PROMISES, STUCK_ON } from "@/lib/content";
import { Marquee } from "./Marquee";
import { Reveal } from "./Reveal";
import { SectionLabel, rich } from "./ui";

/** Counts up once when scrolled into view. Server HTML already holds the final number. */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || to === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / 1600);
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))) + suffix;
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, suffix]);
  return (
    <span ref={ref}>
      {to}
      {suffix}
    </span>
  );
}

export function Receipts() {
  return (
    <section
      className="relative bg-night text-paper"
      style={{ backgroundImage: "radial-gradient(120% 38rem at 50% 0%, rgb(150 12 12 / 0.6), rgb(60 6 6 / 0.25) 45%, transparent 75%)" }}
    >
      <div className="mx-auto max-w-[1600px] px-4 pb-16 pt-20 md:px-8 md:pb-24 md:pt-32">
        <SectionLabel n="04" dark>
          THE DEAL
        </SectionLabel>
        <Reveal className="display mt-8 text-[13vw] md:mt-12 md:text-[6.6vw]">{rich("THE DEAL, *in* WRITING.")}</Reveal>

        <dl className="mt-14 grid grid-cols-2 border-t border-paper/25 md:grid-cols-4">
          {COUNTERS.map((c, i) => (
            <div key={c.label} className={`border-b border-paper/25 py-6 md:py-8 ${i % 2 === 0 ? "border-r md:pr-6" : "pl-4 md:border-r md:pl-6"} ${i === 3 ? "md:border-r-0" : ""} ${i === 2 ? "md:pl-6" : ""}`}>
              <dd className="display text-[17vw] leading-[0.85] md:text-[7vw]">
                <Counter to={c.n} suffix={c.suffix} />
              </dd>
              <dt className="mono mt-3 text-paper/60">{c.label}</dt>
            </div>
          ))}
        </dl>

        <ul className="mt-16 grid gap-5 md:grid-cols-3 md:gap-6">
          {PROMISES.map((r, i) => (
            <li key={r.n} className={`border border-paper/25 bg-[#141414] ${i % 3 === 1 ? "md:translate-y-10" : ""} ${i % 2 ? "rotate-[0.6deg]" : "-rotate-[0.6deg]"}`}>
              <div className="mono flex items-center justify-between border-b border-paper/15 px-4 py-2 text-paper/55">
                <span>PROMISE {r.n}</span>
                <span>SUBMITTED.</span>
              </div>
              <div className="p-4">
                <p className="w-fit max-w-[92%] bg-paper px-3.5 py-2.5 text-[1.05rem] leading-snug text-ink">{r.quote}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="pb-14 md:pb-20">
        <p className="mono mx-auto mb-4 max-w-[1600px] px-4 text-paper/50 md:px-8">WE HELP WITH —</p>
        <Marquee items={STUCK_ON} dark={false} duration={55} outline />
      </div>
    </section>
  );
}
