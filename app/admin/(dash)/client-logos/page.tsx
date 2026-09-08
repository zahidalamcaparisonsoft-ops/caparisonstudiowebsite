import ListEditor from "@/components/admin/ListEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  {
    key: "name",
    label: "Name",
    type: "text",
    summary: true,
    help: "Used as the alt text, and shown in place of the mark until one is uploaded.",
  },
  {
    key: "logo_url",
    label: "Logo",
    type: "image",
    help: "Transparent PNG or SVG reads best on the light strip.",
  },
  {
    key: "href",
    label: "Link",
    type: "text",
    help: "Optional. Where the mark points.",
  },
];

export default function Page() {
  return (
    <ListEditor
      table="client_logos"
      fields={FIELDS}
      title="Client logos"
      description="The marks in the strip at the foot of the client stories."
      addLabel="Logo"
    />
  );
}
