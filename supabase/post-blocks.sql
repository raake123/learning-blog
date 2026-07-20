-- ===========================================================================
-- post-blocks.sql  →  let posts be built from sections (blocks).
-- Run once in Supabase: SQL Editor → New query → paste → Run.
--
-- Adds one JSON column that stores the list of sections (heading, text, quote,
-- list, code, image, divider). Old posts keep working via their plain `content`.
-- ===========================================================================

alter table posts
  add column if not exists blocks jsonb;
