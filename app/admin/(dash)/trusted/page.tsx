import ListEditor from "@/components/admin/ListEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  { key: "name", label: "Name", type: "text", summary: true },
];

export default function Page() {
  return (
    <ListEditor
      table="trusted_by"
      fields={FIELDS}
      title="Trusted by"
      description="Client names shown in the hero bar."
      addLabel="Client"
    />
  );
}
