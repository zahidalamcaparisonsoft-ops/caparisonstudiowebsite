"use client";

import SubmissionInbox, {
  Detail,
  type Column,
  type SubmissionRow,
} from "./SubmissionInbox";

/** Briefs sent through the four-question section. */

const money = (v: unknown) => {
  const n = Number(v) || 0;
  return n ? `$${n.toLocaleString()}` : "—";
};

const list = (v: unknown) =>
  Array.isArray(v) && v.length ? (v as unknown[]).map(String).join(", ") : "—";

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
    render: (r) => String(r.project_type || r.project_type_id || "—"),
  },
  {
    width: "font-mono text-xs text-brand",
    render: (r) => `${money(r.quote_monthly)}/mo`,
  },
];

export default function BriefInbox() {
  return (
    <SubmissionInbox
      table="brief_submissions"
      title="Brief submissions"
      description="Newest first. Click one for the whole brief and the estimate they were shown."
      empty="No briefs yet. They will appear here the moment one is sent."
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

          <div className="grid gap-3 sm:grid-cols-3">
            <Detail label="Project type">
              {String(r.project_type || r.project_type_id || "—")}
            </Detail>
            <Detail label="Volume">
              {String(r.volume || r.volume_id || "—")}
            </Detail>
            <Detail label="Extras">{list(r.extras)}</Detail>
          </div>

          {/* The estimate as the visitor saw it.
              These numbers came from the browser — the form works the quote out
              client-side and posts the result, so this is what they say was on
              screen, not something the server recomputed. It is stored rather
              than recalculated on purpose: rates move, and the figure they were
              shown is the figure they will expect to hear back. If one ever
              looks wrong, that is where it came from. */}
          <Detail label="Estimate they saw">
            <span className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[13px]">
              <span>{money(r.quote_monthly)}/mo</span>
              <span>{money(r.quote_per_video)}/video</span>
              <span>{String(r.quote_per_month || 0)} videos a month</span>
              {Number(r.quote_discount) ? (
                <span className="text-brand">
                  {String(r.quote_discount)}% volume discount
                </span>
              ) : null}
              {r.quote_first_cut ? (
                <span>first cut {String(r.quote_first_cut)}</span>
              ) : null}
            </span>
          </Detail>

          {r.links ? (
            <Detail label="Links">
              <span className="whitespace-pre-wrap break-all">
                {String(r.links)}
              </span>
            </Detail>
          ) : null}

          <Detail label="Notes">
            <span className="whitespace-pre-wrap">
              {String(r.notes || "— nothing written —")}
            </span>
          </Detail>
        </>
      )}
    </SubmissionInbox>
  );
}
