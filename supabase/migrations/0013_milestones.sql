-- The clock on the studio section gets a table, so a year can be added.
--
-- The thirteen years on the dial were a `const` inside the component. That
-- was fine for as long as the site was being written; it stops being fine on
-- the first of January, when adding 2027 means an editor, a deploy, and
-- someone who knows TypeScript. The studio should be able to add a year, say
-- what happened in it, and put a photograph on it, from the panel.
--
-- Two tables, because they are two different jobs: the years themselves, and
-- the two lines of wording above them. The wording is in here for the same
-- reason the years are — "Ten years of other people's footage." is a count,
-- and every year added makes it one year wronger.

-- ── the years on the dial ──────────────────────────────────────────────────
-- `copy` matches `process_steps.copy` rather than inventing `description`, so
-- the two lists that both hold a title and a paragraph are shaped the same.
--
-- `hue` colours the plate drawn for a year with no photograph — the one with
-- the big ghosted numeral on it. It is only ever seen until a picture is
-- uploaded, which is why it is a plain number and not a colour picker.
create table if not exists milestones (
  id         uuid primary key default gen_random_uuid(),
  year       text not null default '',
  title      text not null default '',
  copy       text not null default '',
  image_url  text,
  hue        int not null default 152,
  sort_order int not null default 0
);

-- ── the wording above them ─────────────────────────────────────────────────
-- A singleton at id = 1, the same shape `hero`, `client_band`, `trial_band`
-- and `pricing_band` use, so the existing SingletonEditor drives it with no
-- new machinery.
create table if not exists milestones_band (
  id      int primary key default 1,
  heading text not null default 'Ten years of other people''s footage.',
  subhead text not null default
    'Every year here changed how the next one was cut. Drag the hand, or let it walk.',
  constraint milestones_band_singleton check (id = 1)
);

insert into milestones_band (id) values (1) on conflict (id) do nothing;

-- ── the years as they stand ────────────────────────────────────────────────
-- Seeded only into an empty table. Re-running this migration after a year has
-- been edited in the panel must not quietly put the sample wording back.
insert into milestones (year, title, copy, hue, sort_order)
select v.year, v.title, v.copy, v.hue, v.sort_order
from (values
  ('2014', 'Two people and one edit suite',
   'Founded in Berlin cutting music documentaries, working out of a room with one monitor between us.',
   152, 0),
  ('2015', 'First paid festival cut',
   'A forty-minute assembly turned round in nine days, which taught us what our own deadlines were actually worth.',
   172, 1),
  ('2016', 'The first retainer',
   'A weekly show that had to ship every Thursday. The cadence it forced on us became the way the studio runs.',
   196, 2),
  ('2017', 'Templates, locked',
   'Stopped rebuilding titles per project. One locked template per client, versioned, so nothing drifts between episodes.',
   214, 3),
  ('2018', 'Colour and sound in-house',
   'Stopped subcontracting the finish. One team from rushes to master, which took a week out of every delivery.',
   232, 4),
  ('2019', 'Retention became the brief',
   'Started reading the analytics behind every cut we shipped, and rewriting the first thirty seconds until they held.',
   258, 5),
  ('2020', 'Review moved off email',
   'Built the timecode review portal after losing one too many notes in a thread. Revisions have been comments on a frame ever since.',
   284, 6),
  ('2021', 'Named editors',
   'Every channel got one editor who stays with it, so the person cutting your video is the person who cut the last one.',
   310, 7),
  ('2022', 'Five hundredth video',
   'Delivered for automation channels, podcasts and product teams — and started publishing the retention data behind the cuts.',
   334, 8),
  ('2023', 'Same-day quotes',
   'Put the price on screen before the brief is sent. No call required to find out what a cut costs.',
   14, 9),
  ('2024', 'Fourteen editors, four time zones',
   'A crew that covers the clock, so a Friday delivery does not depend on one person''s Friday.',
   38, 10),
  ('2025', 'Ninety-eight per cent, on time',
   'The delivery record stopped being a claim and started being a number we publish.',
   62, 11),
  ('2026', '1,240 videos in',
   'Ten years on, the rule has not moved: the edit serves the watch time, not the editor''s ego.',
   104, 12)
) as v(year, title, copy, hue, sort_order)
where not exists (select 1 from milestones);

-- ── access ─────────────────────────────────────────────────────────────────
-- Public read, admin write, matching every other table on this site.
alter table milestones enable row level security;

drop policy if exists milestones_read on milestones;
create policy milestones_read on milestones
  for select using (true);

drop policy if exists milestones_write on milestones;
create policy milestones_write on milestones
  for all using (public.is_admin()) with check (public.is_admin());

alter table milestones_band enable row level security;

drop policy if exists milestones_band_read on milestones_band;
create policy milestones_band_read on milestones_band
  for select using (true);

drop policy if exists milestones_band_write on milestones_band;
create policy milestones_band_write on milestones_band
  for all using (public.is_admin()) with check (public.is_admin());

-- ── the dashboard's badge ──────────────────────────────────────────────────
-- `create or replace` keeps the existing grants, so nothing has to be
-- re-granted afterwards.
create or replace function admin_overview()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'is_admin',           public.is_admin(),
    'hero',               (select count(*) from hero),
    'videos',             (select count(*) from videos),
    'video_clips',        (select count(*) from video_clips),
    'testimonials',       (select count(*) from testimonials),
    'categories',         (select count(*) from categories),
    'tags',               (select count(*) from tags),
    'team_members',       (select count(*) from team_members),
    'process_steps',      (select count(*) from process_steps),
    'project_types',      (select count(*) from project_types),
    'pricing_tiers',      (select count(*) from pricing_tiers),
    'faqs',               (select count(*) from faqs),
    'trusted_by',         (select count(*) from trusted_by),
    'client_logos',       (select count(*) from client_logos),
    'cadences',           (select count(*) from cadences),
    'addons',             (select count(*) from addons),
    'trial_applications', (select count(*) from trial_applications),
    'brief_submissions',  (select count(*) from brief_submissions),
    -- new since 0009
    'milestones',         (select count(*) from milestones)
  );
$$;

revoke all on function admin_overview() from public;
grant execute on function admin_overview() to authenticated;
