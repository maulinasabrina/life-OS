-- ============================================================================
-- Phase 3: habits and habit_logs tables, with RLS
-- Run this in the Supabase SQL editor for your project, after 002_phase2_tasks.sql.
-- ============================================================================

-- 1. Enum
create type public.habit_frequency as enum ('daily', 'weekly');

-- 2. habits
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  frequency public.habit_frequency not null default 'daily',
  created_at timestamptz not null default now()
);

create index if not exists habits_user_id_idx on public.habits (user_id);

alter table public.habits enable row level security;

drop policy if exists "Users can view own habits" on public.habits;
create policy "Users can view own habits"
  on public.habits for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own habits" on public.habits;
create policy "Users can insert own habits"
  on public.habits for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own habits" on public.habits;
create policy "Users can update own habits"
  on public.habits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own habits" on public.habits;
create policy "Users can delete own habits"
  on public.habits for delete
  using (auth.uid() = user_id);

-- 3. habit_logs
-- One row per habit per day, toggled on/off. completed_date is the calendar
-- day being logged (not a timestamp), so a habit can have at most one log
-- per day — enforced by the unique constraint below.
create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  completed_date date not null,
  completed boolean not null default true,
  unique (habit_id, completed_date)
);

create index if not exists habit_logs_habit_id_idx on public.habit_logs (habit_id);
create index if not exists habit_logs_habit_date_idx on public.habit_logs (habit_id, completed_date);

-- RLS on habit_logs has no user_id column to check directly, so policies
-- join back to habits to confirm ownership.
alter table public.habit_logs enable row level security;

drop policy if exists "Users can view own habit logs" on public.habit_logs;
create policy "Users can view own habit logs"
  on public.habit_logs for select
  using (
    exists (
      select 1 from public.habits
      where habits.id = habit_logs.habit_id
      and habits.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own habit logs" on public.habit_logs;
create policy "Users can insert own habit logs"
  on public.habit_logs for insert
  with check (
    exists (
      select 1 from public.habits
      where habits.id = habit_logs.habit_id
      and habits.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update own habit logs" on public.habit_logs;
create policy "Users can update own habit logs"
  on public.habit_logs for update
  using (
    exists (
      select 1 from public.habits
      where habits.id = habit_logs.habit_id
      and habits.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.habits
      where habits.id = habit_logs.habit_id
      and habits.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete own habit logs" on public.habit_logs;
create policy "Users can delete own habit logs"
  on public.habit_logs for delete
  using (
    exists (
      select 1 from public.habits
      where habits.id = habit_logs.habit_id
      and habits.user_id = auth.uid()
    )
  );
