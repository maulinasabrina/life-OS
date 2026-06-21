-- ============================================================================
-- Phase 1: users table, auth sync trigger, and Row Level Security
-- Run this in the Supabase SQL editor for your project.
-- ============================================================================

-- 1. Profile table
-- Mirrors auth.users but holds app-level profile fields. id is shared
-- 1:1 with auth.users.id (not a separate identity).
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Keep updated_at current on every row update
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
  before update on public.users
  for each row
  execute function public.set_updated_at();

-- 3. Auto-create a public.users row whenever a new auth.users row appears
-- (covers both email/password signup and Google OAuth signup).
-- full_name/avatar_url are pulled from raw_user_meta_data when the
-- provider supplies them (Google does; email/password signup does not).
-- avatar_url falls back to Google's 'picture' key, since some OAuth
-- responses use that name instead of 'avatar_url'.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

-- 4. Row Level Security
-- Users may only read/update their own profile row. No insert/delete
-- policy is defined for regular users: rows are created exclusively by
-- the trigger above (security definer) and deleted via the cascade from
-- auth.users, so direct client inserts/deletes are intentionally blocked.
alter table public.users enable row level security;

drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"
  on public.users
  for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
