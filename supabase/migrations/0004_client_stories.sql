-- Client stories: the testimonial band gets its own figures, faces and logos.
--
-- Before this, the figures beside a testimonial were borrowed from the linked
-- project's case study (`video_ref` -> videos.results), so a client could only
-- show numbers that happened to be modelled as a before/after pair on a piece
-- of work. The band now carries its own three figures per client, as plain
-- value/label pairs, which is what a client actually says about themselves —
-- "3+ years working together", "£400K+ monthly revenue".
--
-- `video_ref` is deliberately left in place rather than dropped: the column
-- costs nothing, and dropping a column is the one migration you cannot undo
-- by re-running the next one. It is simply no longer read or offered in the
-- panel.

-- ── per-client: a face, and their own figures ───────────────────────────────
alter table testimonials add column if not exists avatar_url text;
alter table testimonials
  add column if not exists stats jsonb not null default '[]'::jsonb;

-- ── the band's own wording, and the three studio-wide figures ───────────────
-- A singleton, keyed at id = 1, the same shape `hero` and `onboarding` use so
-- the existing SingletonEditor can drive it with no new machinery.
create table if not exists testimonial_band (
  id                int primary key default 1,
  eyebrow           text not null default 'Client stories',
  heading           text not null default 'Don''t just take our word for it.',
  subhead           text not null default
    'See what creators and businesses around the world say about working with us.',
  -- The line set in script beside the quote. One studio line rather than one
  -- per client: it is the studio talking, not the client, and a per-client
  -- field would sit empty for whoever had not been given one.
  script_line       text not null default 'From raw footage to real results.',
  stat_one_value    text not null default '100+',
  stat_one_label    text not null default 'Happy Clients',
  stat_two_value    text not null default '1B+',
  stat_two_label    text not null default 'Views Generated',
  stat_three_value  text not null default '50+',
  stat_three_label  text not null default 'Countries Served',
  logos_label       text not null default 'Trusted by creators and brands worldwide',
  logos_more        text not null default 'and many more…',
  constraint testimonial_band_singleton check (id = 1)
);

insert into testimonial_band (id) values (1) on conflict (id) do nothing;

-- ── the logo strip ─────────────────────────────────────────────────────────
-- Its own list rather than a column on `trusted_by`: that list feeds the hero
-- bar, which wants every client name it can get, while this strip wants the
-- handful whose marks are worth setting. Sharing one table would have made
-- trimming this strip trim the hero too.
create table if not exists client_logos (
  id         uuid primary key default gen_random_uuid(),
  name       text not null default '',
  logo_url   text,
  href       text,
  sort_order int not null default 0
);

-- ── access ─────────────────────────────────────────────────────────────────
-- Public read, admin write, matching every other table on this site. If your
-- existing policies are named differently, these are additive and harmless —
-- Postgres allows several permissive policies on one table.
alter table testimonial_band enable row level security;
alter table client_logos enable row level security;

drop policy if exists testimonial_band_read on testimonial_band;
create policy testimonial_band_read on testimonial_band
  for select using (true);

drop policy if exists testimonial_band_write on testimonial_band;
create policy testimonial_band_write on testimonial_band
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists client_logos_read on client_logos;
create policy client_logos_read on client_logos
  for select using (true);

drop policy if exists client_logos_write on client_logos;
create policy client_logos_write on client_logos
  for all using (public.is_admin()) with check (public.is_admin());
