import ListEditor from "@/components/admin/ListEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  { key: "label", label: "Label", type: "text", summary: true },
  { key: "slug", label: "Slug", type: "text" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "price", label: "Price", type: "number" },
];

export default function Page() {
  return (
    <ListEditor
      table="addons"
      fields={FIELDS}
      title="Add-ons"
      description="Optional extras in the brief flow."
      addLabel="Add-on"
    />
  );
}
