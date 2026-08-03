"use client";

import { useCallback, useRef, useState } from "react";
import { browserClient } from "@/lib/supabase/client";
import type { Field } from "./fields";

const BUCKET = "media";

export const inputCls =
  "w-full rounded-lg border border-white/12 bg-black/50 px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-mint/60";

export function Label({ children, help }: { children: React.ReactNode; help?: string }) {
  return (
    <span className="mb-1.5 block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-white/50">
        {children}
      </span>
      {help ? <span className="mt-0.5 block text-[11px] text-white/30">{help}</span> : null}
    </span>
  );
}

/* ─────────────────────────────────────────────────────── image / video upload */

export function UploadField({
  value,
  onChange,
  accept,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  accept: string;
  label: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setBusy(true);
      setError(null);
      try {
        // Uploads go through our own route so the storage target (Supabase now,
        // R2 when its keys are set) can change without touching the UI.
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Upload failed");
        onChange(json.url);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setBusy(false);
      }
    },
    [onChange],
  );

  return (
    <div>
      <div className="flex gap-2">
        <input
          className={inputCls}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… or upload"
        />
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="shrink-0 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white transition-colors hover:border-mint/50 hover:text-mint disabled:opacity-40"
        >
          {busy ? "Uploading…" : "Upload"}
        </button>
        <input
          ref={input}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
            e.target.value = "";
          }}
        />
      </div>
      {error ? <p className="mt-1 text-xs text-amber-400">{error}</p> : null}
      {value && accept.startsWith("image") ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="mt-2 h-20 w-auto rounded-md border border-white/10 object-cover"
        />
      ) : null}
      <span className="sr-only">{label}</span>
    </div>
  );
}

/* ───────────────────────────────────────────────────────── repeating lists */

function StringList({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {value.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            className={inputCls}
            value={item}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...value];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="shrink-0 rounded-lg border border-white/12 px-2.5 text-xs text-white/50 hover:border-red-400/50 hover:text-red-300"
            aria-label="Remove"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, ""])}
        className="self-start rounded-lg border border-dashed border-white/20 px-3 py-1.5 text-xs text-white/60 hover:border-mint/40 hover:text-mint"
      >
        + Add
      </button>
    </div>
  );
}

function ObjectList<T extends Record<string, string>>({
  value,
  onChange,
  keys,
}: {
  value: T[];
  onChange: (v: T[]) => void;
  keys: { k: keyof T & string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      {value.map((row, i) => (
        <div
          key={i}
          className="flex flex-wrap items-end gap-2 rounded-lg border border-white/10 p-2"
        >
          {keys.map(({ k, label }) => (
            <label key={k} className="min-w-[7rem] flex-1">
              <span className="mb-1 block text-[10px] uppercase tracking-wider text-white/35">
                {label}
              </span>
              <input
                className={inputCls}
                value={row[k] ?? ""}
                onChange={(e) => {
                  const next = [...value];
                  next[i] = { ...next[i], [k]: e.target.value };
                  onChange(next);
                }}
              />
            </label>
          ))}
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="rounded-lg border border-white/12 px-2.5 py-2 text-xs text-white/50 hover:border-red-400/50 hover:text-red-300"
            aria-label="Remove"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([...value, Object.fromEntries(keys.map((x) => [x.k, ""])) as T])
        }
        className="self-start rounded-lg border border-dashed border-white/20 px-3 py-1.5 text-xs text-white/60 hover:border-mint/40 hover:text-mint"
      >
        + Add
      </button>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────── the switch */

export function FieldInput({
  field,
  value,
  onChange,
  options,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  options?: { value: string; label: string }[];
}) {
  const v = value;

  switch (field.type) {
    case "textarea":
      return (
        <textarea
          className={`${inputCls} resize-y`}
          rows={field.rows ?? 3}
          value={String(v ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "number":
      return (
        <input
          type="number"
          className={inputCls}
          value={Number(v ?? 0)}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        />
      );

    case "bool":
      return (
        <button
          type="button"
          onClick={() => onChange(!v)}
          aria-pressed={Boolean(v)}
          className={`flex h-7 w-12 items-center rounded-full border px-0.5 transition-colors ${
            v ? "border-mint/60 bg-mint/25" : "border-white/15 bg-white/5"
          }`}
        >
          <span
            className={`h-5 w-5 rounded-full transition-transform ${
              v ? "translate-x-5 bg-mint" : "bg-white/40"
            }`}
          />
        </button>
      );

    case "select": {
      const opts = options ?? field.options ?? [];
      return (
        <select
          className={inputCls}
          value={String(v ?? "")}
          onChange={(e) => onChange(e.target.value || null)}
        >
          <option value="">—</option>
          {opts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }

    case "image":
      return (
        <UploadField
          value={String(v ?? "")}
          onChange={onChange}
          accept="image/*"
          label={field.label}
        />
      );

    case "video":
      return (
        <UploadField
          value={String(v ?? "")}
          onChange={onChange}
          accept="video/*"
          label={field.label}
        />
      );

    case "list":
      return (
        <StringList
          value={Array.isArray(v) ? (v as string[]) : []}
          onChange={onChange}
          placeholder={field.placeholder}
        />
      );

    case "results":
      return (
        <ObjectList
          value={Array.isArray(v) ? (v as Record<string, string>[]) : []}
          onChange={onChange}
          keys={[
            { k: "label", label: "Metric" },
            { k: "before", label: "Before" },
            { k: "after", label: "After" },
            { k: "delta", label: "Change" },
          ]}
        />
      );

    case "socials":
      return (
        <ObjectList
          value={Array.isArray(v) ? (v as Record<string, string>[]) : []}
          onChange={onChange}
          keys={[
            { k: "label", label: "Network" },
            { k: "href", label: "URL" },
          ]}
        />
      );

    default:
      return (
        <input
          className={inputCls}
          value={String(v ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
