-- The brief stops assuming everything is a video.
--
-- 0010 published four services, and one of them — motion graphics — is priced
-- per minute of animation rather than per finished piece. The brief flow had
-- "video" written into it in five places: the rate on each card, the volume
-- question, the estimate, the line above the extras and the stored quote. A
-- visitor who read "$150 / minute" on a card and was then quoted "$150 /
-- video" two screens later has learned that neither number means anything.
--
-- So a project type says what it is counted in, and everything downstream
-- reads it. The arithmetic does not change — it was always rate × quantity —
-- only the word next to the quantity.

-- ── project_types.unit ─────────────────────────────────────────────────────
-- Singular and lower case: the brief pluralises it where it needs to ("4
-- minutes / month") and cannot un-pluralise one that arrives with an s.
--
-- Defaulted rather than left null because every row that exists before this
-- runs is a per-video rate, which is what three of the four still are.
alter table project_types
  add column if not exists unit text not null default 'video';

-- ── the cards in question one ──────────────────────────────────────────────
-- Matched to the published card, deliberately. These two lists are the same
-- claim made twice — a rate card and the form that quotes against it — and
-- the moment they disagree the form is the one a visitor believes, because it
-- is the one that put a number next to their own project.
--
-- Keyed on `slug`, so re-running this corrects the rows rather than doubling
-- them. The four that were here before (yt, pod, saas, doc) priced different
-- work and are removed rather than renamed: a brief stored against one keeps
-- its own copy of the label and the estimate, so nothing already sent loses
-- what it said.
create unique index if not exists project_types_slug_key on project_types (slug);

insert into project_types (slug, name, description, per_video_cost, unit, first_cut_days, sort_order)
values
  ('faceless',     'Faceless Videos',          'YouTube • Documentary • Automation',          120, 'video',  3, 0),
  ('talking-head', 'Talking Head Videos',      'Educational • Coaching • Brand Content',      150, 'video',  3, 1),
  ('motion',       'Advanced Motion Graphics', 'Explainer • Brand Films • Custom Animation',  150, 'minute', 7, 2),
  ('reels',        'Social Media Reels',       'Instagram • TikTok • YouTube Shorts',          50, 'reel',   2, 3)
on conflict (slug) do update set
  name           = excluded.name,
  description    = excluded.description,
  per_video_cost = excluded.per_video_cost,
  unit           = excluded.unit,
  first_cut_days = excluded.first_cut_days,
  sort_order     = excluded.sort_order;

delete from project_types
 where slug in ('yt', 'pod', 'saas', 'doc');

-- ── brief_submissions.quote_unit ───────────────────────────────────────────
-- The unit is stored with the figures for the same reason 0008 stores all
-- five parts of the estimate rather than recomputing it: the number someone
-- was shown is the number they will expect to hear back, and a project type
-- can be renamed or deleted in the panel long before anyone answers the
-- brief. Read back later from the type, "$150" would say per video for a
-- quote that was per minute.
--
-- Defaulted to 'video' because every brief already in the table was.
alter table brief_submissions
  add column if not exists quote_unit text not null default 'video';
