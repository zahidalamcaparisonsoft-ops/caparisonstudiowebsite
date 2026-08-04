/**
 * Field definitions for the admin editors.
 *
 * Each admin page is a table name plus a list of fields — the editors below
 * render and persist from that, so adding a column to the panel is one line
 * rather than a new page.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "bool"
  | "image"
  | "video"
  | "list" // string[] stored as jsonb
  | "results" // [{label,before,after,delta}] stored as jsonb
  | "socials" // [{label,href}] stored as jsonb
  | "select";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  help?: string;
  /** Shown in the collapsed row summary. */
  summary?: boolean;
  options?: { value: string; label: string }[];
  /** Options resolved at runtime from another table. */
  optionsFrom?: { table: string; value: string; label: string };
  placeholder?: string;
  rows?: number;
  /** Value a newly added row starts with. Must be serialisable: these field
      definitions cross the server/client boundary, and React cannot send a
      function across it. */
  seed?: string | number | boolean;
  /** Prefix for a unique starting value, e.g. "new-project" becomes
      "new-project-k3f9a". Needed on unique columns, or a second "Add"
      collides with the first. */
  uniqueSeed?: string;
};

export const emptyFor = (fields: Field[]): Record<string, unknown> => {
  const row: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.uniqueSeed) {
      row[f.key] = `${f.uniqueSeed}-${Math.random().toString(36).slice(2, 7)}`;
      continue;
    }
    if (f.seed !== undefined) {
      row[f.key] = f.seed;
      continue;
    }
    row[f.key] =
      f.type === "bool"
        ? false
        : f.type === "number"
          ? 0
          : f.type === "list" || f.type === "results" || f.type === "socials"
            ? []
            // A select holds a foreign key. Postgres rejects "" for a uuid
            // column outright, which is what broke "add" on videos.
            : f.type === "select"
              ? null
              : "";
  }
  return row;
};

/** Empty strings in foreign-key columns are not valid uuids — send null. */
export function normalise(fields: Field[], row: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = row[f.key];
    out[f.key] = f.type === "select" && (v === "" || v === undefined) ? null : v;
  }
  return out;
}
