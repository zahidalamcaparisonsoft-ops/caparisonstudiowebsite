import SingletonEditor from "@/components/admin/SingletonEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  { key: "studio_name", label: "Studio name", type: "text" },
  { key: "tagline", label: "Tagline", type: "textarea", rows: 2 },
  { key: "email", label: "Contact email", type: "text" },
  { key: "location", label: "Location line", type: "text" },
  { key: "logo_url", label: "Logo mark", type: "image" },
  { key: "wordmark_url", label: "Wordmark", type: "image" },
  { key: "socials", label: "Social links", type: "socials" },
];

export default function Page() {
  return (
    <SingletonEditor
      table="site_settings"
      fields={FIELDS}
      title="Site details"
      description="Name, logo, email and social links used across the site."
    />
  );
}
