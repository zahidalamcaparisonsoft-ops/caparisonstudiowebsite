import ListEditor from "@/components/admin/ListEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  { key: "title", label: "Title", type: "text", summary: true },
  { key: "slug", label: "Slug", type: "text", help: "Used in the case-study URL." },
  { key: "client", label: "Client", type: "text" },
  {
    key: "category_id",
    label: "Category",
    type: "select",
    optionsFrom: { table: "categories", value: "id", label: "label" },
  },
  { key: "vimeo_id", label: "Vimeo ID", type: "text", help: "Digits from vimeo.com/1234567890." },
  { key: "thumbnail_url", label: "Thumbnail", type: "image", help: "Custom poster image." },
  { key: "duration", label: "Duration", type: "text", placeholder: "12:06" },
  { key: "format", label: "Format", type: "text", placeholder: "4K · Multicam" },
  { key: "description", label: "Short description", type: "textarea", rows: 2 },
  { key: "featured", label: "Featured", type: "bool" },
  { key: "published", label: "Published", type: "bool" },
  { key: "summary", label: "Case study — summary", type: "textarea", rows: 2 },
  { key: "challenge", label: "Case study — the problem", type: "textarea", rows: 3 },
  { key: "approach", label: "Case study — what we did", type: "textarea", rows: 3 },
  { key: "results", label: "Outcome figures", type: "results", help: "Shown on the card, the case study and any linked testimonial." },
];

export default function Page() {
  return (
    <ListEditor
      table="videos"
      fields={FIELDS}
      title="Videos"
      description="Each entry is a project: its Vimeo ID, thumbnail, details and outcome figures."
      addLabel="Video"
    />
  );
}
