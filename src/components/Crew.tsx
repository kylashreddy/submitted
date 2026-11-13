import Image from "next/image";
import { CREW } from "@/lib/content";
import { Reveal } from "./Reveal";
import { SectionLabel, rich } from "./ui";

export function Crew() {
  return (
    <section id="crew" className="mx-auto max-w-[1600px] scroll-mt-16 px-4 py-20 md:px-8 md:py-32">
      <SectionLabel n="06">THE CREW</SectionLabel>
      <Reveal className="display mt-8 text-[13vw] md:mt-12 md:text-[6.6vw]">{rich("SENIORS, NOT *salespeople*.")}</Reveal>

      <ul className="mt-12 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-6">
        {CREW.map((c, i) => (
          <li key={c.role} className={i % 2 ? "mt-10 md:mt-16" : ""}>
            <figure>
              <div className="relative aspect-[3/4] overflow-hidden border border-ink bg-[#1a1a1a] grayscale">
                {c.photo ? (
                  <Image src={c.photo} alt={`Mentor, ${c.role}`} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover contrast-125" />
                ) : (
                  <>
                    {/* placeholder portrait: halftone + initial. Add `photo` in content.ts to replace. */}
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at 50% 38%, #9a9a9a 0 18%, transparent 19%), radial-gradient(ellipse 60% 45% at 50% 100%, #8a8a8a 0 60%, transparent 61%), radial-gradient(#ffffff22 1px, transparent 1.4px)",
                        backgroundSize: "100% 100%, 100% 100%, 6px 6px",
                      }}
                    />
                    <span aria-hidden className="display absolute -bottom-[0.12em] -left-[0.05em] text-[5.5rem] leading-none text-paper/90 md:text-[8rem]">
                      0{i + 1}
                    </span>
                  </>
                )}
                <span className="mono absolute right-2 top-2 bg-paper px-1.5 text-[0.62rem]">SENIOR</span>
              </div>
              <figcaption className="mono mt-3 leading-relaxed">
                <strong className="font-bold">MENTOR 0{i + 1}</strong> — {c.role}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <p className="serif-i mt-20 text-center text-[9vw] leading-[0.95] md:text-[4.4vw]">
        Seniors who&apos;ve been there. Not a call centre.
      </p>
    </section>
  );
}
