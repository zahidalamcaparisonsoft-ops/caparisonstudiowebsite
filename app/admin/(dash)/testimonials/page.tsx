import ListEditor from "@/components/admin/ListEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  { key: "name", label: "Name", type: "text", summary: true },
  {
    key: "role",
    label: "Role",
    type: "text",
    help: 'Shown after the name, e.g. "Founder".',
  },
  { key: "company", label: "Company", type: "text" },
  {
    key: "initials",
    label: "Initials",
    type: "text",
    help: "Stands in for the photo when there isn't one.",
  },
  {
    key: "avatar_url",
    label: "Photo",
    type: "image",
    help: "Their face, beside the quote.",
  },
  { key: "quote", label: "Pull-quote", type: "textarea", rows: 4 },
  {
    key: "vimeo_id",
    label: "Vimeo ID",
    type: "text",
    help: "Their video testimonial. Plays with Vimeo's own controls.",
  },
  {
    key: "video_url",
    label: "Direct video URL",
    type: "video",
    help: "Preferred: an uploaded file gets the site's own player.",
  },
  {
    key: "poster_url",
    label: "Poster",
    type: "image",
    help: "The still before the first press, and the picker thumbnail.",
  },
  {
    key: "stats",
    label: "Their three figures",
    type: "stats",
    help: 'Shown under the quote, e.g. "3+ Years" / "Working Together". The first three are used.',
  },
];

export default function Page() {
  return (
    <ListEditor
      table="testimonials"
      fields={FIELDS}
      title="Testimonials"
      description="Client videos, their quote, and the figures shown beside it."
      addLabel="Testimonial"
    />
  );
}
