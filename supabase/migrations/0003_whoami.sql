-- One round trip for "who is this, and may they edit?".
--
-- PostgREST verifies the JWT signature before this runs, so auth.uid() and
-- auth.jwt() are trustworthy here — this is as authoritative as calling the
-- auth server, at half the network cost.
create or replace function whoami()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'uid',      auth.uid(),
    'email',    coalesce(auth.jwt() ->> 'email', ''),
    'is_admin', public.is_admin()
  );
$$;

revoke all on function whoami() from public;
grant execute on function whoami() to authenticated, anon;
