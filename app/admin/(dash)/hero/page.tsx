import SingletonEditor from "@/components/admin/SingletonEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  { key: "eyebrow", label: "Eyebrow", type: "text" },
  { key: "headline", label: "Headline", type: "textarea", rows: 2 },
  { key: "cta_label", label: "Button label", type: "text" },
  { key: "cta_href", label: "Button link", type: "text" },
  { key: "vimeo_id", label: "Hero video — Vimeo ID", type: "text", help: "Digits from vimeo.com/1234567890. Leave blank to use the direct URL below." },
  { key: "video_url", label: "Hero video — direct URL", type: "video" },
  { key: "stat_value", label: "Overlay figure", type: "text", placeholder: "+38%" },
  { key: "stat_label", label: "Overlay figure caption", type: "textarea", rows: 2 },
  { key: "promise_title", label: "Second overlay — title", type: "text" },
  { key: "promise_body", label: "Second overlay — copy", type: "textarea", rows: 2 },
];

export default function Page() {
  return (
    <SingletonEditor
      table="hero"
      fields={FIELDS}
      title="Hero"
      description="The first screen: its wording and its demo video."
    />
  );
}
