import SingletonEditor from "@/components/admin/SingletonEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  { key: "eyebrow", label: "Chip", type: "text", placeholder: "Free trial" },
  { key: "heading", label: "Headline", type: "text" },
  {
    key: "heading_accent",
    label: "Headline in green",
    type: "text",
    placeholder: "free trial.",
    help: "The words inside the headline set in green. They have to appear in the headline exactly, or the whole line stays black.",
  },
  { key: "subhead", label: "Sub-headline", type: "textarea", rows: 2 },

  {
    key: "point_one",
    label: "Point 1",
    type: "text",
    help: "The three short points under the sub-headline. Their icons are fixed by position, so the wording can change freely.",
  },
  { key: "point_two", label: "Point 2", type: "text" },
  { key: "point_three", label: "Point 3", type: "text" },

  { key: "step_one_title", label: "Step 1 title", type: "text" },
  { key: "step_one_body", label: "Step 1 text", type: "textarea", rows: 2 },
  { key: "step_two_title", label: "Step 2 title", type: "text" },
  { key: "step_two_body", label: "Step 2 text", type: "textarea", rows: 2 },
  { key: "step_three_title", label: "Step 3 title", type: "text" },
  { key: "step_three_body", label: "Step 3 text", type: "textarea", rows: 2 },

  {
    key: "note_top",
    label: "Handwritten note — by the form",
    type: "text",
    help: "Set in script with an arrow pointing at the form. Leave blank to hide it.",
  },
  {
    key: "note_bottom",
    label: "Handwritten note — under the steps",
    type: "textarea",
    rows: 2,
    help: "Set in script with an underline. Leave blank to hide it.",
  },

  { key: "form_title", label: "Form heading", type: "text" },
  { key: "form_subhead", label: "Form sub-heading", type: "textarea", rows: 2 },
  { key: "button_label", label: "Button", type: "text" },
  {
    key: "form_note",
    label: "Note under the button",
    type: "text",
    placeholder: "Limited trial slots each month.",
  },
];

export default function Page() {
  return (
    <SingletonEditor
      table="trial_band"
      fields={FIELDS}
      title="Free trial copy"
      description="Everything written in the free-trial section. Applications sent through it are under Trial applications."
    />
  );
}
