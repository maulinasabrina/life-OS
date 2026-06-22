import { supabaseAdmin } from '../configs/supabaseAdmin';
import type {
  CreateRecurringTaskInput,
  RecurringTask,
  UpdateRecurringTaskInput,
} from '../types/recurringTask';

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function todayDateString(): string {
  return toDateString(new Date());
}

function addInterval(date: Date, type: RecurringTask['recurrence_type'], interval: number): Date {
  const next = new Date(date);
  if (type === 'daily') {
    next.setUTCDate(next.getUTCDate() + interval);
  } else if (type === 'weekly') {
    next.setUTCDate(next.getUTCDate() + interval * 7);
  } else {
    next.setUTCMonth(next.getUTCMonth() + interval);
  }
  return next;
}

/**
 * Computes every occurrence date that is due (<= today) for a template,
 * starting from the day after its last generated occurrence (or its
 * start_date if nothing has been generated yet).
 *
 * Capped at 60 occurrences per call as a safety bound — a template that's
 * been inactive/unvisited for years won't try to backfill thousands of
 * tasks in one request. Remaining occurrences get caught on the next call.
 */
function computeDueOccurrences(template: RecurringTask): string[] {
  const today = todayDateString();
  const occurrences: string[] = [];

  let cursor = template.last_generated_date
    ? addInterval(
        new Date(`${template.last_generated_date}T00:00:00Z`),
        template.recurrence_type,
        template.recurrence_interval
      )
    : new Date(`${template.start_date}T00:00:00Z`);

  const MAX_OCCURRENCES = 60;
  while (toDateString(cursor) <= today && occurrences.length < MAX_OCCURRENCES) {
    occurrences.push(toDateString(cursor));
    cursor = addInterval(cursor, template.recurrence_type, template.recurrence_interval);
  }

  return occurrences;
}

/**
 * Runs the recurrence engine for a single user: for every active template,
 * generates any task occurrences that are now due and haven't been created
 * yet, then advances last_generated_date. Safe to call on every page load —
 * it's a no-op (besides one cheap SELECT) when nothing is due.
 *
 * The unique index on tasks(recurring_task_id, due_date) backstops this
 * against double-generation if this ever runs concurrently for the same user.
 */
export async function runRecurrenceEngine(userId: string): Promise<void> {
  const { data: templates, error } = await supabaseAdmin
    .from('recurring_tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true);

  if (error) {
    throw new Error(`Failed to load recurring task templates: ${error.message}`);
  }
  if (!templates || templates.length === 0) return;

  for (const template of templates as RecurringTask[]) {
    const dueDates = computeDueOccurrences(template);
    if (dueDates.length === 0) continue;

    const rows = dueDates.map((due_date) => ({
      user_id: userId,
      title: template.title,
      status: 'todo' as const,
      priority: 'none' as const,
      due_date,
      recurring_task_id: template.id,
    }));

    // ignoreDuplicates relies on the unique constraint on
    // (recurring_task_id, due_date) — if a task for this template/date
    // already exists (e.g. from a concurrent request), this silently skips
    // it instead of erroring.
    const { error: insertError } = await supabaseAdmin
      .from('tasks')
      .upsert(rows, { onConflict: 'recurring_task_id,due_date', ignoreDuplicates: true });

    if (insertError) {
      throw new Error(
        `Failed to generate tasks for recurring template "${template.title}": ${insertError.message}`
      );
    }

    const lastDue = dueDates[dueDates.length - 1];
    const { error: updateError } = await supabaseAdmin
      .from('recurring_tasks')
      .update({ last_generated_date: lastDue })
      .eq('id', template.id);

    if (updateError) {
      throw new Error(`Failed to update recurring template progress: ${updateError.message}`);
    }
  }
}

export async function listRecurringTasks(userId: string): Promise<RecurringTask[]> {
  const { data, error } = await supabaseAdmin
    .from('recurring_tasks')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false });

  if (error) {
    throw new Error(`Failed to list recurring tasks: ${error.message}`);
  }

  return data ?? [];
}

export async function createRecurringTask(
  userId: string,
  input: CreateRecurringTaskInput
): Promise<RecurringTask> {
  const { data, error } = await supabaseAdmin
    .from('recurring_tasks')
    .insert({
      user_id: userId,
      title: input.title,
      recurrence_type: input.recurrence_type,
      recurrence_interval: input.recurrence_interval,
      start_date: input.start_date,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create recurring task: ${error.message}`);
  }

  return data;
}

export async function updateRecurringTask(
  userId: string,
  id: string,
  input: UpdateRecurringTaskInput
): Promise<RecurringTask | null> {
  const { data, error } = await supabaseAdmin
    .from('recurring_tasks')
    .update(input)
    .eq('user_id', userId)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to update recurring task: ${error.message}`);
  }

  return data;
}

export async function deleteRecurringTask(userId: string, id: string): Promise<boolean> {
  const { error, count } = await supabaseAdmin
    .from('recurring_tasks')
    .delete({ count: 'exact' })
    .eq('user_id', userId)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete recurring task: ${error.message}`);
  }

  return (count ?? 0) > 0;
}
