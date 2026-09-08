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
  { key: "subhead", label: "Sub-headline", type: "textarea", rows: 2 },
  {
    key: "script_line",
    label: "Handwritten line",
    type: "text",
    help: "Set in script beside the client's name. The studio's line, the same on every testimonial. Leave blank to hide it.",
  },
  {
    key: "stat_one_value",
    label: "Figure 1",
    type: "text",
    placeholder: "100+",
  },
  {
    key: "stat_one_label",
    label: "Figure 1 caption",
    type: "text",
    placeholder: "Happy Clients",
  },
  {
    key: "stat_two_value",
    label: "Figure 2",
    type: "text",
    placeholder: "1B+",
  },
  {
    key: "stat_two_label",
    label: "Figure 2 caption",
    type: "text",
    placeholder: "Views Generated",
  },
  {
    key: "stat_three_value",
    label: "Figure 3",
    type: "text",
    placeholder: "50+",
  },
  {
    key: "stat_three_label",
    label: "Figure 3 caption",
    type: "text",
    placeholder: "Countries Served",
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
      description="The wording around the testimonials, and the three studio-wide figures above them."
    />
  );
}
