"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { browserClient } from "@/lib/supabase/client";

/**
 * Free-trial applications.
 *
 * Not a `ListEditor`: that one orders by `sort_order` and exists to add, delete
 * and reorder rows someone authored. These arrive on their own, newest first,
 * and the only thing to change about one is how far it has been dealt with.
 *
 * Read with the signed-in admin's session, so the table's own RLS is what
 * decides who sees it — the same check the database would apply to anyone
 * else, rather than a second one written here.
 */

type Row = {
  id: string;
  name: string;
  email: string;
  brand: string;
  footage_url: string;
  message: string;
  status: string;
  created_at: string;
};

const STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "done", label: "Done" },
];

const CHIP: Record<string, string> = {
  new: "bg-mint/25 text-brand-deep",
  contacted: "bg-amber-100 text-amber-800",
  done: "bg-ink/[0.06] text-body",
};

function when(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TrialInbox() {
  const supabase = useMemo(() => browserClient(), []);
  const [rows, setRows] = useState<Row[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("trial_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setRows((data ?? []) as Row[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (id: string, status: string) => {
    if (!supabase) return;
    /* Moved in the list first, then written. The panel is used while someone
       is working through a list of people to reply to, and a row that waits
       on a round trip before it changes reads as a click that did nothing. */
    const before = rows;
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    const { error } = await supabase
      .from("trial_applications")
      .update({ status })
      .eq("id", id);
    if (error) {
      setRows(before);
      setError(error.message);
    }
  };

  const unread = rows.filter((r) => r.status === "new").length;

  if (!supabase)
    return <p className="text-sm text-muted">Supabase is not configured.</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-extrabold tracking-[-0.02em] text-ink">
            Free trial applications
          </h1>
          <p className="mt-1 text-sm text-muted">
            Newest first. Click one to read it and change where it has got to.
          </p>
        </div>
        {unread ? (
          <span className="rounded-full bg-mint/25 px-3 py-1.5 text-sm font-bold text-brand-deep">
            {unread} new
          </span>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-8 text-sm text-muted">Loading…</p>
      ) : !rows.length ? (
        <p className="mt-8 text-sm text-muted">
          No applications yet. They will appear here the moment one is sent.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {rows.map((r) => {
            const open = openId === r.id;
            return (
              <li
                key={r.id}
                className={`overflow-hidden rounded-xl border bg-white transition-colors ${
                  r.status === "new" ? "border-mint/50" : "border-ink/10"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : r.id)}
                  aria-expanded={open}
                  className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left hover:bg-paper-2"
                >
                  <span className="min-w-[9rem] flex-1 font-semibold text-ink">
                    {r.name || "—"}
                  </span>
                  <span className="min-w-[12rem] flex-1 truncate text-sm text-body">
                    {r.email}
                  </span>
                  <span className="min-w-[8rem] flex-1 truncate text-sm text-muted">
                    {r.brand || "—"}
                  </span>
                  <span className="font-mono text-xs text-muted">
                    {when(r.created_at)}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] ${
                      CHIP[r.status] ?? CHIP.done
                    }`}
                  >
                    {r.status}
                  </span>
                </button>

                {open ? (
                  <div className="border-t border-ink/[0.07] bg-paper-2 px-4 py-4">
                    <dl className="flex flex-col gap-3 text-sm">
                      <div>
                        <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                          Email
                        </dt>
                        <dd className="mt-0.5">
                          <a
                            href={`mailto:${r.email}`}
                            className="text-brand underline underline-offset-4"
                          >
                            {r.email}
                          </a>
                        </dd>
                      </div>
                      {r.footage_url ? (
                        <div>
                          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                            Footage
                          </dt>
                          <dd className="mt-0.5 break-all">
                            <a
                              href={r.footage_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand underline underline-offset-4"
                            >
                              {r.footage_url}
                            </a>
                          </dd>
                        </div>
                      ) : null}
                      <div>
                        <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                          What they need
                        </dt>
                        <dd className="mt-0.5 whitespace-pre-wrap text-body">
                          {r.message || "— nothing written —"}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                        Status
                      </span>
                      {STATUSES.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => setStatus(r.id, s.value)}
                          aria-pressed={r.status === s.value}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                            r.status === s.value
                              ? "bg-brand-deep text-white"
                              : "border border-ink/15 bg-white text-body hover:border-brand/40"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
