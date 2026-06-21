import { apiFetch } from '@/shared/services/apiClient';
import type { QuickTask } from '@/shared/types/task';

export async function fetchQuickTasks(): Promise<QuickTask[]> {
  const { quickTasks } = await apiFetch<{ quickTasks: QuickTask[] }>('/quick-tasks');
  return quickTasks;
}

export async function createQuickTask(title: string): Promise<QuickTask> {
  const { quickTask } = await apiFetch<{ quickTask: QuickTask }>('/quick-tasks', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
  return quickTask;
}

export async function toggleQuickTask(
  id: string,
  completed: boolean
): Promise<QuickTask> {
  const { quickTask } = await apiFetch<{ quickTask: QuickTask }>(`/quick-tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ completed }),
  });
  return quickTask;
}

export async function deleteQuickTask(id: string): Promise<void> {
  await apiFetch<void>(`/quick-tasks/${id}`, { method: 'DELETE' });
}
