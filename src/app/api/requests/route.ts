import { NextResponse } from "next/server";
import { notifyCrew, sendConfirmation } from "@/lib/email";
import { createRequest } from "@/lib/store";
import { parseRequest } from "@/lib/validate";

// Best-effort per-instance throttle. Put a real limiter (Upstash, Vercel WAF) in front for scale.
const hits = new Map<string, number[]>();
function throttled(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

/** Cloudflare Turnstile check. Skipped (passes) until TURNSTILE_SECRET_KEY is set. */
async function isHuman(token: unknown, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  }).catch(() => null);
  const out = (await res?.json().catch(() => null)) as { success?: boolean } | null;
  return out?.success === true;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  // honeypot: bots fill every field. Pretend it worked.
  if (body && typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true, ref: null });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (throttled(ip)) return NextResponse.json({ error: "Easy there — try again in a few minutes" }, { status: 429 });

  if (!(await isHuman(body?.turnstile, ip))) {
    return NextResponse.json({ error: "Couldn't confirm you're human — refresh the page and try again" }, { status: 400 });
  }

  const parsed = parseRequest(body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const row = await createRequest(parsed.data);
    const mail = await Promise.allSettled([sendConfirmation(row), notifyCrew(row)]);
    mail.forEach((m) => m.status === "rejected" && console.error("[email]", m.reason));
    return NextResponse.json({ ok: true, ref: row.ref });
  } catch (e) {
    console.error("[requests:create]", e);
    return NextResponse.json({ error: "Couldn't save that — DM @submitted.co on Instagram or mail bit.geniuses.ac@gmail.com" }, { status: 500 });
  }
}
