import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { sendDelivery } from "@/lib/email";
import { getRequest, updateRequest } from "@/lib/store";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { links?: unknown; message?: unknown };

  // Accept pasted links with or without a scheme ("drive.google.com/…" → "https://drive.google.com/…").
  const raw = (Array.isArray(body.links) ? body.links : []).map((l) => String(l).trim()).filter(Boolean);
  const links: string[] = [];
  for (const l of raw.slice(0, 20)) {
    try {
      const u = new URL(/^https?:\/\//i.test(l) ? l : `https://${l}`);
      if (!u.hostname.includes(".")) throw new Error();
      links.push(u.toString());
    } catch {
      return NextResponse.json({ error: `"${l.slice(0, 60)}" isn't a link` }, { status: 400 });
    }
  }
  if (links.length === 0) return NextResponse.json({ error: "Add at least one link" }, { status: 400 });
  const message = String(body.message ?? "").slice(0, 3000);

  const row = await getRequest(id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const { dryRun } = await sendDelivery(row, links, message);
    const updated = await updateRequest(id, {
      status: "DELIVERED",
      delivery_links: links,
      delivered_at: new Date().toISOString(),
    });
    return NextResponse.json({ row: updated, dryRun });
  } catch (e) {
    console.error("[admin:deliver]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Send failed" }, { status: 502 });
  }
}
