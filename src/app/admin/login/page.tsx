import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { authMode, getAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main className="flex min-h-dvh flex-col justify-between px-4 py-6 md:px-8">
      <p className="mono flex justify-between">
        <Link href="/" className="hover:underline">← SUBMITTED.</Link>
        <span>CREW ONLY</span>
      </p>
      <div className="mx-auto w-full max-w-md">
        <h1 className="display text-[17vw] md:text-8xl">
          CREW <em>only</em>.
        </h1>
        <LoginForm needsEmail={authMode() === "supabase"} />
      </div>
      <p className="mono text-ink/50">
        IF YOU&apos;RE A STUDENT, YOU WANT THE <Link className="underline" href="/#drop">FORM</Link>.
      </p>
    </main>
  );
}
