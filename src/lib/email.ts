import { Resend } from "resend";
import type { RequestRow } from "./types";

const FROM = process.env.RESEND_FROM ?? "SUBMITTED. <onboarding@resend.dev>";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

let resend: Resend | null = null;
const client = () => (process.env.RESEND_API_KEY ? (resend ??= new Resend(process.env.RESEND_API_KEY)) : null);

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const refNo = (r: RequestRow) => `#${String(r.ref).padStart(4, "0")}`;

/** Paper-and-ink email shell. Inline styles only — email clients ignore <style>. */
function shell(kicker: string, headline: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#ECEAE4;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#0E0E0E">
<table role="presentation" width="100%" style="max-width:560px;margin:0 auto;border:1px solid #0E0E0E;background:#ECEAE4"><tr><td style="padding:28px">
<p style="margin:0 0 18px;font:12px/1.4 'Courier New',monospace;letter-spacing:2px;text-transform:uppercase">${kicker}</p>
<h1 style="margin:0 0 20px;font:900 40px/0.95 'Arial Black',Arial,sans-serif;text-transform:uppercase;letter-spacing:-1px">${headline}</h1>
${body}
<p style="margin:28px 0 0;padding-top:16px;border-top:1px solid #0E0E0E;font:11px/1.5 'Courier New',monospace;letter-spacing:1.5px;text-transform:uppercase">SUBMITTED. · made by students who also hated deadlines</p>
</td></tr></table></body></html>`;
}

const p = (t: string) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.55">${t}</p>`;

async function send(to: string | string[], subject: string, html: string, replyTo?: string) {
  const c = client();
  if (!c) {
    console.info(`[email dry-run] to=${to} subject="${subject}" (set RESEND_API_KEY to send for real)`);
    return { dryRun: true };
  }
  const { error } = await c.emails.send({ from: FROM, to, subject, html, replyTo });
  if (error) throw new Error(error.message);
  return { dryRun: false };
}

export function sendConfirmation(r: RequestRow) {
  const first = esc(r.name.split(" ")[0] ?? r.name);
  return send(
    r.email,
    `REQ ${refNo(r)} received — we're on it`,
    shell(
      `REQ ${refNo(r)} · ${esc(r.domain)} · YEAR ${r.year}`,
      `GOT IT, ${first}.`,
      p("Your requirement just landed with the crew. A senior will hit you up on WhatsApp within 24 hours to vibe check the scope and timeline.") +
        p("Nothing to do yet. Touch grass meanwhile.") +
        p(`<span style="font-family:'Courier New',monospace;font-size:13px">DEADLINE ON FILE: ${esc(r.deadline)}</span>`),
    ),
  );
}

export function notifyCrew(r: RequestRow) {
  const to = process.env.CREW_INBOX;
  if (!to) return Promise.resolve({ dryRun: true });
  const rows = [
    ["Name", r.name],
    ["Email", r.email],
    ["WhatsApp", r.phone],
    ["Branch", `${r.branch} · Year ${r.year}`],
    ["Domain", r.domain],
    ["Title", r.no_idea ? "No idea yet — help pick" : r.title],
    ["Deadline", r.deadline],
    ["Help", r.help.join(", ")],
    ["Notes", r.notes || "—"],
  ]
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;font:12px 'Courier New',monospace;text-transform:uppercase">${k}</td><td style="padding:4px 0">${esc(String(v))}</td></tr>`)
    .join("");
  return send(
    to,
    `NEW REQ ${refNo(r)} · ${r.domain} · Y${r.year} · due ${r.deadline}`,
    shell(`NEW REQ ${refNo(r)}`, "FRESH DROP.", `<table>${rows}</table>` + p(`<a href="${SITE}/admin" style="color:#2F4BFF">Open the board →</a>`)),
    r.email,
  );
}

export function sendDelivery(r: RequestRow, links: string[], message: string) {
  const list = links
    .map(
      (l, i) =>
        `<tr><td style="padding:10px 0;border-top:1px solid #0E0E0E;font:12px 'Courier New',monospace">${String(i + 1).padStart(2, "0")}</td><td style="padding:10px 0 10px 12px;border-top:1px solid #0E0E0E"><a href="${esc(l)}" style="color:#2F4BFF;word-break:break-all">${esc(l)}</a></td></tr>`,
    )
    .join("");
  return send(
    r.email,
    `Your drop is here — REQ ${refNo(r)}`,
    shell(
      `REQ ${refNo(r)} · DELIVERY`,
      "IT'S IN.",
      (message ? p(esc(message).replace(/\n/g, "<br>")) : "") +
        `<table role="presentation" width="100%" style="border-collapse:collapse;margin:8px 0 18px">${list}</table>` +
        p("Stuck on anything? Reply to this mail or ping us on WhatsApp — doubt calls are part of the deal."),
    ),
    process.env.CREW_INBOX,
  );
}
