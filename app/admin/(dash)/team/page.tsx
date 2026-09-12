import ListEditor from "@/components/admin/ListEditor";
import type { Field } from "@/components/admin/fields";

const FIELDS: Field[] = [
  { key: "name", label: "Name", type: "text", summary: true },
  { key: "designation", label: "Designation", type: "text" },
  { key: "initials", label: "Initials", type: "text" },
  { key: "photo_url", label: "Photo", type: "image" },
];

export default function Page() {
  return (
    <ListEditor
      table="team_members"
      fields={FIELDS}
      title="Team"
      description="Photos, names and designations for the team wall."
      addLabel="Member"
    />
  );
}
