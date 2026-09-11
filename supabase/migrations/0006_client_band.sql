-- The clients section gets its own wording and its own figures.
--
-- It used to be a strip at the foot of the client stories, borrowing two
-- fields from `testimonial_band` — a label and an "and many more" line. It is
-- a section now, with an eyebrow, a heading, a line under it and four studio
-- figures, and none of that belongs to the testimonial band any more than the
-- testimonials belong to it.
--
-- A singleton at id = 1, the same shape `hero`, `onboarding` and
-- `testimonial_band` use, so the existing SingletonEditor drives it with no
-- new machinery.
create table if not exists client_band (
  id                int primary key default 1,
  eyebrow           text not null default 'Our clients',
  heading           text not null default 'Trusted by creators and brands worldwide.',
  -- The words inside the heading set in green. Held apart rather than marked
  -- up inside the heading so the heading stays one plain sentence to write.
  -- Matched wherever they appear rather than only at the end — in this line
  -- they sit in the middle. A heading that no longer contains them is drawn
  -- plainly, which is the right answer to rewriting one and not the other.
  heading_accent    text not null default 'creators and brands',
  subhead           text not null default
    'From solo creators to global brands — we help them turn ideas into videos that perform.',
  stat_one_value    text not null default '100+',
  stat_one_label    text not null default 'Happy clients',
  stat_two_value    text not null default '50+',
  stat_two_label    text not null default 'Countries',
  stat_three_value  text not null default '500M+',
  stat_three_label  text not null default 'Views generated',
  stat_four_value   text not null default '8+ Years',
  stat_four_label   text not null default 'Growing together',
  constraint client_band_singleton check (id = 1)
);

insert into client_band (id) values (1) on conflict (id) do nothing;

-- ── access ─────────────────────────────────────────────────────────────────
-- Public read, admin write, matching every other table on this site.
alter table client_band enable row level security;

drop policy if exists client_band_read on client_band;
create policy client_band_read on client_band
  for select using (true);

drop policy if exists client_band_write on client_band;
create policy client_band_write on client_band
  for all using (public.is_admin()) with check (public.is_admin());

-- ── the two fields it leaves behind ────────────────────────────────────────
-- `testimonial_band.logos_label` and `logos_more` are no longer read: the
-- label became this section's heading and the "and many more" line went with
-- the strip it belonged to. The columns are left in place for the reason 0004
-- gives about `video_ref` — a column costs nothing, and dropping one is the
-- single migration that cannot be undone by re-running the next.
