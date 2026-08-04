import ListEditor from "@/components/admin/ListEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  { key: "label", label: "Label", type: "text", summary: true },
  { key: "slug", label: "Slug", type: "text", uniqueSeed: "category" },
  { key: "short_label", label: "Short label", type: "text" },
];

export default function Page() {
  return (
    <ListEditor
      table="categories"
      fields={FIELDS}
      title="Categories"
      description="Niches used to filter the work deck."
      addLabel="Category"
    />
  );
}
