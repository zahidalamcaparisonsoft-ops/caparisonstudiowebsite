import SingletonEditor from "@/components/admin/SingletonEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  { key: "heading", label: "Heading", type: "text" },
  { key: "subhead", label: "Sub-heading", type: "textarea", rows: 2 },
  { key: "note", label: "Small print under the estimate", type: "textarea", rows: 2 },
];

export default function Page() {
  return (
    <SingletonEditor
      table="onboarding"
      fields={FIELDS}
      title="Brief copy"
      description="Wording for the four-question section. The cards, cadences and add-ons have their own pages."
    />
  );
}
