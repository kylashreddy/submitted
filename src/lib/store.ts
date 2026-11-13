import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { hasSupabase, serviceClient } from "./supabase";
import type { RequestInput, RequestPatch, RequestRow } from "./types";

// Supabase in prod. Without it (local dev), rows live in .data/requests.json so the
// whole flow — form → admin → delivery — can be tried before any keys exist.

const FILE = path.join(process.cwd(), ".data", "requests.json");

function assertFileStoreAllowed() {
  if (process.env.VERCEL) throw new Error("Supabase env vars are missing on this deployment");
}

async function readAll(): Promise<RequestRow[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as RequestRow[];
  } catch {
    return [];
  }
}

async function writeAll(rows: RequestRow[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(rows, null, 2));
}

export async function createRequest(input: RequestInput): Promise<RequestRow> {
  if (hasSupabase()) {
    const { data, error } = await serviceClient().from("requests").insert(input).select().single();
    if (error) throw new Error(error.message);
    return data as RequestRow;
  }
  assertFileStoreAllowed();
  const rows = await readAll();
  const row: RequestRow = {
    ...input,
    id: randomUUID(),
    ref: rows.reduce((m, r) => Math.max(m, r.ref), 247) + 1,
    created_at: new Date().toISOString(),
    status: "NEW",
    assignee: null,
    admin_notes: "",
    delivery_links: [],
    delivered_at: null,
  };
  await writeAll([row, ...rows]);
  return row;
}

export async function listRequests(): Promise<RequestRow[]> {
  if (hasSupabase()) {
    const { data, error } = await serviceClient()
      .from("requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    return data as RequestRow[];
  }
  assertFileStoreAllowed();
  return readAll();
}

export async function getRequest(id: string): Promise<RequestRow | null> {
  if (hasSupabase()) {
    const { data, error } = await serviceClient().from("requests").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data as RequestRow | null;
  }
  assertFileStoreAllowed();
  return (await readAll()).find((r) => r.id === id) ?? null;
}

export async function updateRequest(id: string, patch: RequestPatch): Promise<RequestRow | null> {
  if (hasSupabase()) {
    const { data, error } = await serviceClient().from("requests").update(patch).eq("id", id).select().maybeSingle();
    if (error) throw new Error(error.message);
    return data as RequestRow | null;
  }
  assertFileStoreAllowed();
  const rows = await readAll();
  const i = rows.findIndex((r) => r.id === id);
  if (i === -1) return null;
  rows[i] = { ...rows[i], ...patch };
  await writeAll(rows);
  return rows[i];
}

export async function getRequestByRef(ref: number): Promise<RequestRow | null> {
  if (hasSupabase()) {
    const { data, error } = await serviceClient().from("requests").select("*").eq("ref", ref).maybeSingle();
    if (error) throw new Error(error.message);
    return data as RequestRow | null;
  }
  assertFileStoreAllowed();
  return (await readAll()).find((r) => r.ref === ref) ?? null;
}
