-- ============================================================
-- Fitness OS Private File Storage
-- ============================================================

-- Create the private bucket used for DEXA reports and
-- progress photos.
insert into storage.buckets (
  id,
  name,
  public
)
values (
  'fitness-os-private',
  'fitness-os-private',
  false
)
on conflict (id) do nothing;


-- ============================================================
-- Storage Policies
-- ============================================================
--
-- Object paths are required to begin with the authenticated
-- user's UUID:
--
-- <user-id>/dexa/...
-- <user-id>/progress-photos/...
--
-- This keeps every file scoped to its owner.
-- ============================================================


-- ------------------------------------------------------------
-- Read
-- ------------------------------------------------------------

create policy "Fitness OS private files read own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'fitness-os-private'
  and (storage.foldername(name))[1] = auth.uid()::text
);


-- ------------------------------------------------------------
-- Insert
-- ------------------------------------------------------------

create policy "Fitness OS private files insert own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'fitness-os-private'
  and (storage.foldername(name))[1] = auth.uid()::text
);


-- ------------------------------------------------------------
-- Update
-- ------------------------------------------------------------

create policy "Fitness OS private files update own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'fitness-os-private'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'fitness-os-private'
  and (storage.foldername(name))[1] = auth.uid()::text
);


-- ------------------------------------------------------------
-- Delete
-- ------------------------------------------------------------

create policy "Fitness OS private files delete own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'fitness-os-private'
  and (storage.foldername(name))[1] = auth.uid()::text
);