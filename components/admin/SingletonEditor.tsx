"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { browserClient } from "@/lib/supabase/client";
import { FieldInput, Label } from "./Inputs";
import type { Field } from "./fields";

/** Editor for a one-row table (hero, site settings, onboarding copy). */
export default function SingletonEditor({
  table,
  fields,
  title,
  description,
}: {
  table: string;
  fields: Field[];
  title: string;
  description?: string;
}) {
  const supabase = useMemo(() => browserClient(), []);
  const [row, setRow] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from(table).select("*").eq("id", 1).single();
    if (error) setError(error.message);
    else setRow(data as Record<string, unknown>);
  }, [supabase, table]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!row) return;
    setError(null);
    const payload: Record<string, unknown> = {};
    for (const f of fields) payload[f.key] = row[f.key];
    const { error } = await supabase.from(table).update(payload).eq("id", 1);
    if (error) setError(error.message);
    else {
      setStatus("Saved");
      setTimeout(() => setStatus(null), 2200);
    }
  };

  if (!row) {
    return (
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">{title}</h1>
        <p className="mt-6 text-sm text-white/40">{error ?? "Loading…"}</p>
      </div>
    );
  }

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">{title}</h1>
          {description ? <p className="mt-1 text-sm text-white/45">{description}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          {status ? <span className="text-xs text-mint">{status}</span> : null}
          <button
            type="button"
            onClick={save}
            className="rounded-full bg-mint px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-mint-bright"
          >
            Save
          </button>
        </div>
      </header>

      {error ? (
        <p role="alert" className="mt-4 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm text-amber-300">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
              onChange={(v) => setRow({ ...row, [f.key]: v })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
