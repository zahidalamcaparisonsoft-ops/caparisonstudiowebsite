-- One round trip for the whole admin overview instead of twelve count queries
-- plus a separate membership check. `security definer` so the counts are read
-- with the function owner's rights; the admin flag still reflects the caller.
create or replace function admin_overview()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'is_admin',      public.is_admin(),
    'hero',          (select count(*) from hero),
    'videos',        (select count(*) from videos),
    'video_clips',   (select count(*) from video_clips),
    'testimonials',  (select count(*) from testimonials),
    'categories',    (select count(*) from categories),
    'tags',          (select count(*) from tags),
    'team_members',  (select count(*) from team_members),
    'process_steps', (select count(*) from process_steps),
    'project_types', (select count(*) from project_types),
    'pricing_tiers', (select count(*) from pricing_tiers),
    'faqs',          (select count(*) from faqs),
    'trusted_by',    (select count(*) from trusted_by)
  );
$$;

revoke all on function admin_overview() from public;
grant execute on function admin_overview() to authenticated;
