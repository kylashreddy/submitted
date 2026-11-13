"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BRANCHES, DOMAINS, INSTAGRAM, TRACKS } from "@/lib/content";
import { HELP_OPTIONS } from "@/lib/types";
import { EMAIL_RE } from "@/lib/validate";
import { PREFILL_EVENT } from "./Tracks";
import { Arrow, SectionLabel, rich } from "./ui";

type Data = {
  name: string;
  email: string;
  branch: string;
  year: number | null;
  domain: string;
  title: string;
  no_idea: boolean;
  deadline: string;
  help: string[];
  notes: string;
};

const INITIAL: Data = {
  name: "",
  email: "",
  branch: "",
  year: null,
  domain: "",
  title: "",
  no_idea: false,
  deadline: "",
  help: [],
  notes: "",
};

const DRAFT_KEY = "submitted:draft";

const localISO = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const today = () => localISO(new Date());
const plusDays = (n: number) => localISO(new Date(Date.now() + n * 864e5));
const daysUntil = (iso: string) => Math.round((Date.parse(iso) - Date.parse(today())) / 864e5);

const STEPS: { q: string; hint?: string; ok: (d: Data) => boolean; err: string }[] = [
  { q: "FIRST THINGS FIRST. *what's* YOUR NAME?", ok: (d) => d.name.trim().length >= 2, err: "need at least 2 letters" },
  { q: "WHAT'S YOUR *email*?", hint: "WE REPLY BY EMAIL. YOUR KIT LANDS THERE TOO.", ok: (d) => EMAIL_RE.test(d.email.trim()), err: "that email looks off" },
  { q: "WHICH *branch*?", hint: "JAIN UNIVERSITY BTECH ONLY — FOR NOW.", ok: (d) => !!d.branch, err: "pick your branch" },
  { q: "WHICH *year* ARE YOU IN?", ok: (d) => d.year !== null, err: "pick one" },
  { q: "PICK YOUR *domain*.", hint: "NOT SURE? PICK THE CLOSEST. WE'LL SORT IT.", ok: (d) => !!d.domain, err: "pick one" },
  { q: "GOT A *title* IN MIND?", ok: (d) => d.no_idea || d.title.trim().length >= 3, err: "type a rough title or hit 'no idea yet'" },
  { q: "WHEN'S THE *deadline*?", ok: (d) => !!d.deadline && d.deadline >= today(), err: "pick a date that isn't in the past" },
  { q: "WHAT DO YOU *need*?", hint: "PICK AS MANY AS YOU WANT.", ok: (d) => d.help.length > 0, err: "pick at least one" },
  { q: "ANYTHING *else*?", hint: "OPTIONAL. REPORT FORMAT, GUIDE'S DEMANDS, YOUR FEARS.", ok: () => true, err: "" },
];

const field =
  "w-full border-0 border-b-2 border-ink bg-transparent px-0 py-3 text-2xl font-semibold tracking-tight outline-none placeholder:text-ink/25 focus:border-blue md:text-4xl";

function Chip({ on, onClick, children, big }: { on: boolean; onClick: () => void; children: ReactNode; big?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`mono border border-ink transition-colors ${big ? "px-4 py-3.5 text-[0.78rem]" : "px-3 py-2.5"} ${
        on ? "bg-ink text-paper" : "hover:bg-ink/[0.07]"
      }`}
    >
      {on && <span aria-hidden>✓ </span>}
      {children}
    </button>
  );
}

