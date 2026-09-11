"use client";

import SubmissionInbox, {
  Detail,
  type Column,
  type SubmissionRow,
} from "./SubmissionInbox";

/** Free-trial applications. The shell is shared with the brief inbox. */

const COLUMNS: Column[] = [
  {
    width: "min-w-[9rem] flex-1 font-semibold text-ink",
    render: (r) => String(r.name || "—"),
  },
  {
    width: "min-w-[12rem] flex-1 truncate text-sm text-body",
    render: (r) => String(r.email || ""),
  },
  {
    width: "min-w-[8rem] flex-1 truncate text-sm text-muted",
    render: (r) => String(r.brand || "—"),
  },
];

export default function TrialInbox() {
  return (
    <SubmissionInbox
      table="trial_applications"
      title="Free trial applications"
      description="Newest first. Click one to read it and change where it has got to."
      empty="No applications yet. They will appear here the moment one is sent."
      columns={COLUMNS}
    >
      {(r: SubmissionRow) => (
        <>
          <Detail label="Email">
            <a
              href={`mailto:${r.email}`}
              className="text-brand underline underline-offset-4"
            >
              {String(r.email)}
            </a>
          </Detail>
          {r.footage_url ? (
            <Detail label="Footage">
              <span className="break-all">
                <a
                  href={String(r.footage_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand underline underline-offset-4"
                >
                  {String(r.footage_url)}
                </a>
              </span>
            </Detail>
          ) : null}
          <Detail label="What they need">
            <span className="whitespace-pre-wrap">
              {String(r.message || "— nothing written —")}
            </span>
          </Detail>
        </>
      )}
    </SubmissionInbox>
  );
}
