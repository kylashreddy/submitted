import { UNIVERSITY } from "./content";
import { HELP_OPTIONS, type RequestInput } from "./types";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Server-side check of the public form payload. Never trust the client. */
export function parseRequest(body: unknown): { data: RequestInput } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Bad payload" };
  const b = body as Record<string, unknown>;

  const name = str(b.name, 80);
  const email = str(b.email, 120).toLowerCase();
  const phone = ""; // phone numbers are no longer collected; column kept for older rows
  const college = UNIVERSITY; // site is Jain-only; never taken from the client
  const branch = str(b.branch, 40);
  const domain = str(b.domain, 40);
  const no_idea = b.no_idea === true;
  const title = no_idea ? "" : str(b.title, 200);
  const deadline = str(b.deadline, 10);
  const notes = str(b.notes, 2000);
  const year = Number(b.year);
  const help = Array.isArray(b.help)
    ? b.help.filter((h): h is string => typeof h === "string" && (HELP_OPTIONS as readonly string[]).includes(h))
    : [];

  if (name.length < 2) return { error: "Name is required" };
  if (!EMAIL_RE.test(email)) return { error: "Email looks off" };
  if (![1, 2, 3, 4].includes(year)) return { error: "Pick a year" };
  if (!branch) return { error: "Branch is required" };
  if (!domain) return { error: "Pick a domain" };
  if (!no_idea && title.length < 3) return { error: "Add a title or tick 'no idea yet'" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline) || Number.isNaN(Date.parse(deadline))) return { error: "Deadline looks off" };
  if (help.length === 0) return { error: "Pick at least one thing you need help with" };

  return {
    data: { name, email, phone, college, year: year as 1 | 2 | 3 | 4, branch, domain, title, no_idea, deadline, help, notes },
  };
}
