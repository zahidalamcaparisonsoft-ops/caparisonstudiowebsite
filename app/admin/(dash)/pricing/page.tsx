import ListEditor from "@/components/admin/ListEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  { key: "name", label: "Name", type: "text", summary: true },
  {
    key: "description",
    label: "What it covers",
    type: "text",
    placeholder: "YouTube • Documentary • Automation",
    help: "The small line under the name. Separate the formats with • .",
  },
  { key: "price", label: "Starting price", type: "text", placeholder: "$120" },
  {
    key: "unit",
    label: "Unit",
    type: "text",
    placeholder: "/ video",
    help: "What that price buys one of — “/ video”, “/ minute”, “/ reel”. It is printed beside the figure, because $150 means two different things across these cards.",
  },
  { key: "features", label: "Features", type: "list" },
  { key: "featured", label: "Highlight this card", type: "bool" },
  { key: "cta_label", label: "Button label", type: "text", placeholder: "Get Exact Quote" },
];

export default function Page() {
  return (
    <ListEditor
      table="pricing_tiers"
      fields={FIELDS}
      title="Pricing"
      description="The published rate card. Every figure on it is a starting rate — the wording that says so is in Section wording."
      addLabel="Tier"
    />
  );
}
