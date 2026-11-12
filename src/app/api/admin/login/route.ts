import { NextResponse } from "next/server";
import { signIn } from "@/lib/auth";

export async function POST(req: Request) {
  const { email = "", password = "" } = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  if (!password) return NextResponse.json({ error: "Password required" }, { status: 400 });
  const error = await signIn(String(email), String(password));
  if (error) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return NextResponse.json({ error }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
