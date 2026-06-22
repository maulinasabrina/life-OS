-- ============================================================================
-- Phase 4: recurring_tasks table, link column on tasks, RLS
-- Run this in the Supabase SQL editor for your project, after 003_phase3_habits.sql.
-- ============================================================================

-- 1. Enum
create type public.recurrence_type as enum ('daily', 'weekly', 'monthly');

-- 2. recurring_tasks
-- A template the recurrence engine reads to decide when to generate a real
-- row in public.tasks. recurrence_interval is a multiplier on recurrence_type
-- (e.g. type='daily', interval=3 -> every 3 days; type='weekly', interval=2
-- -> every 2 weeks).
create table if not exists public.recurring_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  recurrence_type public.recurrence_type not null,
  recurrence_interval integer not null default 1 check (recurrence_interval > 0),
  start_date date not null,
  active boolean not null default true,
  -- Tracks the due_date of the most recently generated occurrence, so the
  -- engine can compute "next due date" without rescanning all of tasks.
  last_generated_date date
);

create index if not exists recurring_tasks_user_id_idx on public.recurring_tasks (user_id);

alter table public.recurring_tasks enable row level security;

drop policy if exists "Users can view own recurring tasks" on public.recurring_tasks;
create policy "Users can view own recurring tasks"
  on public.recurring_tasks for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own recurring tasks" on public.recurring_tasks;
create policy "Users can insert own recurring tasks"
  on public.recurring_tasks for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own recurring tasks" on public.recurring_tasks;
create policy "Users can update own recurring tasks"
  on public.recurring_tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own recurring tasks" on public.recurring_tasks;
create policy "Users can delete own recurring tasks"
  on public.recurring_tasks for delete
  using (auth.uid() = user_id);

-- 3. Link generated tasks back to their template.
-- Nullable: most tasks (Phase 2) are still standalone, one-off tasks.
-- ON DELETE SET NULL so deleting a recurring template doesn't cascade-delete
-- tasks the user already has on their list.
alter table public.tasks
  add column if not exists recurring_task_id uuid references public.recurring_tasks (id) on delete set null;

create index if not exists tasks_recurring_task_id_idx on public.tasks (recurring_task_id);

-- Prevents the engine from ever generating two tasks for the same template
-- on the same due_date, even under concurrent on-demand triggers.
--
-- This must be a plain (non-partial) unique constraint, not a partial index
-- with a WHERE clause: PostgREST/Supabase's upsert(..., { onConflict }) has
-- no way to pass the partial index's predicate through to ON CONFLICT, and
-- Postgres requires the conflict target to exactly match an index's
-- predicate (or have none). A plain unique constraint is also safe here for
-- standalone (non-recurring) tasks: Postgres unique constraints never treat
-- NULL as equal to NULL, so any number of tasks with recurring_task_id NULL
-- can coexist regardless of due_date.
alter table public.tasks
  drop constraint if exists tasks_recurring_task_due_date_unique;
drop index if exists tasks_recurring_task_due_date_unique;

alter table public.tasks
  add constraint tasks_recurring_task_due_date_unique
  unique (recurring_task_id, due_date);
