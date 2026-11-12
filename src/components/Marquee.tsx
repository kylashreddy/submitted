import { DOMAINS } from "@/lib/content";

export function Marquee({
  items = DOMAINS,
  dark = true,
  duration = 30,
  outline = false,
}: {
  items?: string[];
  dark?: boolean;
  duration?: number;
  outline?: boolean;
}) {
  const run = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((d) => (
        <span key={d} className="flex items-center">
          <span
            className="display whitespace-nowrap px-5 text-4xl md:text-6xl"
            style={outline ? { color: "transparent", WebkitTextStroke: "1px rgb(236 234 228 / 0.55)" } : undefined}
          >
            {d}
          </span>
          <span className="serif-i text-4xl md:text-6xl">·</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`overflow-hidden border-y py-4 md:py-5 ${dark ? "border-ink bg-ink text-paper" : "border-paper/20"}`}>
      <div className="marquee" style={{ "--dur": `${duration}s` } as React.CSSProperties}>
        {run(false)}
        {run(true)}
      </div>
    </div>
  );
}
