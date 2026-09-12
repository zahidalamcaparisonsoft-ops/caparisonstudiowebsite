import SingletonEditor from "@/components/admin/SingletonEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  { key: "eyebrow", label: "Eyebrow", type: "text", placeholder: "Pricing" },
  { key: "heading", label: "Headline", type: "textarea", rows: 2 },
  {
    key: "heading_accent",
    label: "Headline in green",
    type: "text",
    placeholder: "Built for Your Goals",
    help: "The words inside the headline set in green. They can sit anywhere in it — but they have to appear in the headline exactly, or the whole line simply stays black.",
  },
  { key: "subhead", label: "Sub-headline", type: "textarea", rows: 3 },
  {
    key: "from_label",
    label: "Caption over each price",
    type: "text",
    placeholder: "Starting from",
    help: "Every figure on these cards is a starting rate. This is the line that says so.",
  },

  {
    key: "note_one_title",
    label: "Point 1",
    type: "text",
    placeholder: "Custom Pricing",
    help: "Clear the title to drop a point from the band.",
  },
  { key: "note_one_body", label: "Point 1 text", type: "textarea", rows: 3 },
  {
    key: "note_two_title",
    label: "Point 2",
    type: "text",
    placeholder: "Volume Discounts",
  },
  { key: "note_two_body", label: "Point 2 text", type: "textarea", rows: 3 },
  {
    key: "note_three_title",
    label: "Point 3",
    type: "text",
    placeholder: "Let’s Talk",
  },
  { key: "note_three_body", label: "Point 3 text", type: "textarea", rows: 3 },

  {
    key: "cta_label",
    label: "Button",
    type: "text",
    placeholder: "Get a Custom Quote",
  },
  {
    key: "cta_href",
    label: "Button link",
    type: "text",
    placeholder: "#onboarding",
    help: "An anchor on this page, or a full address.",
  },
  {
    key: "cta_note",
    label: "Small print under the button",
    type: "text",
    placeholder: "Fast response · No obligation",
  },
];

export default function Page() {
  return (
    <SingletonEditor
      table="pricing_band"
      fields={FIELDS}
      title="Pricing section"
      description="The wording above the cards, and the band under them that says what moves the number. The cards themselves live in Tiers."
    />
  );
}
