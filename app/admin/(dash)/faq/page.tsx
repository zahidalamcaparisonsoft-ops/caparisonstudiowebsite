import ListEditor from "@/components/admin/ListEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  { key: "question", label: "Question", type: "text", summary: true },
  { key: "answer", label: "Answer", type: "textarea" },
];

export default function Page() {
  return (
    <ListEditor
      table="faqs"
      fields={FIELDS}
      title="FAQ"
      description="Questions and answers. These also feed the search rich-result markup."
      addLabel="Question"
    />
  );
}
