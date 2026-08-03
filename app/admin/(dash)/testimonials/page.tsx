import ListEditor from "@/components/admin/ListEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  { key: "name", label: "Name", type: "text", summary: true },
  { key: "role", label: "Role", type: "text" },
  { key: "company", label: "Company", type: "text" },
  { key: "initials", label: "Initials", type: "text" },
  { key: "quote", label: "Quote", type: "textarea", rows: 3 },
  { key: "vimeo_id", label: "Vimeo ID", type: "text", help: "Their video testimonial." },
  { key: "video_url", label: "Direct video URL", type: "video", help: "Used when there is no Vimeo ID." },
  { key: "poster_url", label: "Poster", type: "image" },
  {
    key: "video_ref",
    label: "Show figures from",
    type: "select",
    optionsFrom: { table: "videos", value: "id", label: "title" },
    help: "The project whose outcome figures appear beside this testimonial.",
  },
];

export default function Page() {
  return (
    <ListEditor
      table="testimonials"
      fields={FIELDS}
      title="Testimonials"
      description="Video testimonials, and the client results shown alongside them."
      addLabel="Testimonial"
    />
  );
}
