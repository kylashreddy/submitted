import { getAdmin } from "@/lib/auth";
import { listRequests } from "@/lib/store";

// CSV backup of every request — Supabase's free plan has no automatic backups.
const COLUMNS = ["ref", "created_at", "status", "name", "email", "year", "branch", "domain", "title", "deadline", "help", "notes", "assignee", "admin_notes", "delivery_links", "delivered_at"] as const;

const cell = (v: unknown) => {
  const s = Array.isArray(v) ? v.join(" | ") : v == null ? "" : String(v);
  // quote everything; neutralise spreadsheet formulas (=, +, -, @)
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

export async function GET() {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });
  const rows = await listRequests();
  const csv = [COLUMNS.join(","), ...rows.map((r) => COLUMNS.map((c) => cell(r[c])).join(","))].join("\n");
  const day = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="submitted-requests-${day}.csv"`,
      "cache-control": "no-store",
    },
  });
}
