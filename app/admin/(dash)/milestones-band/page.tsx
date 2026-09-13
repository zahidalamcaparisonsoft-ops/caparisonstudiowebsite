import SingletonEditor from "@/components/admin/SingletonEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  {
    key: "heading",
    label: "Headline",
    type: "textarea",
    rows: 2,
    help: "It counts the years out loud — “Ten years of other people’s footage.” Adding a year does not rewrite it, so this is where that is done.",
  },
  {
    key: "subhead",
    label: "Sub-headline",
    type: "textarea",
    rows: 2,
    help: "The line under it. It tells the visitor the hand can be dragged, which is the only hint they get.",
  },
];

export default function Page() {
  return (
    <SingletonEditor
      table="milestones_band"
      fields={FIELDS}
      title="Journey wording"
      description="The two lines above the clock in the studio section."
    />
  );
}
