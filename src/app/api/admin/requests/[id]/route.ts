import { NextResponse } from "next/server";
import { clientIp, logActivity } from "@/lib/activity";
import { getAdmin } from "@/lib/auth";
import { crewNames } from "@/lib/content";
import { getRequest, updateRequest } from "@/lib/store";
import { STATUSES, STATUS_LABEL, type RequestPatch, type Status } from "@/lib/types";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const patch: RequestPatch = {};
  if ("status" in body) {
    if (!STATUSES.includes(body.status as Status)) return NextResponse.json({ error: "Bad status" }, { status: 400 });
    patch.status = body.status as Status;
  }
  if ("assignee" in body) {
    const a = body.assignee;
    if (a !== null && !crewNames().includes(a as string)) return NextResponse.json({ error: "Unknown crew member" }, { status: 400 });
    patch.assignee = a as string | null;
  }
  if ("admin_notes" in body) patch.admin_notes = String(body.admin_notes ?? "").slice(0, 5000);

  if (Object.keys(patch).length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  try {
    const before = await getRequest(id);
    const row = await updateRequest(id, patch);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // One log line per field that actually changed.
    const base = { actor: admin.email, request_id: row.id, request_ref: row.ref, ip: clientIp(req) };
    if (patch.status && before?.status !== patch.status)
      await logActivity({ ...base, action: "STATUS", detail: `${before ? STATUS_LABEL[before.status] : "?"} → ${STATUS_LABEL[patch.status]}` });
    if ("assignee" in patch && before?.assignee !== patch.assignee)
      await logActivity({ ...base, action: "ASSIGN", detail: `${before?.assignee ?? "unassigned"} → ${patch.assignee ?? "unassigned"}` });
    if ("admin_notes" in patch && before?.admin_notes !== patch.admin_notes)
      await logActivity({ ...base, action: "NOTES", detail: `"${(patch.admin_notes ?? "").slice(0, 140)}"` });

    return NextResponse.json(row);
  } catch (e) {
    console.error("[admin:update]", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
