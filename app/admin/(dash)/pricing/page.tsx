import ListEditor from "@/components/admin/ListEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  { key: "name", label: "Name", type: "text", summary: true },
  { key: "price", label: "Price", type: "text" },
  { key: "unit", label: "Unit", type: "text" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "features", label: "Features", type: "list" },
  { key: "featured", label: "Highlight this tier", type: "bool" },
  { key: "cta_label", label: "Button label", type: "text" },
];

export default function Page() {
  return (
    <ListEditor
      table="pricing_tiers"
      fields={FIELDS}
      title="Pricing"
      description="The published tiers."
      addLabel="Tier"
    />
  );
}
