-- The pricing section gets its wording, and a new rate card.
--
-- Two things, because they are one change: the cards stop being tiers of a
-- commitment (Single / Weekly / Studio) and become the four services the
-- studio actually sells, and the wording that has to sit around them has
-- nowhere to live until it has a table.
--
-- Every figure on the new card is a starting rate, which is what the three
-- points underneath are for: what moves the number, what volume earns, and
-- where to go when none of the four fits. Published without those, a starting
-- rate reads as a final one and every brief that follows is a correction.
--
-- A singleton at id = 1, the same shape `hero`, `onboarding`, `client_band`
-- and `trial_band` use, so the existing SingletonEditor drives it with no new
-- machinery.
create table if not exists pricing_band (
  id                int primary key default 1,
  eyebrow           text not null default 'Pricing',
  heading           text not null default
    'High-Quality Video Editing, Built for Your Goals',
  -- The words inside the heading set in green. Held apart rather than marked
  -- up inside the heading so the heading stays one plain sentence to write,
  -- and matched wherever they appear rather than only at the end. A heading
  -- that no longer contains them is drawn plainly, which is the right answer
  -- to rewriting one and not the other.
  heading_accent    text not null default 'Built for Your Goals',
  subhead           text not null default
    'Transparent starting rates with flexible, custom quotes — because every project is unique. Get professional edits that match your vision, budget, and growth plans.',
  -- The caption over every price. The one line on the card that says the
  -- figure under it is a floor and not a total.
  from_label        text not null default 'Starting from',

  note_one_title    text not null default 'Custom Pricing',
  note_one_body     text not null default
    'Every project is different. Final pricing depends on video length, editing complexity, turnaround time, and specific requirements.',
  note_two_title    text not null default 'Volume Discounts',
  note_two_body     text not null default
    'Need 10+ videos per month? Ask about our special rates for long-term partners.',
  note_three_title  text not null default 'Let’s Talk',
  note_three_body   text not null default
    'Have a unique project or not sure which service fits you? We’re happy to discuss and create a custom quote.',

  cta_label         text not null default 'Get a Custom Quote',
  cta_href          text not null default '#onboarding',
  cta_note          text not null default 'Fast response · No obligation',

  constraint pricing_band_singleton check (id = 1)
);

insert into pricing_band (id) values (1) on conflict (id) do nothing;

-- ── access ─────────────────────────────────────────────────────────────────
-- Public read, admin write, matching every other table on this site.
alter table pricing_band enable row level security;

drop policy if exists pricing_band_read on pricing_band;
create policy pricing_band_read on pricing_band
  for select using (true);

drop policy if exists pricing_band_write on pricing_band;
create policy pricing_band_write on pricing_band
  for all using (public.is_admin()) with check (public.is_admin());

-- ── the cards themselves ───────────────────────────────────────────────────
-- A replace, not an edit. The three rows in here priced a commitment and the
-- four below price a service; there is no row in the old set that becomes a
-- row in the new one, so matching them up would only be a way of pretending
-- otherwise.
--
-- NB this discards whatever is in `pricing_tiers` today, including any
-- wording changed in the panel since. It is a short curated list that is
-- meant to be re-read before it is re-run.
--
-- `unit` carries its own slash because it is printed beside the figure rather
-- than under it: three of these are priced per finished piece and one is
-- priced per minute, and "$150" on its own means two different things across
-- this row of four.
delete from pricing_tiers;

insert into pricing_tiers (name, description, price, unit, features, featured, cta_label, sort_order)
values
  (
    'Faceless Videos',
    'YouTube • Documentary • Automation',
    '$120', '/ video',
    '["Professional editing","Stock footage & B-roll","Music & sound effects","Basic motion graphics","Color correction & audio mix","Max duration 10 minutes"]'::jsonb,
    false, 'Get Exact Quote', 0
  ),
  (
    'Talking Head Videos',
    'Educational • Coaching • Brand Content',
    '$150', '/ video',
    '["Professional editing","Jump cuts & pacing","Captions & subtitles","B-roll integration","Motion graphics","Music and sound effects","Color correction & audio enhancement","Max duration 10 minutes"]'::jsonb,
    true, 'Get Exact Quote', 1
  ),
  (
    'Advanced Motion Graphics',
    'Explainer • Brand Films • Custom Animation',
    '$150', '/ minute',
    '["Custom motion design","Typography & visual effects","Smooth transitions","Brand-aligned visuals","High-quality output (up to 4K)","Music and sound effects"]'::jsonb,
    false, 'Get Exact Quote', 2
  ),
  (
    'Social Media Reels',
    'Instagram • TikTok • YouTube Shorts',
    '$50', '/ reel',
    '["Engaging, fast-paced edits","Captions & trendy text styles","Music & sound effects","Platform-optimized (9:16, 1:1, etc.)","Quick turnaround"]'::jsonb,
    false, 'Get Exact Quote', 3
  );
