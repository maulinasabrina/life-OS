import { apiFetch } from '@/shared/services/apiClient';
import type {
  CreateRecurringTaskInput,
  RecurringTask,
  UpdateRecurringTaskInput,
} from '@/shared/types/recurringTask';

export async function fetchRecurringTasks(): Promise<RecurringTask[]> {
  const { recurringTasks } = await apiFetch<{ recurringTasks: RecurringTask[] }>(
    '/recurring-tasks'
  );
  return recurringTasks;
}

export async function createRecurringTask(
  input: CreateRecurringTaskInput
): Promise<RecurringTask> {
  const { recurringTask } = await apiFetch<{ recurringTask: RecurringTask }>('/recurring-tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return recurringTask;
}

export async function updateRecurringTask(
  id: string,
  input: UpdateRecurringTaskInput
): Promise<RecurringTask> {
  const { recurringTask } = await apiFetch<{ recurringTask: RecurringTask }>(
    `/recurring-tasks/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    }
  );
  return recurringTask;
}

export async function deleteRecurringTask(id: string): Promise<void> {
  await apiFetch<void>(`/recurring-tasks/${id}`, { method: 'DELETE' });
}