export function RequestForm() {
  const [d, setD] = useState<Data>(INITIAL);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [tried, setTried] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [ref, setRef] = useState<number | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const moved = useRef(false);

  const set = <K extends keyof Data>(k: K, v: Data[K]) => setD((p) => ({ ...p, [k]: v }));

  // restore / persist an unsent draft (per-device convenience only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setD({ ...INITIAL, ...JSON.parse(raw) });
    } catch {}
  }, []);
  useEffect(() => {
    try {
      if (state !== "done") localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    } catch {}
  }, [d, state]);

  // tracks section can preselect a year
  useEffect(() => {
    const on = (e: Event) => set("year", (e as CustomEvent<{ year: number }>).detail.year);
    window.addEventListener(PREFILL_EVENT, on);
    return () => window.removeEventListener(PREFILL_EVENT, on);
  }, []);

  // move focus into the new step — but never on first paint (would scroll the page)
  useEffect(() => {
    if (!moved.current) return;
    const t = setTimeout(() => panel.current?.querySelector<HTMLElement>("input:not([type=range]),textarea,button[aria-pressed]")?.focus({ preventScroll: true }), 320);
    return () => clearTimeout(t);
  }, [step]);

  const cur = STEPS[step];
  const valid = cur.ok(d);
  const last = step === STEPS.length - 1;

  const go = (n: number) => {
    moved.current = true;
    setDir(n > step ? 1 : -1);
    setTried(false);
    setStep(n);
  };

  const next = () => {
    if (!valid) return setTried(true);
    if (last) return submit();
    go(step + 1);
  };

  // single-choice steps advance on their own
  const pickAndGo = <K extends keyof Data>(k: K, v: Data[K]) => {
    set(k, v);
    setTimeout(() => go(step + 1), 220);
  };

  async function submit() {
    setState("sending");
    setMsg("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...d, website: honeypot.current?.value ?? "" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Something broke on our side");
      setRef(json.ref ?? null);
      setState("done");
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
    } catch (e) {
      setState("error");
      setMsg(e instanceof Error ? e.message : "Something broke on our side");
    }
  }

  const reset = () => {
    setD(INITIAL);
    setStep(0);
    setState("idle");
    setRef(null);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "TEXTAREA" && !(e.metaKey || e.ctrlKey)) return;
    if (tag === "BUTTON") return;
    e.preventDefault();
    next();
  };

  const body = (() => {
    switch (step) {
      case 0:
        return <input className={field} value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="Type it here" autoComplete="name" aria-label="Your name" />;
      case 1:
        return (
          <input className={field} type="email" inputMode="email" value={d.email} onChange={(e) => set("email", e.target.value)} placeholder="you@college.edu" autoComplete="email" aria-label="Email" />
        );
      case 2:
        return (
          <div className="flex flex-wrap gap-2">
            {BRANCHES.map((b) => (
              <Chip big key={b} on={d.branch === b} onClick={() => pickAndGo("branch", b)}>
                {b}
              </Chip>
            ))}
          </div>
        );
      case 3:
        return (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
            {TRACKS.map((t, i) => {
              const on = d.year === i + 1;
              return (
                <button
                  key={t.year}
                  type="button"
                  aria-pressed={on}
                  onClick={() => pickAndGo("year", i + 1)}
                  className={`flex aspect-[4/3.4] flex-col justify-between border border-ink p-3 text-left transition-colors md:aspect-[3/3.6] ${on ? "bg-ink text-paper" : "hover:bg-ink/[0.07]"}`}
                >
                  <span className="display text-[4.5rem] leading-[0.8] md:text-[6rem]">{i + 1}</span>
                  <span>
                    <span className="mono block">{t.year}</span>
                    <span className="serif-i block text-xl leading-tight opacity-70">{t.tag.toLowerCase()}</span>
                  </span>
                </button>
              );
            })}
          </div>
        );
      case 4:
        return (
          <div className="flex flex-wrap gap-2">
            {[...DOMAINS, "OTHER"].map((x) => (
              <Chip big key={x} on={d.domain === x} onClick={() => pickAndGo("domain", x)}>
                {x}
              </Chip>
            ))}
          </div>
        );
      case 5:
        return (
          <div className="space-y-5">
            <input
              className={`${field} ${d.no_idea ? "opacity-30" : ""}`}
              value={d.title}
              disabled={d.no_idea}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Smart parking with ESP32"
              aria-label="Project title or idea"
            />
            <Chip on={d.no_idea} onClick={() => set("no_idea", !d.no_idea)}>
              NO IDEA YET, HELP ME PICK
            </Chip>
          </div>
        );
      case 6: {
        const days = d.deadline ? daysUntil(d.deadline) : null;
        return (
          <div className="space-y-5">
            <input type="date" className={field} min={today()} value={d.deadline} onChange={(e) => set("deadline", e.target.value)} aria-label="Deadline" />
            <div className="flex flex-wrap gap-2">
              {[
                ["1 DAY 🔥", 1],
                ["3 DAYS 💀", 3],
                ["1 WEEK", 7],
                ["2 WEEKS", 14],
                ["1 MONTH", 30],
              ].map(([l, n]) => (
                <Chip key={l} on={d.deadline === plusDays(n as number)} onClick={() => set("deadline", plusDays(n as number))}>
                  {l}
                </Chip>
              ))}
            </div>
            {days !== null && days >= 0 && (
              <p className="mono">
                ↳ {days} DAY{days === 1 ? "" : "S"} OUT.{" "}
                {days <= 1 ? (
                  <span className="text-alarm">DUE TOMORROW. SEND IT NOW — WE&apos;LL TELL YOU STRAIGHT WHAT&apos;S DOABLE BY THEN.</span>
                ) : days < 4 ? (
                  <span className="text-alarm">TIGHT. WE&apos;LL BE HONEST ABOUT WHAT&apos;S DOABLE.</span>
                ) : (
                  "PLENTY. WE LOVE AN EARLY BIRD."
                )}
              </p>
            )}
          </div>
        );
      }
      case 7:
        return (
          <div className="flex flex-wrap gap-2">
            {HELP_OPTIONS.map((h) => (
              <Chip big key={h} on={d.help.includes(h)} onClick={() => set("help", d.help.includes(h) ? d.help.filter((x) => x !== h) : [...d.help, h])}>
                {h}
              </Chip>
            ))}
          </div>
        );
      default:
        return (
          <textarea
            className={`${field} min-h-[9rem] resize-y text-xl md:text-2xl`}
            value={d.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Guide wants it in Flask, not Django. Also I've never used GitHub."
            aria-label="Anything else"
          />
        );
    }
  })();

  return (
    <section id="drop" className="mx-auto max-w-[1600px] scroll-mt-16 px-4 py-20 md:px-8 md:py-32">
      <SectionLabel n="08">THE FORM</SectionLabel>
      <div className="mt-8 grid gap-10 md:mt-12 md:grid-cols-[1fr_1.7fr] md:gap-14">
        <div>
          <h2 className="display text-[15vw] md:text-[6vw]">{rich("DROP YOUR *req*.")}</h2>
          <ul className="mono mt-8 space-y-2 text-ink/60">
            <li>↳ {STEPS.length} QUICK ONES. ~2 MIN.</li>
            <li>↳ JAIN UNIVERSITY BTECH ONLY.</li>
            <li>↳ REPLY WITHIN 24H.</li>
            <li className="hidden md:block">↳ PRESS ENTER ↵ TO MOVE ON.</li>
          </ul>
          <a href={INSTAGRAM.dm} target="_blank" rel="noreferrer" className="mono mt-8 inline-block border-b border-ink pb-1 hover:text-blue">
            HATE FORMS? DM {INSTAGRAM.handle.toUpperCase()} ↗
          </a>
        </div>

        <MotionConfig reducedMotion="user">
          <div className="min-w-0 border border-ink bg-paper" onKeyDown={onKey}>
            {state === "done" ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[460px] flex-col justify-between p-5 md:p-10" role="status">
                <p className="mono">{ref ? `REQ #${String(ref).padStart(4, "0")} · RECEIVED` : "RECEIVED"}</p>
                <div>
                  <p className="display text-[12vw] leading-[0.8] md:text-[6.6vw]">SUBMITTED.</p>
                  <p className="serif-i mt-4 text-3xl leading-tight md:text-5xl">check your inbox in 24h — or DM us your REQ number for a faster reply.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a href={INSTAGRAM.dm} target="_blank" rel="noreferrer" className="btn btn-primary">
                    {ref ? `DM US REQ #${String(ref).padStart(4, "0")}` : "DM US ON INSTAGRAM"} ↗
                  </a>
                  <button type="button" onClick={reset} className="btn btn-ghost">
                    DROP ANOTHER ONE
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-ink px-4 py-3 md:px-6">
                  <span className="mono" aria-live="polite">
                    STEP {String(step + 1).padStart(2, "0")} / {STEPS.length}
                  </span>
                  <span className="mono text-ink/45">{last ? "LAST ONE" : `${STEPS.length - step - 1} TO GO`}</span>
                </div>
                <div className="h-1 bg-ink/10">
                  <div className="h-full bg-blue transition-[width] duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
                </div>

                <div className="relative min-h-[430px] overflow-hidden px-4 pb-6 pt-7 md:min-h-[460px] md:px-8 md:pt-10">
                  <AnimatePresence mode="wait" custom={dir} initial={false}>
                    <motion.div
                      key={step}
                      ref={panel}
                      custom={dir}
                      initial={{ x: dir * 48, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: dir * -48, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.2, 0.8, 0.1, 1] }}
                    >
                      <h3 className="display text-[2.15rem] leading-[0.9] md:text-[3.4rem]">{rich(cur.q)}</h3>
                      {cur.hint && <p className="mono mt-3 text-ink/50">{cur.hint}</p>}
                      <div className="mt-8">{body}</div>
                      {tried && !valid && <p className="mono mt-4 text-alarm">↳ {cur.err}</p>}
                    </motion.div>
                  </AnimatePresence>
                  {/* honeypot — real humans never see this */}
                  <input ref={honeypot} name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0" />
                </div>

                {state === "error" && <p className="mono border-t border-ink bg-alarm px-4 py-2 text-paper md:px-6">↳ {msg}. TRY AGAIN?</p>}

                <div className="flex items-stretch border-t border-ink">
                  <button type="button" onClick={() => go(step - 1)} disabled={step === 0} className="mono border-r border-ink px-4 disabled:opacity-25 md:px-6">
                    ← BACK
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    disabled={state === "sending"}
                    data-cursor={last ? "drop" : undefined}
                    className={`btn flex-1 border-0 ${valid ? "btn-primary" : "bg-ink/80 text-paper"}`}
                  >
                    {state === "sending" ? "SENDING…" : last ? "SEND IT" : step === 5 && d.no_idea ? "HELP ME PICK" : "NEXT"} <Arrow className="arr" />
                  </button>
                </div>
              </>
            )}
          </div>
        </MotionConfig>
      </div>
    </section>
  );
}
