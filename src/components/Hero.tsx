import { Arrow } from "./ui";

const WORDS = ["YOUR", "PROJECT,", "*actually*", "DONE."];

function Ticket() {
  const rows: [string, string][] = [
    ["DOMAIN", "ML"],
    ["YEAR", "3RD"],
    ["DUE IN", "9 DAYS"],
  ];
  return (
    <div className="relative mx-auto w-full max-w-[340px] rotate-[-4deg] md:rotate-[5deg] md:max-w-[380px]" aria-label="Example request ticket">
      <div className="border border-ink bg-paper-2">
        <div className="flex items-center justify-between border-b border-ink bg-ink px-4 py-2 text-paper">
          <span className="mono">REQ #0247</span>
          <span className="mono text-paper/60">12.11.26</span>
        </div>
        <div className="px-4 pb-4 pt-3">
          <p className="display text-3xl leading-[0.9]">
            CROP DISEASE <em>detector</em>
          </p>
          <dl className="mt-4 divide-y divide-ink/25 border-y border-ink/25">
            {rows.map(([k, v]) => (
              <div key={k} className="mono flex justify-between py-1.5">
                <dt className="text-ink/65">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        {/* perforation */}
        <div className="relative h-0 border-t border-dashed border-ink">
          <span className="absolute -left-[9px] -top-[9px] h-[18px] w-[18px] rounded-full border border-ink bg-paper [clip-path:inset(0_0_0_50%)]" />
          <span className="absolute -right-[9px] -top-[9px] h-[18px] w-[18px] rounded-full border border-ink bg-paper [clip-path:inset(0_50%_0_0)]" />
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="mono">
            STATUS: IN PROGRESS <span className="pulse ml-1 inline-block h-2 w-2 rounded-full bg-blue align-middle" />
          </span>
          <span
            aria-hidden
            className="h-7 w-16"
            style={{ background: "repeating-linear-gradient(90deg,#0E0E0E 0 2px,transparent 2px 4px,#0E0E0E 4px 5px,transparent 5px 8px)" }}
          />
        </div>
      </div>
      <span className="mono absolute -bottom-7 right-0 rotate-[-2deg] bg-ink px-2 py-1 text-paper">↳ SAMPLE TICKET</span>
    </div>
  );
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <span
        aria-hidden
        className="display pointer-events-none absolute -bottom-[2vw] left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-[23vw] text-ink/[0.08] md:-bottom-[3vw]"
      >
        SUBMITTED
      </span>

      <div className="relative mx-auto grid max-w-[1600px] gap-12 px-4 pb-20 pt-8 md:grid-cols-[1.5fr_1fr] md:items-center md:gap-8 md:px-8 md:pb-32 md:pt-16">
        <div>
          <p className="mono mb-6 flex flex-wrap gap-x-2">
            <span>00</span>
            <span aria-hidden>—</span>
            <span>FOR JAIN UNIVERSITY BTECH — 1ST TO 4TH YEAR</span>
          </p>
          <h1 className="display text-[16.2vw] md:text-[min(9.6vw,10rem)]">
            {WORDS.map((w, i) => (
              <span key={w} className="rise mr-[0.18em]">
                <span style={{ "--i": i } as React.CSSProperties}>
                  {w.startsWith("*") ? <em className="pr-[0.06em]">{w.slice(1, -1)}</em> : w}
                </span>
              </span>
            ))}
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-snug md:text-xl">
            Not bought. <strong className="font-semibold">Built — with you.</strong> Kits, mentors, report structure and viva prep,
            straight to your inbox before the deadline hits.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#drop" data-cursor="drop" className="btn btn-primary">
              DROP YOUR REQUIREMENT <Arrow className="arr" />
            </a>
            <a href="#how" className="btn btn-ghost">
              SEE HOW IT WORKS
            </a>
          </div>
        </div>
        <Ticket />
      </div>
    </section>
  );
}
