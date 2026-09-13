import ListEditor from "@/components/admin/ListEditor";
import type { Field } from "@/components/admin/fields";

/**
 * The years on the clock in the studio section.
 *
 * One row is one mark on the dial, in the order they are listed here — so
 * adding next year is Add, type the year, write the line, upload the picture.
 */
const FIELDS: Field[] = [
  {
    key: "year",
    label: "Year",
    type: "text",
    summary: true,
    placeholder: "2027",
    help: "The numeral on the dial. A row with this left blank stays in the list and off the clock, so a year can be started and finished later.",
  },
  { key: "title", label: "What happened", type: "text" },
  {
    key: "copy",
    label: "Description",
    type: "textarea",
    rows: 3,
    help: "The paragraph under the picture. Two or three lines — it has to be readable in the few seconds the hand rests on it.",
  },
  {
    key: "image_url",
    label: "Photo",
    type: "image",
    help: "Shown beside the dial. Landscape, roughly 16:10, at least 1200px wide. Without one, a tinted plate with the year across it is drawn instead.",
  },
  {
    key: "hue",
    label: "Plate colour",
    type: "number",
    seed: 152,
    help: "0–360 around the colour wheel: 150 green, 220 blue, 350 red. Only ever seen on a year with no photo.",
  },
];

export default function Page() {
  return (
    <ListEditor
      table="milestones"
      fields={FIELDS}
      title="Journey years"
      description="Every year on the clock — what happened that year, and a photograph for it. Add a row and it becomes a new mark on the dial."
      addLabel="Year"
    />
  );
}
