import { supabaseAdmin } from '../configs/supabaseAdmin';
import type { QuickTask } from '../types/task';

export async function listQuickTasks(userId: string): Promise<QuickTask[]> {
  const { data, error } = await supabaseAdmin
    .from('quick_tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list quick tasks: ${error.message}`);
  }

  return data ?? [];
}

export async function createQuickTask(userId: string, title: string): Promise<QuickTask> {
  const { data, error } = await supabaseAdmin
    .from('quick_tasks')
    .insert({ user_id: userId, title })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create quick task: ${error.message}`);
  }

  return data;
}

export async function toggleQuickTask(
  userId: string,
  quickTaskId: string,
  completed: boolean
): Promise<QuickTask | null> {
  const { data, error } = await supabaseAdmin
    .from('quick_tasks')
    .update({ completed })
    .eq('user_id', userId)
    .eq('id', quickTaskId)
    .select('*')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to update quick task: ${error.message}`);
  }

  return data;
}

export async function deleteQuickTask(userId: string, quickTaskId: string): Promise<boolean> {
  const { error, count } = await supabaseAdmin
    .from('quick_tasks')
    .delete({ count: 'exact' })
    .eq('user_id', userId)
    .eq('id', quickTaskId);

  if (error) {
    throw new Error(`Failed to delete quick task: ${error.message}`);
  }

  return (count ?? 0) > 0;
}
