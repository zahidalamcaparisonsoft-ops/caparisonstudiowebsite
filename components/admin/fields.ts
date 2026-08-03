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
};

export const emptyFor = (fields: Field[]): Record<string, unknown> => {
  const row: Record<string, unknown> = {};
  for (const f of fields) {
    row[f.key] =
      f.type === "bool"
        ? false
        : f.type === "number"
          ? 0
          : f.type === "list" || f.type === "results" || f.type === "socials"
            ? []
            : "";
  }
  return row;
};
