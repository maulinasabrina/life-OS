-- ============================================================================
-- Phase 5: journal_entries, journal_images, full-text search, Storage bucket
-- Run this in the Supabase SQL editor after 004_phase4_recurring_tasks.sql
-- ============================================================================

-- 1. journal_entries
-- tags is stored as text[] (Postgres array) — the UI exposes it as a
-- comma-separated input but the DB keeps each tag as a distinct element,
-- which makes tag filtering cheaper and avoids string-splitting at query time.
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  content text not null default '',
  entry_date date not null default current_date,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists journal_entries_user_id_idx
  on public.journal_entries (user_id);

create index if not exists journal_entries_user_date_idx
  on public.journal_entries (user_id, entry_date desc);

-- Full-text search: generated tsvector column over title + content.
-- 'english' stemming; weight A (title) > B (content) so title matches rank higher.
alter table public.journal_entries
  add column if not exists search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B')
  ) stored;

create index if not exists journal_entries_search_idx
  on public.journal_entries using gin (search_vector);

drop trigger if exists set_journal_entries_updated_at on public.journal_entries;
create trigger set_journal_entries_updated_at
  before update on public.journal_entries
  for each row
  execute function public.set_updated_at();

alter table public.journal_entries enable row level security;

drop policy if exists "Users can view own journal entries" on public.journal_entries;
create policy "Users can view own journal entries"
  on public.journal_entries for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own journal entries" on public.journal_entries;
create policy "Users can insert own journal entries"
  on public.journal_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own journal entries" on public.journal_entries;
create policy "Users can update own journal entries"
  on public.journal_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own journal entries" on public.journal_entries;
create policy "Users can delete own journal entries"
  on public.journal_entries for delete
  using (auth.uid() = user_id);

-- 2. journal_images
-- image_url is the public/signed URL from Supabase Storage.
-- storage_path is the path within the bucket (user_id/entry_id/filename),
-- kept so the backend can delete the actual object when an image row is removed.
create table if not exists public.journal_images (
  id uuid primary key default gen_random_uuid(),
  journal_entry_id uuid not null references public.journal_entries (id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists journal_images_entry_id_idx
  on public.journal_images (journal_entry_id);

alter table public.journal_images enable row level security;

drop policy if exists "Users can view own journal images" on public.journal_images;
create policy "Users can view own journal images"
  on public.journal_images for select
  using (
    exists (
      select 1 from public.journal_entries
      where journal_entries.id = journal_images.journal_entry_id
      and journal_entries.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own journal images" on public.journal_images;
create policy "Users can insert own journal images"
  on public.journal_images for insert
  with check (
    exists (
      select 1 from public.journal_entries
      where journal_entries.id = journal_images.journal_entry_id
      and journal_entries.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete own journal images" on public.journal_images;
create policy "Users can delete own journal images"
  on public.journal_images for delete
  using (
    exists (
      select 1 from public.journal_entries
      where journal_entries.id = journal_images.journal_entry_id
      and journal_entries.user_id = auth.uid()
    )
  );

-- 3. Storage bucket for journal images
-- Run this block to create the bucket and its RLS policies.
-- The bucket is private; the backend generates signed URLs on read.
insert into storage.buckets (id, name, public)
values ('journal-images', 'journal-images', false)
on conflict (id) do nothing;

-- Allow authenticated users to upload to their own folder (user_id/*)
drop policy if exists "Users can upload own journal images" on storage.objects;
create policy "Users can upload own journal images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'journal-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to read their own images
drop policy if exists "Users can read own journal images" on storage.objects;
create policy "Users can read own journal images"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'journal-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own images
drop policy if exists "Users can delete own journal images" on storage.objects;
create policy "Users can delete own journal images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'journal-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
