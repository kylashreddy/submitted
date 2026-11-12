"use client";

import { useEffect, useState } from "react";
import { STATS } from "@/lib/content";
import { Arrow } from "./ui";

const LINKS = [
  { href: "#how", label: "HOW" },
  { href: "#tracks", label: "TRACKS" },
  { href: "#crew", label: "CREW" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-ink bg-paper/90 backdrop-blur-[2px]">
        <nav className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 md:h-16 md:px-8" aria-label="Main">
          <a href="#top" className="display text-xl tracking-tight md:text-2xl">
            SUBMITTED.
          </a>
          <ul className="mono hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-ink after:transition-all hover:after:w-full">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#drop" data-cursor="drop" className="btn btn-primary hidden !py-3 md:inline-flex">
            DROP YOUR REQ <Arrow className="arr" />
          </a>
          <button
            type="button"
            className="mono -mr-2 px-2 py-3 md:hidden"
            aria-expanded={open}
            aria-controls="drawer"
            onClick={() => setOpen(true)}
          >
            MENU ☰
          </button>
        </nav>
      </header>

      {/* full-screen dark drawer (mobile) */}
      <div
        id="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
        className="fixed inset-0 z-[60] flex flex-col bg-night px-4 pb-6 text-paper md:hidden"
        style={{ backgroundImage: "radial-gradient(130% 55% at 50% 0%, rgb(150 12 12 / 0.55), transparent 70%)" }}
      >
        <div className="flex h-14 items-center justify-between border-b border-paper/20">
          <span className="display text-xl">SUBMITTED.</span>
          <button type="button" className="mono -mr-2 px-2 py-3" onClick={() => setOpen(false)}>
            CLOSE ✕
          </button>
        </div>
        <ul className="mt-6 flex-1">
          {[...LINKS, { href: "#drop", label: "DROP IT" }].map((l, i) => (
            <li key={l.href} className="border-b border-paper/15">
              <a href={l.href} onClick={() => setOpen(false)} className="flex items-baseline gap-4 py-3">
                <span className="mono text-paper/50">0{i + 1}</span>
                <span className="display text-[15vw] leading-[0.9]">{l.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mono mb-4 text-paper/70">
          <span className="pulse mr-2 inline-block h-2 w-2 rounded-full bg-blue align-middle" />
          {STATS.shipped} PROJECTS SHIPPED · {STATS.branches} BRANCHES · {STATS.vivasFailed} VIVAS FAILED
        </p>
        <a href="#drop" onClick={() => setOpen(false)} className="btn w-full border-paper bg-paper text-ink">
          DROP YOUR REQUIREMENT <Arrow className="arr" />
        </a>
      </div>
    </>
  );
}
