import ListEditor from "@/components/admin/ListEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  { key: "name", label: "Name", type: "text", summary: true },
  { key: "slug", label: "Slug", type: "text" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "per_video_cost", label: "Unit cost", type: "number" },
  {
    key: "unit",
    label: "Priced per",
    type: "text",
    placeholder: "video",
    seed: "video",
    help: "One word, singular: video, minute, reel. The whole brief counts in it — the volume question, the estimate and the stored quote all follow this word. Leave it as “video” unless the rate is not per finished piece.",
  },
  { key: "first_cut_days", label: "Days to first cut", type: "number" },
];

export default function Page() {
  return (
    <ListEditor
      table="project_types"
      fields={FIELDS}
      title="Project types"
      description="The cards in question one, and the rate each one sets. Keep these in step with the published cards in Pricing — a visitor sees both."
      addLabel="Type"
    />
  );
}
