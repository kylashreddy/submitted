import { NextResponse } from "next/server";
import { clientIp, logActivity } from "@/lib/activity";
import { getAdmin, signOut } from "@/lib/auth";

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (admin) await logActivity({ actor: admin.email, action: "LOGOUT", detail: "", ip: clientIp(req) });
  await signOut();
  return NextResponse.json({ ok: true });
}
