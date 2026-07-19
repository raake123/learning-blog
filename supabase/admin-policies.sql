-- ===========================================================================
-- admin-policies.sql  →  lets a LOGGED-IN author write posts.
-- Run once in Supabase: SQL Editor → New query → paste → Run.
--
-- Reading stays public (from schema.sql). These add write access, but ONLY
-- for the "authenticated" role — i.e. someone who is signed in. Anonymous
-- visitors still cannot create, edit, or delete anything.
-- ===========================================================================

drop policy if exists "Authenticated can insert" on posts;
create policy "Authenticated can insert" on posts
  for insert to authenticated with check (true);

drop policy if exists "Authenticated can update" on posts;
create policy "Authenticated can update" on posts
  for update to authenticated using (true) with check (true);

drop policy if exists "Authenticated can delete" on posts;
create policy "Authenticated can delete" on posts
  for delete to authenticated using (true);
