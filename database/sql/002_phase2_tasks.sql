-- ============================================================================
-- Phase 2: tasks and quick_tasks tables, with RLS
-- Run this in the Supabase SQL editor for your project, after 001_phase1_users.sql.
-- ============================================================================

-- 1. Enums
-- status is app-managed: 'overdue' is recalculated by the backend on read/
-- write (see backend/src/services/task.service.ts) rather than a Postgres
-- generated column, since "overdue" depends on the current date, not just
-- row data, and we want it to stay a normal indexable column.
create type public.task_status as enum ('todo', 'pending', 'completed', 'overdue');
create type public.task_priority as enum ('none', 'low', 'medium', 'high');

-- 2. tasks
-- Daily/weekly/monthly are views over this single table, grouped by
-- due_date — there is no separate task_type column by design.
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  description text,
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'none',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_user_due_date_idx on public.tasks (user_id, due_date);

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();

alter table public.tasks enable row level security;

drop policy if exists "Users can view own tasks" on public.tasks;
create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own tasks" on public.tasks;
create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own tasks" on public.tasks;
create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own tasks" on public.tasks;
create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- 3. quick_tasks
-- Lightweight inbox: no due_date, status, or priority — just a title and
-- a completed flag. No conversion-to-task logic in Phase 2.
create table if not exists public.quick_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists quick_tasks_user_id_idx on public.quick_tasks (user_id);

alter table public.quick_tasks enable row level security;

drop policy if exists "Users can view own quick tasks" on public.quick_tasks;
create policy "Users can view own quick tasks"
  on public.quick_tasks for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own quick tasks" on public.quick_tasks;
create policy "Users can insert own quick tasks"
  on public.quick_tasks for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own quick tasks" on public.quick_tasks;
create policy "Users can update own quick tasks"
  on public.quick_tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own quick tasks" on public.quick_tasks;
create policy "Users can delete own quick tasks"
  on public.quick_tasks for delete
  using (auth.uid() = user_id);
