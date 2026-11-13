import { createHmac, timingSafeEqual } from "crypto";
import { getRequestByRef, updateRequest } from "./store";
import type { Status } from "./types";

// Instagram DM bot. Meta calls /api/instagram/webhook for every DM to @submitted.co;
// we answer keyword messages ("REQ #0252", "price?", "due tomorrow") and stay quiet
// on everything else so a human can reply. Meta's own auto reply handles the first DM.

const GRAPH = "https://graph.instagram.com/v23.0";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://submitted-six.vercel.app";
const FORM = `${SITE.replace(/^https?:\/\//, "")}/#drop`;

export const igEnabled = () => Boolean(process.env.IG_ACCESS_TOKEN && process.env.IG_APP_SECRET);

/** Meta signs each webhook body with the Instagram app secret (X-Hub-Signature-256). */
export function validSignature(raw: string, header: string | null) {
  const secret = process.env.IG_APP_SECRET;
  if (!secret || !header?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", secret).update(raw).digest();
  const got = Buffer.from(header.slice(7), "hex");
  return got.length === expected.length && timingSafeEqual(got, expected);
}

export async function sendDM(recipientId: string, text: string) {
  const res = await fetch(`${GRAPH}/me/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.IG_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ recipient: { id: recipientId }, message: { text } }),
  });
  if (!res.ok) throw new Error(`Instagram send failed ${res.status}: ${await res.text()}`);
}

// Student-facing wording. Status only — never names, titles or deadlines, since anyone can type a number.
const STATUS_LINE: Record<Status, string> = {
  NEW: "it's in the queue — a senior picks it up within 24h and replies right here.",
  CONTACTED: "a senior has already reached out — check your email (and spam) too.",
  PAID: "it's locked in — work starts shortly.",
  IN_PROGRESS: "it's being built right now. Doubts? Just type them here.",
  DELIVERED: "it's delivered — check your inbox for the drop. Stuck anywhere? Ask here.",
  CLOSED: "it's closed. Need help again? Drop a fresh one: " + FORM,
};

const REF_RE = /(?:req|#)\s*#?\s*0*(\d{1,6})\b/i;
const PRICE_RE = /\b(price|pricing|cost|costs|charge|charges|fee|fees|rate|rates|how much|amount|budget|rs)\b|₹/i;
const URGENT_RE = /\b(tomorrow|tmrw|tmr|urgent|asap|tonight|today|deadline)\b/i;
const START_RE = /\b(req|request|start|form|help|project|need)\b/i;
const JAIN_RE = /\b(jain|colleges?|universit(?:y|ies))\b/i;

/** The bot's reply to one DM, or null to stay quiet and leave it for a human. */
export async function replyFor(text: string): Promise<{ text: string; ref?: number } | null> {
  const t = text.trim();
  const m = t.match(REF_RE);
  if (m) {
    const ref = Number(m[1]);
    const label = `REQ #${String(ref).padStart(4, "0")}`;
    const row = await getRequestByRef(ref);
    if (!row) return { text: `Hmm, couldn't find ${label} 🤔 Check the number in your confirmation email, or drop your requirement here (2 min): ${FORM}` };
    return { text: `Found it ✅ ${label} — ${STATUS_LINE[row.status]}`, ref };
  }
  if (PRICE_RE.test(t))
    return { text: `Every project's different, so we talk scope first 🙂 Drop your requirement (2 min): ${FORM} — a senior will DM you with the details.` };
  if (URGENT_RE.test(t))
    return { text: `Deadline close? Drop it anyway 🔥 Pick the 1-day option in the form and we'll be honest about what's doable: ${FORM}` };
  if (JAIN_RE.test(t))
    return { text: `We're only taking Jain University BTech students right now (1st to 4th year) 🎓 Start here: ${FORM}` };
  if (START_RE.test(t))
    return { text: `Let's go 🚀 Drop your requirement here (takes 2 min): ${FORM}\nAlready filled it? Send your REQ number like #0252 and I'll check it.` };
  return null;
}

/** Leave a breadcrumb on the request so the crew knows the student is waiting in DMs. */
export async function noteDM(ref: number) {
  const row = await getRequestByRef(ref);
  if (!row || row.admin_notes.includes("[IG]")) return;
  const stamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  const note = `[IG] Student DM'd @submitted.co on ${stamp} — reply in Business Suite inbox.`;
  await updateRequest(row.id, { admin_notes: row.admin_notes ? `${row.admin_notes}\n${note}` : note });
}
