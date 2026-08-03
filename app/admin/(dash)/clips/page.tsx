import ListEditor from "@/components/admin/ListEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  { key: "title", label: "Title", type: "text", summary: true },
  {
    key: "video_id",
    label: "Belongs to",
    type: "select",
    optionsFrom: { table: "videos", value: "id", label: "title" },
  },
  { key: "duration", label: "Duration", type: "text", placeholder: "0:48" },
  { key: "vimeo_id", label: "Vimeo ID", type: "text" },
  { key: "video_url", label: "Direct video URL", type: "video", help: "Used when there is no Vimeo ID." },
  { key: "thumbnail_url", label: "Thumbnail", type: "image" },
];

export default function Page() {
  return (
    <ListEditor
      table="video_clips"
      fields={FIELDS}
      title="Deliverables"
      description="The clips listed under each project when it is opened."
      addLabel="Deliverable"
    />
  );
}
