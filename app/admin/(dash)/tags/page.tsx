import ListEditor from "@/components/admin/ListEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  { key: "name", label: "Name", type: "text", summary: true },
];

export default function Page() {
  return (
    <ListEditor
      table="tags"
      fields={FIELDS}
      title="Tags"
      description="Reusable tags you can attach to videos."
      addLabel="Tag"
    />
  );
}
