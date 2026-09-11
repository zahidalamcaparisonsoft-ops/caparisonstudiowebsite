-- The dashboard counts the tables added since 0002.
--
-- `admin_overview()` was written when there were twelve tables worth counting.
-- Five have arrived since -- the clients rail, the two brief lookups, and both
-- submission inboxes -- and the panel had no number for any of them. It shows
-- nothing rather than a wrong zero where a key is missing, so this is what
-- turns those badges on.
--
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
    -- new since 0002
    'client_logos',       (select count(*) from client_logos),
    'cadences',           (select count(*) from cadences),
    'addons',             (select count(*) from addons),
    'trial_applications', (select count(*) from trial_applications),
    'brief_submissions',  (select count(*) from brief_submissions)
  );
$$;

revoke all on function admin_overview() from public;
grant execute on function admin_overview() to authenticated;
