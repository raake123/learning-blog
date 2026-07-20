-- ===========================================================================
-- multi-author.sql  →  turn the single-author blog into a multi-author one.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to run more than once.
--
-- What it does:
--   1. Gives every post an owner (user_id).
--   2. Assigns the existing posts to the first account (Raakesh).
--   3. Replaces the "any signed-in user can edit anything" rules with
--      ownership rules: you may only edit or delete YOUR OWN posts.
--   Reading stays public (unchanged).
-- ===========================================================================

-- 1. Add an owner column. It defaults to the id of whoever is inserting the row
--    (auth.uid()), so new posts are automatically owned by their creator.
alter table posts
  add column if not exists user_id uuid references auth.users(id) default auth.uid();

-- 2. Back-fill: the 3 starter posts have no owner yet. Give them to the
--    earliest-created account (that's Raakesh, the first/only user so far).
update posts
  set user_id = (select id from auth.users order by created_at asc limit 1)
  where user_id is null;

-- 3. Swap the old permissive write policies for ownership-scoped ones.
drop policy if exists "Authenticated can insert" on posts;
drop policy if exists "Authenticated can update" on posts;
drop policy if exists "Authenticated can delete" on posts;

-- You can create a post only as yourself (can't forge someone else's user_id).
drop policy if exists "Users insert own posts" on posts;
create policy "Users insert own posts" on posts
  for insert to authenticated
  with check (user_id = auth.uid());

-- You can update only your own posts.
drop policy if exists "Users update own posts" on posts;
create policy "Users update own posts" on posts
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- You can delete only your own posts.
drop policy if exists "Users delete own posts" on posts;
create policy "Users delete own posts" on posts
  for delete to authenticated
  using (user_id = auth.uid());

-- (The public "Public can read posts" SELECT policy from schema.sql stays as-is.)
