import { supabaseAdmin } from '../configs/supabaseAdmin';
import type { CreateTaskInput, Task, UpdateTaskInput } from '../types/task';

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Recomputes status for any of the user's tasks that have slipped past
 * their due_date while still in 'todo' or 'pending'. Only 'todo'/'pending'
 * roll into 'overdue' — 'completed' tasks are left alone, and we never
 * roll an already-'overdue' task backwards on read (only an explicit
 * update, e.g. changing the due_date or marking it done, changes that).
 *
 * Called before every read so status is always accurate without a
 * scheduled job. Cheap no-op when nothing has actually gone overdue.
 */
async function markOverdueTasks(userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('tasks')
    .update({ status: 'overdue' })
    .eq('user_id', userId)
    .lt('due_date', todayDateString())
    .in('status', ['todo', 'pending']);

  if (error) {
    throw new Error(`Failed to refresh overdue task status: ${error.message}`);
  }
}

export interface ListTasksFilters {
  range?: 'daily' | 'weekly' | 'monthly';
  status?: string;
}

function dateRangeForFilter(range: ListTasksFilters['range']): { from: string; to: string } | null {
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  if (range === 'daily') {
    const to = new Date(startOfDay);
    return { from: toDateString(startOfDay), to: toDateString(to) };
  }

  if (range === 'weekly') {
    // Week = today through 6 days out (rolling 7-day window).
    const to = new Date(startOfDay);
    to.setUTCDate(to.getUTCDate() + 6);
    return { from: toDateString(startOfDay), to: toDateString(to) };
  }

  if (range === 'monthly') {
    const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
    return { from: toDateString(startOfDay), to: toDateString(to) };
  }

  return null;
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function listTasks(
  userId: string,
  filters: ListTasksFilters
): Promise<Task[]> {
  await markOverdueTasks(userId);

  let query = supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  const dateRange = dateRangeForFilter(filters.range);
  if (dateRange) {
    query = query.gte('due_date', dateRange.from).lte('due_date', dateRange.to);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list tasks: ${error.message}`);
  }

  return data ?? [];
}

export async function getTaskById(userId: string, taskId: string): Promise<Task | null> {
  await markOverdueTasks(userId);

  const { data, error } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('id', taskId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch task: ${error.message}`);
  }

  return data;
}

export async function createTask(userId: string, input: CreateTaskInput): Promise<Task> {
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority ?? 'none',
      due_date: input.due_date ?? null,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create task: ${error.message}`);
  }

  return data;
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: UpdateTaskInput
): Promise<Task | null> {
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .update(input)
    .eq('user_id', userId)
    .eq('id', taskId)
    .select('*')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to update task: ${error.message}`);
  }

  return data;
}

export async function deleteTask(userId: string, taskId: string): Promise<boolean> {
  const { error, count } = await supabaseAdmin
    .from('tasks')
    .delete({ count: 'exact' })
    .eq('user_id', userId)
    .eq('id', taskId);

  if (error) {
    throw new Error(`Failed to delete task: ${error.message}`);
  }

  return (count ?? 0) > 0;
}
