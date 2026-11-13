import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Activity } from "./activity-types";
import { hasSupabase, serviceClient } from "./supabase";

export { ACTIONS, type Activity, type ActivityAction } from "./activity-types";

type NewActivity = Omit<Activity, "id" | "created_at" | "request_id" | "request_ref" | "ip"> &
  Partial<Pick<Activity, "request_id" | "request_ref" | "ip">>;

const FILE = path.join(process.cwd(), ".data", "logs.json");

export const clientIp = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

/** Record one admin action. Never throws — a logging hiccup must not break the action itself. */
export async function logActivity(entry: NewActivity) {
  const row = {
    actor: entry.actor.slice(0, 120),
    action: entry.action,
    request_id: entry.request_id ?? null,
    request_ref: entry.request_ref ?? null,
    detail: entry.detail.slice(0, 500),
    ip: entry.ip ?? null,
  };
  try {
    if (hasSupabase()) {
      const { error } = await serviceClient().from("admin_logs").insert(row);
      if (error) throw new Error(error.message);
      return;
    }
    if (process.env.VERCEL) return;
    let rows: Activity[] = [];
    try {
      rows = JSON.parse(await fs.readFile(FILE, "utf8"));
    } catch {}
    rows.unshift({ ...row, id: randomUUID(), created_at: new Date().toISOString() });
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(rows.slice(0, 5000), null, 2));
  } catch (e) {
    console.error("[activity]", e);
  }
}

/** Latest entries first. `missingTable` is true until supabase/admin_logs.sql has been run. */
export async function listActivity(limit = 1000): Promise<{ rows: Activity[]; missingTable: boolean }> {
  if (hasSupabase()) {
    const { data, error } = await serviceClient()
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      if (error.code === "PGRST205" || /admin_logs/.test(error.message)) return { rows: [], missingTable: true };
      throw new Error(error.message);
    }
    return { rows: data as Activity[], missingTable: false };
  }
  try {
    return { rows: (JSON.parse(await fs.readFile(FILE, "utf8")) as Activity[]).slice(0, limit), missingTable: false };
  } catch {
    return { rows: [], missingTable: false };
  }
}
