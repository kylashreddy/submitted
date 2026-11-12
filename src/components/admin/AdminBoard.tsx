"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DOMAINS } from "@/lib/content";
import { STATUSES, STATUS_LABEL, type RequestRow, type Status } from "@/lib/types";

const localToday = () => {
  const d = new Date();
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
};
const daysLeft = (deadline: string) => Math.round((Date.parse(deadline) - localToday()) / 864e5);
const refNo = (r: RequestRow) => "#" + String(r.ref).padStart(4, "0");
const isLive = (r: RequestRow) => r.status !== "DELIVERED" && r.status !== "CLOSED";

function Countdown({ r }: { r: RequestRow }) {
  const d = daysLeft(r.deadline);
  if (!isLive(r)) return <span className="text-ink/40">{r.deadline}</span>;
  const hot = d < 3;
  const label = d < 0 ? `OVERDUE ${-d}D` : d === 0 ? "DUE TODAY" : `${d}D LEFT`;
  return <span className={hot ? "bg-alarm px-1.5 py-0.5 text-paper" : ""}>{label}</span>;
}

type DueFilter = "ALL" | "HOT" | "WEEK" | "OVERDUE";

export function AdminBoard({
  initial,
  crew,
  email,
  emailOn,
}: {
  initial: RequestRow[];
  crew: string[];
  email: string;
  emailOn: boolean;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [view, setView] = useState<"table" | "board">("board");
  const [year, setYear] = useState("ALL");
  const [domain, setDomain] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [due, setDue] = useState<DueFilter>("ALL");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [dragOver, setDragOver] = useState<Status | null>(null);

  useEffect(() => setRows(initial), [initial]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows
      .filter((r) => year === "ALL" || String(r.year) === year)
      .filter((r) => domain === "ALL" || r.domain === domain)
      .filter((r) => status === "ALL" || r.status === status)
      .filter((r) => {
        const d = daysLeft(r.deadline);
        if (due === "HOT") return isLive(r) && d < 3;
        if (due === "WEEK") return isLive(r) && d >= 0 && d <= 7;
        if (due === "OVERDUE") return isLive(r) && d < 0;
        return true;
      })
      .filter((r) => !needle || [r.name, r.email, r.branch, r.title, String(r.ref)].some((v) => v.toLowerCase().includes(needle)));
  }, [rows, year, domain, status, due, q]);

  const sortedByDeadline = useMemo(() => [...filtered].sort((a, b) => a.deadline.localeCompare(b.deadline)), [filtered]);

  const open = rows.find((r) => r.id === openId) ?? null;

  async function patch(id: string, body: Partial<Pick<RequestRow, "status" | "assignee" | "admin_notes">>) {
    const before = rows;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...body } : r)));
    const res = await fetch(`/api/admin/requests/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setRows(before);
      setToast((await res.json().catch(() => ({}))).error ?? "Update failed");
      if (res.status === 401) router.replace("/admin/login");
      return false;
    }
    const row = (await res.json()) as RequestRow;
    setRows((rs) => rs.map((r) => (r.id === id ? row : r)));
    return true;
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  const counts = {
    total: rows.length,
    fresh: rows.filter((r) => r.status === "NEW").length,
    hot: rows.filter((r) => isLive(r) && daysLeft(r.deadline) < 3).length,
  };

  const select = "mono border border-ink bg-paper px-2 py-2 text-[0.68rem]";

  return (
    <div className="min-h-dvh text-[0.92rem]">
      <header className="sticky top-0 z-30 border-b border-ink bg-paper">
        <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-baseline gap-3">
            <Link href="/" className="display text-xl">SUBMITTED.</Link>
            <span className="mono hidden text-ink/50 sm:inline">/ CREW BOARD</span>
          </div>
          <div className="mono flex items-center gap-4">
            <span className="hidden md:inline">
              {counts.total} TOTAL · {counts.fresh} NEW · <span className={counts.hot ? "text-alarm" : ""}>{counts.hot} HOT</span>
            </span>
            <button onClick={() => router.refresh()} className="hover:underline">↻ SYNC</button>
            <button onClick={logout} className="hover:underline" title={email}>LOG OUT</button>
          </div>
        </div>

        {/* filters */}
        <div className="no-bar flex items-center gap-2 overflow-x-auto border-t border-ink px-4 py-2 md:px-6">
          <div className="mono flex shrink-0 border border-ink">
            {(["board", "table"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-2 text-[0.68rem] ${view === v ? "bg-ink text-paper" : ""}`}>
                {v === "board" ? "KANBAN" : "TABLE"}
              </button>
            ))}
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="SEARCH NAME / BRANCH / #REF"
            className="mono w-52 shrink-0 border border-ink bg-paper px-2 py-2 text-[0.68rem] outline-none placeholder:text-ink/40 focus:border-blue"
          />
          <select aria-label="Year" className={select} value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="ALL">ALL YEARS</option>
            {[1, 2, 3, 4].map((y) => (
              <option key={y} value={y}>YEAR {y}</option>
            ))}
          </select>
          <select aria-label="Domain" className={select} value={domain} onChange={(e) => setDomain(e.target.value)}>
            <option value="ALL">ALL DOMAINS</option>
            {[...DOMAINS, "OTHER"].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select aria-label="Status" className={select} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">ALL STATUSES</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
          <select aria-label="Deadline" className={select} value={due} onChange={(e) => setDue(e.target.value as DueFilter)}>
            <option value="ALL">ANY DEADLINE</option>
            <option value="HOT">&lt; 3 DAYS</option>
            <option value="WEEK">THIS WEEK</option>
            <option value="OVERDUE">OVERDUE</option>
          </select>
          <span className="mono ml-auto shrink-0 pl-2 text-ink/50">{filtered.length} SHOWN</span>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="px-4 py-24 text-center md:px-6">
          <p className="display text-5xl md:text-7xl">
            INBOX <em>zero</em>.
          </p>
          <p className="mono mt-4 text-ink/50">NO REQUESTS YET. SHARE THE LINK ON INSTA.</p>
        </div>
      ) : view === "board" ? (
        <div className="no-bar flex gap-0 overflow-x-auto">
          {STATUSES.map((s) => {
            const col = sortedByDeadline.filter((r) => r.status === s);
            return (
              <section
                key={s}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(s);
                }}
                onDragLeave={() => setDragOver((cur) => (cur === s ? null : cur))}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(null);
                  const id = e.dataTransfer.getData("text/plain");
                  const r = rows.find((x) => x.id === id);
                  if (r && r.status !== s) patch(id, { status: s });
                }}
                className={`flex min-h-[calc(100dvh-7.5rem)] w-[78vw] shrink-0 flex-col border-r border-ink sm:w-[300px] ${dragOver === s ? "bg-ink/[0.06]" : ""}`}
              >
                <h2 className="mono sticky top-0 flex justify-between border-b border-ink px-3 py-2.5">
                  <span>{STATUS_LABEL[s]}</span>
                  <span className="text-ink/50">{String(col.length).padStart(2, "0")}</span>
                </h2>
                <ul className="flex-1 space-y-2 p-2">
                  {col.map((r) => (
                    <li key={r.id}>
                      <button
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", r.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onClick={() => setOpenId(r.id)}
                        className="block w-full border border-ink bg-paper p-3 text-left transition-colors hover:bg-ink hover:text-paper active:cursor-grabbing"
                      >
                        <div className="mono flex justify-between text-[0.62rem]">
                          <span>{refNo(r)} · Y{r.year} · {r.domain}</span>
                          <Countdown r={r} />
                        </div>
                        <p className="mt-2 font-semibold leading-tight">{r.name}</p>
                        <p className="mt-0.5 line-clamp-2 text-[0.85rem] opacity-70">{r.no_idea ? "— needs an idea —" : r.title}</p>
                        <p className="mono mt-2 text-[0.6rem] opacity-60">{r.assignee ? `→ ${r.assignee}` : "UNASSIGNED"}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-left">
            <thead className="mono">
              <tr className="border-b border-ink">
                {["REF", "NAME", "BRANCH", "YR", "DOMAIN", "DEADLINE", "STATUS", "CREW"].map((h) => (
                  <th key={h} className="px-3 py-2.5 font-normal text-ink/60 first:pl-4 md:first:pl-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedByDeadline.map((r) => (
                <tr key={r.id} onClick={() => setOpenId(r.id)} className="cursor-pointer border-b border-ink/20 hover:bg-ink hover:text-paper">
                  <td className="mono px-3 py-3 pl-4 md:pl-6">{refNo(r)}</td>
                  <td className="px-3 py-3 font-semibold">{r.name}</td>
                  <td className="mono px-3 py-3">{r.branch}</td>
                  <td className="mono px-3 py-3">{r.year}</td>
                  <td className="mono px-3 py-3">{r.domain}</td>
                  <td className="mono px-3 py-3"><Countdown r={r} /></td>
                  <td className="mono px-3 py-3">{STATUS_LABEL[r.status]}</td>
                  <td className="mono px-3 py-3">{r.assignee ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <Drawer
          key={open.id}
          r={open}
          crew={crew}
          emailOn={emailOn}
          onClose={() => setOpenId(null)}
          onPatch={(body) => patch(open.id, body)}
          onDelivered={(row) => setRows((rs) => rs.map((x) => (x.id === row.id ? row : x)))}
          toast={setToast}
        />
      )}

      {toast && (
        <div role="status" className="mono fixed bottom-4 left-1/2 z-50 -translate-x-1/2 border border-ink bg-ink px-4 py-2.5 text-paper">
          {toast}
        </div>
      )}
    </div>
  );
}

function Drawer({
  r,
  crew,
  emailOn,
  onClose,
  onPatch,
  onDelivered,
  toast,
}: {
  r: RequestRow;
  crew: string[];
  emailOn: boolean;
  onClose: () => void;
  onPatch: (b: Partial<Pick<RequestRow, "status" | "assignee" | "admin_notes">>) => Promise<boolean>;
  onDelivered: (r: RequestRow) => void;
  toast: (s: string) => void;
}) {
  const [notes, setNotes] = useState(r.admin_notes);
  const [links, setLinks] = useState(r.delivery_links.join("\n"));
  const [message, setMessage] = useState(`Hey ${r.name.split(" ")[0]}, your kit is ready. Start with the build guide — it walks you through everything in order.`);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function deliver() {
    const list = links.split(/\s+/).filter(Boolean);
    const ask = emailOn
      ? `Send the delivery email with ${list.length} link(s) to ${r.email}?`
      : `Email is not set up, so nothing will be sent to ${r.email}. Save the links and mark this DELIVERED anyway?`;
    if (!confirm(ask)) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/requests/${r.id}/deliver`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ links: list, message }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return toast(`NOT SENT — ${json.error ?? `server error ${res.status}`}`);
      onDelivered(json.row);
      toast(json.dryRun ? "SAVED + MARKED DELIVERED — NO EMAIL (RESEND NOT SET UP)" : `DELIVERED TO ${r.email}`);
    } catch {
      toast("NOT SENT — NETWORK ERROR, TRY AGAIN");
    } finally {
      setSending(false);
    }
  }

  const wa = "https://wa.me/" + r.phone.replace(/[^\d]/g, "").replace(/^(\d{10})$/, "91$1");
  const meta: [string, string][] = [
    ["BRANCH", r.branch],
    ["YEAR", String(r.year)],
    ["DOMAIN", r.domain],
    ["DEADLINE", r.deadline],
    ["NEEDS", r.help.join(" · ").toUpperCase()],
    ["RECEIVED", new Date(r.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })],
  ];
  const label = "mono mb-2 block text-ink/55";
  const box = "w-full border border-ink bg-paper p-2.5 text-[0.9rem] outline-none focus:border-blue";

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40" />
      <aside role="dialog" aria-modal="true" aria-label={`Request ${refNo(r)}`} className="relative h-full w-full overflow-y-auto border-l border-ink bg-paper md:w-[560px]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink bg-paper px-5 py-3">
          <span className="mono">REQ {refNo(r)} · <Countdown r={r} /></span>
          <button onClick={onClose} className="mono hover:underline">CLOSE ✕</button>
        </div>

        <div className="space-y-8 px-5 py-6">
          <div>
            <h2 className="display text-5xl">{r.name}</h2>
            <p className="mt-2 text-lg">{r.no_idea ? <em className="serif-i text-2xl">no idea yet — help pick</em> : r.title}</p>
            <div className="mono mt-4 flex flex-wrap gap-2">
              <a href={`mailto:${r.email}`} className="border border-ink px-2 py-1.5 hover:bg-ink hover:text-paper">✉ {r.email}</a>
              <a href={wa} target="_blank" rel="noreferrer" className="border border-ink px-2 py-1.5 hover:bg-ink hover:text-paper">WA ↗ {r.phone}</a>
            </div>
          </div>

          <dl className="border-t border-ink">
            {meta.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[7rem_1fr] gap-3 border-b border-ink/20 py-2">
                <dt className="mono text-ink/55">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          {r.notes && (
            <div>
              <span className={label}>FROM THE STUDENT</span>
              <p className="whitespace-pre-wrap border-l-2 border-ink pl-3">{r.notes}</p>
            </div>
          )}

          <div>
            <span className={label}>STATUS</span>
            <div className="grid grid-cols-3 border-l border-t border-ink">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => onPatch({ status: s })}
                  aria-pressed={r.status === s}
                  className={`mono border-b border-r border-ink px-2 py-2.5 text-[0.62rem] ${r.status === s ? "bg-ink text-paper" : "hover:bg-ink/10"}`}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className={label}>ASSIGNED TO</span>
            <select className={`${box} mono`} value={r.assignee ?? ""} onChange={(e) => onPatch({ assignee: e.target.value || null })}>
              <option value="">— UNASSIGNED —</option>
              {crew.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>

          <div>
            <label className={label} htmlFor="notes">CREW NOTES</label>
            <textarea id="notes" className={`${box} min-h-28`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Wants Flask. Guide is strict on the report. Viva on 28th." />
            <button
              disabled={notes === r.admin_notes}
              onClick={async () => (await onPatch({ admin_notes: notes })) && toast("NOTES SAVED")}
              className="btn btn-ghost mt-2 !py-2.5"
            >
              SAVE NOTES
            </button>
          </div>

          <div className="border border-ink p-4">
            <p className="display text-2xl">
              SEND THE <em>drop</em>.
            </p>
            {!emailOn && (
              <p className="mono mt-3 bg-alarm px-2 py-1.5 text-paper">
                EMAIL IS OFF — ADD RESEND_API_KEY ON THE SERVER. UNTIL THEN, SEND THE LINKS ON WHATSAPP.
              </p>
            )}
            {r.delivered_at && (
              <p className="mono mt-2 text-ink/55">LAST SENT {new Date(r.delivered_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
            )}
            <label className={`${label} mt-4`} htmlFor="links">DRIVE / GITHUB LINKS — ONE PER LINE</label>
            <textarea id="links" className={`${box} mono min-h-24 text-[0.75rem] normal-case tracking-normal`} value={links} onChange={(e) => setLinks(e.target.value)} placeholder={"https://github.com/…\nhttps://drive.google.com/…"} />
            <label className={`${label} mt-4`} htmlFor="msg">MESSAGE</label>
            <textarea id="msg" className={`${box} min-h-24`} value={message} onChange={(e) => setMessage(e.target.value)} />
            <button onClick={deliver} disabled={sending || !links.trim()} className="btn btn-primary mt-3 w-full">
              {sending ? "SENDING…" : emailOn ? "SEND DELIVERY EMAIL →" : "SAVE LINKS + MARK DELIVERED →"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
