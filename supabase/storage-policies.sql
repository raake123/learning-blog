-- ===========================================================================
-- storage-policies.sql  →  lets a LOGGED-IN author upload cover images.
--
-- First create a PUBLIC bucket named "covers" in the dashboard
-- (Storage → New bucket → name "covers" → turn ON "Public bucket").
-- A public bucket means the images can be viewed by anyone (they're on a
-- public blog). These policies then allow a signed-in author to UPLOAD,
-- replace, and remove images. Anonymous visitors cannot upload.
--
-- Run once: SQL Editor → New query → paste → Run.
-- ===========================================================================

drop policy if exists "Authenticated upload covers" on storage.objects;
create policy "Authenticated upload covers"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'covers');

drop policy if exists "Authenticated update covers" on storage.objects;
create policy "Authenticated update covers"
  on storage.objects for update to authenticated
  using (bucket_id = 'covers');

drop policy if exists "Authenticated delete covers" on storage.objects;
create policy "Authenticated delete covers"
  on storage.objects for delete to authenticated
  using (bucket_id = 'covers');
