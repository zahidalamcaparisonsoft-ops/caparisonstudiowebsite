"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { browserClient } from "@/lib/supabase/client";
import { FieldInput, Label } from "./Inputs";
import { announceSaved, emptyFor, normalise, type Field } from "./fields";
import { EditorHeader, ErrorNote, PrimaryButton } from "./EditorChrome";

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
  const [dirty, setDirty] = useState<Set<string>>(new Set());

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

  // Closing the tab mid-edit should not silently discard the work.
  useEffect(() => {
    if (!dirty.size) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

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

  const patch = (id: string, key: string, value: unknown) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
    setDirty((d) => new Set(d).add(id));
  };

  const save = async (row: Row) => {
    setError(null);
    const payload: Row = normalise(fields, row);
    payload.sort_order = row.sort_order ?? 0;
    const { error } = await supabase.from(table).update(payload).eq("id", row.id!);
    if (error) return setError(error.message);
    setDirty((d) => {
      const next = new Set(d);
      next.delete(row.id!);
      return next;
    });
    announceSaved();
    flash("Saved");
  };

  const add = async () => {
    setError(null);
    const payload = { ...emptyFor(fields), sort_order: rows.length };
    const { data, error } = await supabase.from(table).insert(payload).select().single();
    if (error) return setError(error.message);
    announceSaved();
    setRows((r) => [...r, data as Row]);
    setOpen((data as Row).id!);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) setError(error.message);
    else {
      setRows((r) => r.filter((x) => x.id !== id));
      announceSaved();
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
    announceSaved();
    flash("Reordered");
  };

  /** First image field with a value — used as a row thumbnail. */
  const thumbOf = (row: Row) => {
    const f = fields.find((x) => x.type === "image" && row[x.key]);
    return f ? String(row[f.key]) : null;
  };

  const summaryOf = (row: Row) => {
    const f = fields.find((x) => x.summary) ?? fields[0];
    const v = row[f.key];
    return String(v || "").slice(0, 70) || "(untitled)";
  };

  return (
    <div>
      <EditorHeader title={title} description={description} status={status} dirty={dirty.size > 0}>
        <PrimaryButton onClick={add}>+ {addLabel}</PrimaryButton>
      </EditorHeader>

      {error ? <ErrorNote message={error} /> : null}

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
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <span className="font-mono text-[11px] text-white/25">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {thumbOf(row) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbOf(row)!}
                      alt=""
                      className="h-9 w-14 shrink-0 rounded-md border border-white/10 object-cover"
                    />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span
                      aria-hidden="true"
                      className={`text-[10px] text-white/30 transition-transform ${isOpen ? "rotate-90" : ""}`}
                    >
                      ▶
                    </span>
                    <span className="truncate text-sm font-semibold text-white hover:text-mint">
                      {summaryOf(row)}
                    </span>
                    {dirty.has(id) ? (
                      <span
                        aria-label="Unsaved"
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400"
                      />
                    ) : null}
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
                    <div className="mt-5 flex items-center justify-end gap-3 border-t border-white/8 pt-4">
                      {dirty.has(id) ? (
                        <span className="text-xs text-amber-300">Unsaved changes</span>
                      ) : null}
                      <PrimaryButton onClick={() => save(row)} disabled={!dirty.has(id)}>
                        Save
                      </PrimaryButton>
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
