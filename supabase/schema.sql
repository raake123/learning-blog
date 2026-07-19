-- ===========================================================================
-- schema.sql  →  sets up the "posts" table and loads our starter posts.
-- Run this once in Supabase:  Dashboard → SQL Editor → New query → paste → Run.
-- It is safe to run more than once (it won't create duplicates).
-- ===========================================================================

-- 1. Create the table. Each column is one piece of a post.
--    "id" is an automatic number; "slug" must be unique (it's used in URLs).
create table if not exists posts (
  id       bigint generated always as identity primary key,
  slug     text unique not null,
  title    text not null,
  category text,
  author   text,
  cover    text,
  date     date not null,
  excerpt  text,
  content  text not null
);

-- 2. Turn on Row Level Security. This LOCKS the table by default —
--    nobody can read or write until we explicitly allow it. Safe by default.
alter table posts enable row level security;

-- 3. Allow ANYONE to READ posts (a public blog), but not to change them.
--    Writing will be handled later, from the private admin area.
drop policy if exists "Public can read posts" on posts;
create policy "Public can read posts"
  on posts for select
  to anon, authenticated
  using (true);

-- 4. Load our three starter posts.
--    The $$ ... $$ marks are just an easy way to write text that itself
--    contains apostrophes and quotes without fighting the syntax.
insert into posts (slug, title, category, author, cover, date, excerpt, content) values
(
  'hello-world',
  'Hello, world — my first post',
  'Personal', 'Raakesh', '/covers/hello-world.svg', '2026-07-19',
  $$Every blog starts somewhere. This is the very first post on this brand-new site, written while learning how the web actually works.$$,
  $$Welcome to my blog! This is the first thing I've ever published to the internet.

Right now this post isn't coming from a database — it's typed straight into a file. That's on purpose: it lets me learn how pages and links work before adding the more advanced stuff.

Soon this exact page will pull real posts from a real database, and I'll be able to write new ones from a private dashboard. But the page you're reading won't have to change much at all.$$
),
(
  'why-i-am-learning-to-code',
  'Why I''m learning to code',
  'Reflections', 'Raakesh', '/covers/why-i-am-learning-to-code.svg', '2026-07-18',
  $$A short note on why I decided to build things instead of just using them — and what I hope to make.$$,
  $$I've used apps my whole life without ever knowing how they're built. This year I decided to change that.

Building a blog turns out to be the perfect first project. It touches everything: pages you can see, logic that runs behind the scenes, a database that remembers things, and a real website anyone can visit.

The plan is to learn one piece at a time, see each piece working before moving on, and not get overwhelmed. So far, so good.$$
),
(
  'how-the-web-works',
  'How the web works, in one minute',
  'Fundamentals', 'Raakesh', '/covers/how-the-web-works.svg', '2026-07-17',
  $$Frontend, backend, database, hosting — four words that unlock how almost every app is built.$$,
  $$Here's the mental model that made everything click for me.

The frontend is what you see: the pages, text, and buttons in your browser. The backend is the logic running on a server — things like "save this post" or "fetch that one." The database is where information is stored permanently. And hosting is the app's public home on the internet.

Browser → Frontend → Backend → Database, all living on Hosting. Almost every app you've ever used is some version of those four boxes.$$
)
on conflict (slug) do nothing;
