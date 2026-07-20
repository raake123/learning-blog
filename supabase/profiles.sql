-- ===========================================================================
-- profiles.sql  →  a public profile per author (name, photo, bio).
-- Run once in Supabase: SQL Editor → New query → paste → Run.
--
-- Why: account details live in auth (private). To show an author's photo and
-- name publicly — on bylines and their profile page — we mirror them into a
-- public "profiles" table that anyone can read, but only the owner can write.
-- ===========================================================================

create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  avatar_url text,
  bio        text,
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Public read profiles" on profiles;
create policy "Public read profiles"
  on profiles for select to anon, authenticated using (true);

drop policy if exists "Users insert own profile" on profiles;
create policy "Users insert own profile"
  on profiles for insert to authenticated with check (id = auth.uid());

drop policy if exists "Users update own profile" on profiles;
create policy "Users update own profile"
  on profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
