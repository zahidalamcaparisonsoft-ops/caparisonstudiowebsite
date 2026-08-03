import ListEditor from "@/components/admin/ListEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  { key: "title", label: "Title", type: "text", summary: true },
  { key: "step", label: "Number", type: "text" },
  { key: "timing", label: "Timing", type: "text" },
  { key: "copy", label: "Copy", type: "textarea" },
];

export default function Page() {
  return (
    <ListEditor
      table="process_steps"
      fields={FIELDS}
      title="Process"
      description="The five-step client journey."
      addLabel="Step"
    />
  );
}
