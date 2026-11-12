"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Clip-path wipe on scroll (CSS transition in globals.css). Reduced-motion users get the final state. */
export function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "h2" | "p" | "div";
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Observe the outer element: Chrome counts a target's own clip-path, so a fully
  // clipped element would never report as intersecting.
  return (
    <Tag ref={ref} className={className}>
      <span data-shown={shown} className="reveal block" style={delay ? { transitionDelay: `${delay}s` } : undefined}>
        {children}
      </span>
    </Tag>
  );
}
