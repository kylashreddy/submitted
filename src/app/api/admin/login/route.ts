import { NextResponse } from "next/server";
import { clientIp, logActivity } from "@/lib/activity";
import { signIn } from "@/lib/auth";

export async function POST(req: Request) {
  const { email = "", password = "" } = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  if (!password) return NextResponse.json({ error: "Password required" }, { status: 400 });
  const actor = String(email).trim().toLowerCase() || "(no email)";
  const ip = clientIp(req);
  const error = await signIn(String(email), String(password));
  if (error) {
    await logActivity({ actor, action: "LOGIN_FAILED", detail: error, ip });
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return NextResponse.json({ error }, { status: 401 });
  }
  await logActivity({ actor, action: "LOGIN", detail: "", ip });
  return NextResponse.json({ ok: true });
}
