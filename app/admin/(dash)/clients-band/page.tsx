import SingletonEditor from "@/components/admin/SingletonEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  { key: "eyebrow", label: "Eyebrow", type: "text", placeholder: "Our clients" },
  { key: "heading", label: "Headline", type: "textarea", rows: 2 },
  {
    key: "heading_accent",
    label: "Headline in green",
    type: "text",
    placeholder: "creators and brands",
    help: "The words inside the headline set in green. They can sit anywhere in it — but they have to appear in the headline exactly, or the whole line simply stays black.",
  },
  { key: "subhead", label: "Sub-headline", type: "textarea", rows: 2 },

  { key: "stat_one_value", label: "Figure 1", type: "text", placeholder: "100+" },
  {
    key: "stat_one_label",
    label: "Figure 1 caption",
    type: "text",
    placeholder: "Happy clients",
  },
  { key: "stat_two_value", label: "Figure 2", type: "text", placeholder: "50+" },
  {
    key: "stat_two_label",
    label: "Figure 2 caption",
    type: "text",
    placeholder: "Countries",
  },
  {
    key: "stat_three_value",
    label: "Figure 3",
    type: "text",
    placeholder: "500M+",
  },
  {
    key: "stat_three_label",
    label: "Figure 3 caption",
    type: "text",
    placeholder: "Views generated",
  },
  {
    key: "stat_four_value",
    label: "Figure 4",
    type: "text",
    placeholder: "8+ Years",
    help: "Clear the number to drop a figure from the row.",
  },
  {
    key: "stat_four_label",
    label: "Figure 4 caption",
    type: "text",
    placeholder: "Growing together",
  },
];

export default function Page() {
  return (
    <SingletonEditor
      table="client_band"
      fields={FIELDS}
      title="Clients section"
      description="The wording above the logo rail, and the four figures under it. The marks themselves live in Client logos."
    />
  );
}
