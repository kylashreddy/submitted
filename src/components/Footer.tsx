const LINKS = [
  { label: "INSTAGRAM", href: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://instagram.com/" },
  { label: "WHATSAPP", href: process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "https://wa.me/" },
  { label: "EMAIL", href: `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@submitted.studio"}` },
];

export function Footer() {
  return (
    <footer className="overflow-hidden border-t border-ink">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 pt-10 md:flex-row md:items-start md:justify-between md:px-8">
        <ul className="mono flex flex-wrap gap-x-8 gap-y-3">
          {LINKS.map((l) => (
            <li key={l.label}>
              <a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="underline-offset-4 hover:underline">
                {l.label} ↗
              </a>
            </li>
          ))}
        </ul>
        <div className="mono text-ink/60 md:text-right">
          <p>© 2026 · MADE BY STUDENTS WHO ALSO HATED DEADLINES</p>
          <p className="mt-1">INDEPENDENT STUDENT CREW · NOT AFFILIATED WITH JAIN UNIVERSITY</p>
        </div>
      </div>
      <p aria-hidden className="display mt-6 select-none whitespace-nowrap px-2 text-center text-[14.6vw] leading-[0.8] tracking-[-0.04em] md:mt-10">
        SUBMITTED.
      </p>
    </footer>
  );
}
