import { apiFetch } from '@/shared/services/apiClient';
import type {
  CreateTaskInput,
  Task,
  TaskRange,
  UpdateTaskInput,
} from '@/shared/types/task';

export async function fetchTasks(range?: TaskRange): Promise<Task[]> {
  const query = range ? `?range=${range}` : '';
  const { tasks } = await apiFetch<{ tasks: Task[] }>(`/tasks${query}`);
  return tasks;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { task } = await apiFetch<{ task: Task }>('/tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return task;
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput
): Promise<Task> {
  const { task } = await apiFetch<{ task: Task }>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return task;
}

export async function deleteTask(id: string): Promise<void> {
  await apiFetch<void>(`/tasks/${id}`, { method: 'DELETE' });
}
