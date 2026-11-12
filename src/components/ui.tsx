import type { ReactNode } from "react";

/** "*word*" → italic lowercase serif. One per headline, that's the rule. */
export function rich(text: string): ReactNode[] {
  return text.split(/(\*[^*]+\*)/).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") ? <em key={i}>{part.slice(1, -1)}</em> : part,
  );
}

export function SectionLabel({ n, children, dark }: { n: string; children: ReactNode; dark?: boolean }) {
  return (
    <div className={`mono flex items-center gap-3 border-t pt-3 ${dark ? "border-paper/30 text-paper/70" : "border-ink"}`}>
      <span>{n}</span>
      <span aria-hidden>—</span>
      <span>{children}</span>
    </div>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`h-[1em] w-[1em] shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M2 12h19M14 5l7 7-7 7" strokeLinecap="square" />
    </svg>
  );
}

/** Row that inverts to ink on hover — used for HOW IT WORKS and WHAT'S IN THE DROP. */
export function NumberedRow({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="group relative border-b border-ink transition-colors duration-200 hover:bg-ink hover:text-paper">
      <div className="grid grid-cols-[2.6rem_1fr_auto] items-start gap-x-3 px-1 py-5 md:grid-cols-[5rem_1.1fr_1fr_3rem] md:items-center md:gap-x-6 md:px-3 md:py-7">
        <span className="mono pt-1 md:pt-0">{n}</span>
        <h3 className="display text-[1.55rem] md:text-[2.6rem]">{title}</h3>
        <Arrow className="mt-1 text-2xl transition-transform duration-300 group-hover:translate-x-2 md:order-last md:mt-0 md:justify-self-end md:text-3xl" />
        <p className="col-start-2 col-end-4 mt-2 max-w-md text-[0.95rem] leading-snug opacity-75 md:col-start-auto md:col-end-auto md:mt-0 md:text-base">
          {body}
        </p>
      </div>
    </li>
  );
}
