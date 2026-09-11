-- Briefs get a table. They have never had one.
--
-- /api/brief validated a submission and then console.logged it: no table, no
-- email, no webhook. Every brief the site received went to a function log and
-- expired with it. This is 0007 applied to the other form -- same shape, same
-- access rules, same reasoning.

create table if not exists brief_submissions (
  id                uuid primary key default gen_random_uuid(),
  name              text not null default '',
  email             text not null default '',

  -- What they chose, kept twice over: the slug, and the label that slug had
  -- on the day they chose it. The panel can rename a project type or delete
  -- it, and a brief from six months ago should still say what the visitor
  -- actually picked -- a label looked up later shows today's wording, or
  -- nothing at all where the row has since been removed.
  project_type      text not null default '',
  project_type_id   text not null default '',
  volume            text not null default '',
  volume_id         text not null default '',
  extras            text[] not null default '{}',
  extras_ids        text[] not null default '{}',

  links             text not null default '',
  notes             text not null default '',

  -- The estimate that was on screen when they pressed send, all five parts of
  -- it. The old route kept three and dropped the rest; the numbers a visitor
  -- was shown are the numbers they will expect to hear back, so none of them
  -- is safe to recompute later against rates that may have moved.
  quote_per_video   integer not null default 0,
  quote_per_month   integer not null default 0,
  quote_monthly     integer not null default 0,
  quote_discount    integer not null default 0,
  quote_first_cut   text not null default '',

  status            text not null default 'new',
  created_at        timestamptz not null default now(),

  constraint brief_submissions_status
    check (status in ('new', 'contacted', 'done'))
);

-- The panel lists newest first and counts the unanswered, so both reads are
-- indexed rather than scanning the table as it grows.
create index if not exists brief_submissions_created_idx
  on brief_submissions (created_at desc);
create index if not exists brief_submissions_status_idx
  on brief_submissions (status);

-- ── access ─────────────────────────────────────────────────────────────────
-- Admin only, for everything -- including select.
--
-- This table holds names, email addresses, whatever a stranger typed in the
-- notes box, and what they were quoted. A public read policy would publish
-- the lot: the anon key ships in the browser bundle, so anyone who opened
-- devtools could read every brief and every price ever offered. There is no
-- policy for anonymous insert either. Submissions arrive through /api/brief,
-- which checks the honeypot, the rate limit and the payload before writing
-- with the service role -- and the service role bypasses RLS, so that route is
-- the only way in. A public insert policy would let a bot skip all three.
alter table brief_submissions enable row level security;

drop policy if exists brief_submissions_admin on brief_submissions;
create policy brief_submissions_admin on brief_submissions
  for all using (public.is_admin()) with check (public.is_admin());
