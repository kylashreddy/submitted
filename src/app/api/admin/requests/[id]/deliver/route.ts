import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { sendDelivery } from "@/lib/email";
import { getRequest, updateRequest } from "@/lib/store";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { links?: unknown; message?: unknown };

  const links = (Array.isArray(body.links) ? body.links : [])
    .map((l) => String(l).trim())
    .filter((l) => /^https:\/\/\S+$/i.test(l))
    .slice(0, 20);
  if (links.length === 0) return NextResponse.json({ error: "Add at least one https:// link" }, { status: 400 });
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
