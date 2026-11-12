import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createHmac, timingSafeEqual } from "crypto";
import { hasSupabaseAuth } from "./supabase";

// Two modes:
//  • Supabase configured → Supabase Auth (email + password), restricted to ADMIN_EMAILS.
//  • Not configured (local dev) → single ADMIN_PASSWORD, stored as an HMAC'd httpOnly cookie.

const COOKIE = "sub_admin";

const adminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // called from a Server Component — middleware refreshes the session instead
        }
      },
    },
  });
}

function passwordToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHmac("sha256", pw).update("submitted-admin-v1").digest("hex");
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const authMode = () => (hasSupabaseAuth() ? "supabase" : "password");

/** Returns the admin's identity, or null. Use in every admin page and API route. */
export async function getAdmin(): Promise<{ email: string } | null> {
  if (hasSupabaseAuth()) {
    const { data } = await (await supabaseServer()).auth.getUser();
    const email = data.user?.email?.toLowerCase();
    if (!email || !adminEmails().includes(email)) return null;
    return { email };
  }
  const expected = passwordToken();
  const got = (await cookies()).get(COOKIE)?.value;
  if (!expected || !got || !safeEqual(expected, got)) return null;
  return { email: "admin@local" };
}

/** Returns an error message, or null on success. */
export async function signIn(email: string, password: string): Promise<string | null> {
  if (hasSupabaseAuth()) {
    if (!adminEmails().includes(email.trim().toLowerCase())) return "Not on the crew list.";
    const { error } = await (await supabaseServer()).auth.signInWithPassword({ email, password });
    return error ? "Wrong email or password." : null;
  }
  const expected = passwordToken();
  if (!expected) return "ADMIN_PASSWORD is not set on the server.";
  const pw = process.env.ADMIN_PASSWORD!;
  if (!safeEqual(password, pw)) return "Wrong password.";
  (await cookies()).set(COOKIE, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return null;
}

export async function signOut() {
  if (hasSupabaseAuth()) await (await supabaseServer()).auth.signOut();
  (await cookies()).delete(COOKIE);
}
