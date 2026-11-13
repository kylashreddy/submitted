import { NextResponse } from "next/server";
import { igEnabled, noteDM, replyFor, sendDM, validSignature } from "@/lib/instagram";

type Messaging = {
  sender?: { id: string };
  message?: { text?: string; is_echo?: boolean; is_deleted?: boolean };
};
type Payload = { object?: string; entry?: { id: string; messaging?: Messaging[] }[] };

// Meta's one-time handshake when the webhook URL is saved in the developer dashboard.
export function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const token = process.env.IG_VERIFY_TOKEN;
  if (q.get("hub.mode") === "subscribe" && token && q.get("hub.verify_token") === token) {
    return new Response(q.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (!validSignature(raw, req.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }
  if (!igEnabled()) return NextResponse.json({ ok: true, skipped: "IG_ACCESS_TOKEN not set" });

  const body = JSON.parse(raw) as Payload;
  const jobs: Promise<unknown>[] = [];

  for (const entry of body.entry ?? []) {
    for (const ev of entry.messaging ?? []) {
      const from = ev.sender?.id;
      const text = ev.message?.text;
      // skip our own outgoing messages, deletions, and non-text (stickers, reels, images)
      if (!from || from === entry.id || ev.message?.is_echo || ev.message?.is_deleted || !text) continue;
      jobs.push(
        (async () => {
          const reply = await replyFor(text);
          if (!reply) return;
          await sendDM(from, reply.text);
          if (reply.ref) await noteDM(reply.ref);
        })(),
      );
    }
  }

  // Meta retries on non-200, which would double-reply — so log failures but always ack.
  const results = await Promise.allSettled(jobs);
  results.forEach((r) => r.status === "rejected" && console.error("[instagram]", r.reason));
  return NextResponse.json({ ok: true });
}
