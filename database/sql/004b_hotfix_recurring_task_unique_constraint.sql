-- ============================================================================
-- Hotfix for 004_phase4_recurring_tasks.sql
-- Run this if you already applied the original 004 migration and are
-- hitting: "there is no unique or exclusion constraint matching the
-- ON CONFLICT specification" when generating recurring tasks.
--
-- Root cause: the original migration created a PARTIAL unique index
-- (WHERE recurring_task_id IS NOT NULL). Postgres only lets ON CONFLICT
-- target a partial index if the predicate is repeated verbatim in the
-- ON CONFLICT clause, and the Supabase JS client's upsert() has no way to
-- pass that predicate through — so every recurring-task generation fails.
--
-- Fix: replace the partial index with a plain unique constraint. NULLs
-- never collide in a unique constraint, so this remains safe for ordinary
-- (non-recurring) tasks, which all have recurring_task_id = NULL.
-- ============================================================================

drop index if exists public.tasks_recurring_task_due_date_unique;

alter table public.tasks
  drop constraint if exists tasks_recurring_task_due_date_unique;

alter table public.tasks
  add constraint tasks_recurring_task_due_date_unique
  unique (recurring_task_id, due_date);
