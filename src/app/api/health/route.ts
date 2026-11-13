import { NextResponse } from "next/server";
import { hasSupabase, serviceClient } from "@/lib/supabase";

// Daily Vercel cron (vercel.json). Supabase pauses free projects after 7 idle days;
// one tiny query a day keeps the form working through quiet weeks.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasSupabase()) return NextResponse.json({ ok: true, db: "not configured" });
  const { error } = await serviceClient().from("requests").select("id", { count: "exact", head: true });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
