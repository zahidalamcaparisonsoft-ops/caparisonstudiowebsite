import ListEditor from "@/components/admin/ListEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  { key: "label", label: "Label", type: "text", summary: true },
  { key: "slug", label: "Slug", type: "text" },
  { key: "per_month", label: "Videos per month", type: "number" },
  { key: "multiplier", label: "Price multiplier", type: "number" },
];

export default function Page() {
  return (
    <ListEditor
      table="cadences"
      fields={FIELDS}
      title="Cadences"
      description="Publishing frequency options and their volume multiplier."
      addLabel="Cadence"
    />
  );
}
