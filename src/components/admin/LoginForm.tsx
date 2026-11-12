"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({ needsEmail }: { needsEmail: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setBusy(false);
    if (res.ok) return router.replace("/admin");
    setError((await res.json().catch(() => ({}))).error ?? "Nope.");
  }

  const input = "w-full border-0 border-b-2 border-ink bg-transparent py-3 text-xl outline-none focus:border-blue";

  return (
    <form onSubmit={submit} className="mt-10 space-y-6">
      {needsEmail && (
        <label className="block">
          <span className="mono text-ink/60">EMAIL</span>
          <input className={input} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
      )}
      <label className="block">
        <span className="mono text-ink/60">PASSWORD</span>
        <input className={input} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {error && <p className="mono text-alarm" role="alert">↳ {error}</p>}
      <button className="btn btn-primary w-full" disabled={busy}>
        {busy ? "CHECKING…" : "LET ME IN →"}
      </button>
    </form>
  );
}
