import SingletonEditor from "@/components/admin/SingletonEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  {
    key: "eyebrow",
    label: "Eyebrow",
    type: "text",
    placeholder: "Client stories",
  },
  { key: "heading", label: "Headline", type: "textarea", rows: 2 },
  {
    key: "heading_accent",
    label: "Headline in green",
    type: "text",
    placeholder: "our word for it.",
    help: "The tail of the headline, set in green. It only takes colour where the headline actually ends with these words \u2014 so if you rewrite the headline, rewrite this to match, or it will simply stay black.",
  },
  { key: "subhead", label: "Sub-headline", type: "textarea", rows: 2 },
  {
    key: "script_line",
    label: "Handwritten line",
    type: "text",
    help: "Set in script beside the client's name, with an arrow back to the film. Shown beside a landscape testimonial only \u2014 a vertical one writes its note on the picture instead. Leave blank to hide it.",
  },
  {
    key: "note_wide",
    label: "Note on the picture \u2014 landscape",
    type: "text",
    placeholder: "Great team to work with!",
    help: "Written in the top-right corner of a landscape film. Leave blank to hide it.",
  },
  {
    key: "note_reel",
    label: "Note on the picture \u2014 vertical",
    type: "text",
    placeholder: "Real people. Real results.",
    help: "The same corner of a vertical film. Leave blank to hide it.",
  },
  { key: "logos_label", label: "Logo strip label", type: "textarea", rows: 2 },
  {
    key: "logos_more",
    label: "Logo strip tail",
    type: "text",
    placeholder: "and many more…",
  },
];

export default function Page() {
  return (
    <SingletonEditor
      table="testimonial_band"
      fields={FIELDS}
      title="Client stories"
      description="The wording around the testimonials \u2014 the headline, the handwritten notes, and the logo strip that closes the section."
    />
  );
}
