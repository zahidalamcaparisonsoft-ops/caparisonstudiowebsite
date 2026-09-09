-- Client stories: the two notes written on the picture, and the end of the
-- studio-wide figures.
--
-- The section already carried one handwritten line, `script_line`, set beside
-- the client's name with an arrow pointing back at the film. The rebuilt
-- section writes a second line *on* the picture, and it is not the same line
-- in both arrangements: a landscape film is the studio's own showreel cut and
-- takes "Great team to work with!", a vertical one is a client's reel and
-- takes "Real people. Real results.". One field could not say both, and
-- hard-coding them would put copy in a component nobody editing this site can
-- reach.
alter table testimonial_band
  add column if not exists note_wide text not null default 'Great team to work with!';
alter table testimonial_band
  add column if not exists note_reel text not null default 'Real people. Real results.';

-- ── the green tail of the heading ──────────────────────────────────────────
-- "Don't just take our word for it." is set with its last four words in green.
-- Kept as its own field rather than as markup inside `heading`, so the heading
-- stays one plain sentence to write. The section colours the tail only where
-- the heading actually ends with it, so rewriting one and forgetting the other
-- renders the heading plainly rather than splitting it in the wrong place.
alter table testimonial_band
  add column if not exists heading_accent text not null default 'our word for it.';

-- ── the studio-wide figures are gone ───────────────────────────────────────
-- "100+ Happy Clients / 1B+ Views Generated / 50+ Countries Served" sat above
-- the testimonials and is no longer drawn in either arrangement. The six
-- columns behind it are left in place rather than dropped, for the reason
-- 0004 gives about `video_ref`: a column costs nothing, and dropping one is
-- the single migration that cannot be undone by re-running the next. They are
-- no longer read by `getTestimonialBand` and no longer offered in the panel.
--
--   stat_one_value    stat_one_label
--   stat_two_value    stat_two_label
--   stat_three_value  stat_three_label
--
-- If you are certain, they can be dropped by hand later.
