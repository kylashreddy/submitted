"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ACTIONS, type Activity, type ActivityAction } from "@/lib/activity-types";

const LABEL: Record<ActivityAction, string> = {
  LOGIN: "LOGGED IN",
  LOGIN_FAILED: "FAILED LOGIN",
  LOGOUT: "LOGGED OUT",
  STATUS: "MOVED",
  ASSIGN: "ASSIGNED",
  NOTES: "EDITED NOTES",
  DELIVERY: "SENT DELIVERY",
};

// Fixed zone so the server render and the browser agree.
const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

function ago(iso: string) {
  const m = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (m < 1) return "JUST NOW";
  if (m < 60) return `${m}M AGO`;
  if (m < 1440) return `${Math.round(m / 60)}H AGO`;
  return `${Math.round(m / 1440)}D AGO`;
}

export function ActivityLog({ rows, missingTable, email }: { rows: Activity[]; missingTable: boolean; email: string }) {
  const router = useRouter();
  const [actor, setActor] = useState("ALL");
  const [action, setAction] = useState("ALL");
  const [q, setQ] = useState("");

  const actors = useMemo(() => [...new Set(rows.filter((r) => r.action !== "LOGIN_FAILED").map((r) => r.actor))].sort(), [rows]);

  // Last thing each admin did — the "who's been active" strip.
  const lastSeen = useMemo(() => {
    const m = new Map<string, Activity>();
    for (const r of rows) if (r.action !== "LOGIN_FAILED" && !m.has(r.actor)) m.set(r.actor, r);
    return [...m.values()];
  }, [rows]);

  const failed24h = rows.filter((r) => r.action === "LOGIN_FAILED" && Date.now() - Date.parse(r.created_at) < 864e5).length;

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows
      .filter((r) => actor === "ALL" || r.actor === actor)
      .filter((r) => action === "ALL" || r.action === action)
      .filter((r) => !needle || [r.actor, r.detail, r.ip ?? "", r.request_ref ? `#${r.request_ref}` : ""].some((v) => v.toLowerCase().includes(needle)));
  }, [rows, actor, action, q]);

  const select = "mono border border-ink bg-paper px-2 py-2 text-[0.68rem]";

  return (
    <div className="min-h-dvh text-[0.92rem]">
      <header className="sticky top-0 z-30 border-b border-ink bg-paper">
        <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-baseline gap-3">
            <Link href="/" className="display text-xl">SUBMITTED.</Link>
            <span className="mono hidden text-ink/50 sm:inline">/ ADMIN ACTIVITY</span>
          </div>
          <div className="mono flex items-center gap-4">
            <Link href="/admin" className="hover:underline">← BOARD</Link>
            <button onClick={() => router.refresh()} className="hover:underline">↻ SYNC</button>
            <span className="hidden text-ink/50 md:inline">{email}</span>
          </div>
        </div>
        <div className="no-bar flex items-center gap-2 overflow-x-auto border-t border-ink px-4 py-2 md:px-6">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="SEARCH EMAIL / #REF / IP / DETAIL"
            className="mono w-56 shrink-0 border border-ink bg-paper px-2 py-2 text-[0.68rem] outline-none placeholder:text-ink/40 focus:border-blue"
          />
          <select aria-label="Admin" className={select} value={actor} onChange={(e) => setActor(e.target.value)}>
            <option value="ALL">ALL ADMINS</option>
            {actors.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select aria-label="Action" className={select} value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="ALL">ALL ACTIONS</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>{LABEL[a]}</option>
            ))}
          </select>
          <span className="mono ml-auto shrink-0 pl-2 text-ink/50">{shown.length} SHOWN</span>
        </div>
      </header>

      {missingTable ? (
        <div className="mx-auto max-w-xl px-4 py-20 md:px-6">
          <p className="display text-5xl">
            ONE <em>step</em> LEFT.
          </p>
          <p className="mt-4 text-lg">
            The log table doesn&apos;t exist yet. Run <code className="mono normal-case tracking-normal">supabase/admin_logs.sql</code> in the Supabase SQL
            editor, then refresh. Activity is recorded from that moment on.
          </p>
        </div>
      ) : (
        <>
          <section className="border-b border-ink px-4 py-4 md:px-6">
            <h2 className="mono mb-3 text-ink/55">LAST SEEN</h2>
            <ul className="flex flex-wrap gap-2">
              {lastSeen.map((r) => (
                <li key={r.actor}>
                  <button onClick={() => setActor(r.actor)} className={`mono border border-ink px-2.5 py-1.5 text-left text-[0.66rem] hover:bg-ink hover:text-paper ${actor === r.actor ? "bg-ink text-paper" : ""}`}>
                    {r.actor} <span className="opacity-60">· {LABEL[r.action]} · {ago(r.created_at)}</span>
                  </button>
                </li>
              ))}
              {lastSeen.length === 0 && <li className="mono text-ink/50">NO ADMIN ACTIVITY YET.</li>}
              {failed24h > 0 && (
                <li>
                  <button onClick={() => setAction("LOGIN_FAILED")} className="mono bg-alarm px-2.5 py-1.5 text-[0.66rem] text-paper">
                    {failed24h} FAILED LOGIN{failed24h === 1 ? "" : "S"} IN 24H
                  </button>
                </li>
              )}
            </ul>
          </section>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead className="mono">
                <tr className="border-b border-ink">
                  {["WHEN (IST)", "ADMIN", "ACTION", "REQUEST", "DETAIL", "IP"].map((h) => (
                    <th key={h} className="px-3 py-2.5 font-normal text-ink/60 first:pl-4 md:first:pl-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id} className="border-b border-ink/20 align-top hover:bg-ink/[0.04]">
                    <td className="mono whitespace-nowrap px-3 py-2.5 pl-4 md:pl-6" title={r.created_at}>{fmt(r.created_at)}</td>
                    <td className="px-3 py-2.5">{r.actor}</td>
                    <td className="mono whitespace-nowrap px-3 py-2.5">
                      <span className={r.action === "LOGIN_FAILED" ? "bg-alarm px-1.5 py-0.5 text-paper" : r.action === "DELIVERY" ? "bg-ink px-1.5 py-0.5 text-paper" : ""}>
                        {LABEL[r.action]}
                      </span>
                    </td>
                    <td className="mono px-3 py-2.5">{r.request_ref ? `#${String(r.request_ref).padStart(4, "0")}` : "—"}</td>
                    <td className="max-w-[420px] px-3 py-2.5">{r.detail || "—"}</td>
                    <td className="mono px-3 py-2.5 text-ink/55">{r.ip ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {shown.length === 0 && <p className="mono px-4 py-16 text-center text-ink/50 md:px-6">NOTHING MATCHES THOSE FILTERS.</p>}
          </div>
        </>
      )}
    </div>
  );
}
