-- Add avatar_url column to users table
alter table public.users
  add column if not exists avatar_url text;

-- Create avatars storage bucket (run in Supabase SQL editor)
-- NOTE: bucket creation via SQL requires the storage schema.
-- If the bucket doesn't exist yet, create it via Supabase Dashboard:
--   Storage → New Bucket → name: "avatars" → Public: ON
-- Or run the following:
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload their own avatars
drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Avatar images are publicly viewable" on storage.objects;
create policy "Avatar images are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'avatars');
