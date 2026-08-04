"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { browserClient } from "@/lib/supabase/client";
import { FieldInput, Label } from "./Inputs";
import { normalise, type Field } from "./fields";
import { EditorHeader, ErrorNote, PrimaryButton } from "./EditorChrome";

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
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from(table).select("*").eq("id", 1).single();
    if (error) setError(error.message);
    else setRow(data as Record<string, unknown>);
  }, [supabase, table]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = async () => {
    if (!row) return;
    setError(null);
    const payload = normalise(fields, row);
    const { error } = await supabase.from(table).update(payload).eq("id", 1);
    if (error) return setError(error.message);
    setDirty(false);
    setStatus("Saved");
    setTimeout(() => setStatus(null), 2200);
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
      <EditorHeader title={title} description={description} status={status} dirty={dirty}>
        <PrimaryButton onClick={save} disabled={!dirty}>
          Save
        </PrimaryButton>
      </EditorHeader>

      {error ? <ErrorNote message={error} /> : null}

      <div className="grid gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:grid-cols-2 sm:p-6">
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
              onChange={(v) => {
                setRow({ ...row, [f.key]: v });
                setDirty(true);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
