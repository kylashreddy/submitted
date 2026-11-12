"use client";

import { useEffect, useRef } from "react";

/** Small dot that grows into a "DROP IT" disc over anything marked data-cursor="drop". */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.add("has-cursor");

    let x = -100, y = -100, cx = -100, cy = -100, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      el.style.opacity = "1";
      const t = e.target as Element | null;
      el.dataset.mode = t?.closest?.("[data-cursor='drop']") ? "drop" : t?.closest?.("a,button,[role='button'],label,select") ? "link" : "";
    };
    const leave = () => (el.style.opacity = "0");
    const tick = () => {
      const k = reduce ? 1 : 0.28;
      cx += (x - cx) * k;
      cy += (y - cy) * k;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      data-mode=""
      className="group pointer-events-none fixed left-0 top-0 z-[100] opacity-0 transition-opacity duration-200"
    >
      <div
        className="flex h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-paper mix-blend-difference transition-[width,height,background-color] duration-300 ease-out
          group-data-[mode=link]:h-9 group-data-[mode=link]:w-9
          group-data-[mode=drop]:h-24 group-data-[mode=drop]:w-24 group-data-[mode=drop]:bg-ink group-data-[mode=drop]:mix-blend-normal group-data-[mode=drop]:outline group-data-[mode=drop]:outline-1 group-data-[mode=drop]:outline-paper"
      >
        <span className="mono whitespace-nowrap text-[0.66rem] text-paper opacity-0 transition-opacity duration-200 group-data-[mode=drop]:opacity-100">
          DROP IT
        </span>
      </div>
    </div>
  );
}
