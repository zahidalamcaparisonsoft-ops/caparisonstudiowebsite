-- The free trial: where applications land, and the wording around the form.
--
-- This is the first submission pipeline on the site. The brief form at
-- /api/brief validates its payload and then console.logs it -- there is no
-- table behind it and never has been, so there was no existing pattern to
-- follow here. Worth pointing that form at a table of its own later.

-- ── applications ───────────────────────────────────────────────────────────
create table if not exists trial_applications (
  id           uuid primary key default gen_random_uuid(),
  name         text not null default '',
  email        text not null default '',
  brand        text not null default '',
  footage_url  text not null default '',
  message      text not null default '',
  status       text not null default 'new',
  created_at   timestamptz not null default now(),
  constraint trial_applications_status
    check (status in ('new', 'contacted', 'done'))
);

-- The panel lists newest first and counts the unread, so both reads are
-- indexed rather than scanning the table as it grows.
create index if not exists trial_applications_created_idx
  on trial_applications (created_at desc);
create index if not exists trial_applications_status_idx
  on trial_applications (status);

-- ── access ─────────────────────────────────────────────────────────────────
-- Admin only, for everything -- including select.
--
-- This table holds names, email addresses and whatever a stranger typed into
-- a public form, so a public read policy would publish the lot: the anon key
-- ships in the browser bundle, and anyone who opened devtools could read every
-- application ever submitted. There is no policy for anonymous insert either.
-- Submissions arrive through /api/trial, which validates, checks the honeypot
-- and rate-limits before writing with the service role -- and the service role
-- bypasses RLS, so the API route is the only way in. A public insert policy
-- would let a bot write straight to the table and skip all three.
alter table trial_applications enable row level security;

drop policy if exists trial_applications_admin on trial_applications;
create policy trial_applications_admin on trial_applications
  for all using (public.is_admin()) with check (public.is_admin());

-- ── the section's wording ──────────────────────────────────────────────────
-- A singleton at id = 1, the same shape hero, onboarding, testimonial_band and
-- client_band use, so the existing SingletonEditor drives it with no new
-- machinery.
create table if not exists trial_band (
  id                int primary key default 1,
  eyebrow           text not null default 'Free trial',
  heading           text not null default 'Book a free trial.',
  -- The words inside the heading set in green. Held apart rather than marked
  -- up inside the heading so the heading stays one plain sentence to write.
  -- A heading that no longer contains them is drawn plainly.
  heading_accent    text not null default 'free trial.',
  subhead           text not null default
    'Apply for a free 1-minute trial edit and see how we approach your content before you commit.',

  -- The three points under the sub-heading. The icon on each is fixed by
  -- position, so the wording can change without anyone choosing a picture.
  point_one         text not null default '1-minute sample edit',
  point_two         text not null default 'No commitment',
  point_three       text not null default 'Fast turnaround',

  step_one_title    text not null default 'Submit footage',
  step_one_body     text not null default 'Send us your raw clips (or a link).',
  step_two_title    text not null default 'We cut a sample',
  step_two_body     text not null default 'Our team edits a 1-minute sample.',
  step_three_title  text not null default 'Review the result',
  step_three_body   text not null default 'See our quality and style, no strings attached.',

  -- The two handwritten notes. Blank either one to drop it.
  note_top          text not null default 'Let''s create something great.',
  note_bottom       text not null default 'Same team. Same quality. Just a smaller project.',

  form_title        text not null default 'Apply for your free trial',
  form_subhead      text not null default
    'Tell us a bit about your project and we''ll be in touch shortly.',
  button_label      text not null default 'Apply for free trial',
  form_note         text not null default 'Limited trial slots each month.',

  constraint trial_band_singleton check (id = 1)
);

insert into trial_band (id) values (1) on conflict (id) do nothing;

alter table trial_band enable row level security;

drop policy if exists trial_band_read on trial_band;
create policy trial_band_read on trial_band
  for select using (true);

drop policy if exists trial_band_write on trial_band;
create policy trial_band_write on trial_band
  for all using (public.is_admin()) with check (public.is_admin());
