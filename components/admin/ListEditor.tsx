"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { browserClient } from "@/lib/supabase/client";
import { FieldInput, Label } from "./Inputs";
import { emptyFor, type Field } from "./fields";

type Row = Record<string, unknown> & { id?: string; sort_order?: number };

/**
 * Ordered-collection editor.
 *
 * Reads and writes the table directly with the signed-in admin's session, so
 * permission is decided by the database (`is_admin()`), not by this component
 * remembering to check.
 */
export default function ListEditor({
  table,
  fields,
  title,
  description,
  addLabel = "Add",
}: {
  table: string;
  fields: Field[];
  title: string;
  description?: string;
  addLabel?: string;
}) {
  const supabase = useMemo(() => browserClient(), []);
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refOptions, setRefOptions] = useState<Record<string, { value: string; label: string }[]>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from(table).select("*").order("sort_order");
    if (error) setError(error.message);
    else setRows((data ?? []) as Row[]);
    setLoading(false);
  }, [supabase, table]);

  useEffect(() => {
    void load();
  }, [load]);

  // Resolve any dropdowns that point at another table.
  useEffect(() => {
    const refs = fields.filter((f) => f.optionsFrom);
    if (!refs.length) return;
    void (async () => {
      const next: Record<string, { value: string; label: string }[]> = {};
      for (const f of refs) {
        const { table: t, value, label } = f.optionsFrom!;
        // Selects "*" rather than a built column list: Supabase types the
        // select string at compile time and cannot parse a template literal.
        const { data } = await supabase.from(t).select("*").order(label);
        next[f.key] = ((data ?? []) as Record<string, unknown>[]).map((rec) => ({
          value: String(rec[value]),
          label: String(rec[label]),
        }));
      }
      setRefOptions(next);
    })();
  }, [fields, supabase]);

  const flash = (m: string) => {
    setStatus(m);
    setTimeout(() => setStatus(null), 2200);
  };

  const patch = (id: string, key: string, value: unknown) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: value } : r)));

  const save = async (row: Row) => {
    setError(null);
    const payload: Row = {};
    for (const f of fields) payload[f.key] = row[f.key];
    payload.sort_order = row.sort_order ?? 0;
    const { error } = await supabase.from(table).update(payload).eq("id", row.id!);
    if (error) setError(error.message);
    else flash("Saved");
  };

  const add = async () => {
    setError(null);
    const payload = { ...emptyFor(fields), sort_order: rows.length };
    const { data, error } = await supabase.from(table).insert(payload).select().single();
    if (error) return setError(error.message);
    setRows((r) => [...r, data as Row]);
    setOpen((data as Row).id!);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) setError(error.message);
    else {
      setRows((r) => r.filter((x) => x.id !== id));
      flash("Deleted");
    }
  };

  /** Order is persisted immediately so it survives a reload. */
  const move = async (index: number, dir: -1 | 1) => {
    const next = [...rows];
    const to = index + dir;
    if (to < 0 || to >= next.length) return;
    [next[index], next[to]] = [next[to], next[index]];
    setRows(next);
    await Promise.all(
      next.map((r, i) => supabase.from(table).update({ sort_order: i }).eq("id", r.id!)),
    );
    flash("Reordered");
  };

  const summaryOf = (row: Row) => {
    const f = fields.find((x) => x.summary) ?? fields[0];
    const v = row[f.key];
    return String(v || "").slice(0, 70) || "(untitled)";
  };

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-white/45">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          {status ? <span className="text-xs text-mint">{status}</span> : null}
          <button
            type="button"
            onClick={add}
            className="rounded-full bg-mint px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-mint-bright"
          >
            + {addLabel}
          </button>
        </div>
      </header>

      {error ? (
        <p role="alert" className="mt-4 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm text-amber-300">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-8 text-sm text-white/40">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-8 text-sm text-white/40">Nothing here yet.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {rows.map((row, i) => {
            const id = row.id!;
            const isOpen = open === id;
            return (
              <li
                key={id}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]"
              >
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <span className="font-mono text-[11px] text-white/25">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : id)}
                    className="flex-1 truncate text-left text-sm font-semibold text-white hover:text-mint"
                  >
                    {summaryOf(row)}
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                    className="rounded px-1.5 text-white/40 hover:text-white disabled:opacity-20"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === rows.length - 1}
                    aria-label="Move down"
                    className="rounded px-1.5 text-white/40 hover:text-white disabled:opacity-20"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(id)}
                    aria-label="Delete"
                    className="rounded px-1.5 text-white/40 hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>

                {isOpen ? (
                  <div className="border-t border-white/8 px-4 py-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {fields.map((f) => (
                        <div
                          key={f.key}
                          className={
                            ["textarea", "list", "results", "socials"].includes(f.type)
                              ? "sm:col-span-2"
                              : undefined
                          }
                        >
                          <Label help={f.help}>{f.label}</Label>
                          <FieldInput
                            field={f}
                            value={row[f.key]}
                            options={refOptions[f.key]}
                            onChange={(v) => patch(id, f.key, v)}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => save(row)}
                        className="rounded-full bg-mint px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-mint-bright"
                      >
                        Save
                      </button>
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
