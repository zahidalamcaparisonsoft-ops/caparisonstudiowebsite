import ListEditor from "@/components/admin/ListEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  { key: "name", label: "Name", type: "text", summary: true },
  { key: "slug", label: "Slug", type: "text" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "per_video_cost", label: "Per-video cost", type: "number" },
  { key: "first_cut_days", label: "Days to first cut", type: "number" },
];

export default function Page() {
  return (
    <ListEditor
      table="project_types"
      fields={FIELDS}
      title="Project types"
      description="The cards in the brief flow, and the per-video rate each one sets."
      addLabel="Type"
    />
  );
}
