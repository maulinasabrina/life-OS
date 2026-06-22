import { useCallback, useEffect, useState } from 'react';
import * as recurringTaskService from '@/features/recurring-tasks/services/recurringTaskService';
import type {
  CreateRecurringTaskInput,
  RecurringTask,
  UpdateRecurringTaskInput,
} from '@/shared/types/recurringTask';

interface UseRecurringTasksResult {
  recurringTasks: RecurringTask[];
  isLoading: boolean;
  error: string | null;
  addRecurringTask: (input: CreateRecurringTaskInput) => Promise<void>;
  editRecurringTask: (id: string, input: UpdateRecurringTaskInput) => Promise<void>;
  removeRecurringTask: (id: string) => Promise<void>;
}

export function useRecurringTasks(): UseRecurringTasksResult {
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await recurringTaskService.fetchRecurringTasks();
      setRecurringTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recurring tasks.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addRecurringTask = useCallback(async (input: CreateRecurringTaskInput) => {
    const created = await recurringTaskService.createRecurringTask(input);
    setRecurringTasks((prev) => [created, ...prev]);
  }, []);

  const editRecurringTask = useCallback(
    async (id: string, input: UpdateRecurringTaskInput) => {
      const updated = await recurringTaskService.updateRecurringTask(id, input);
      setRecurringTasks((prev) => prev.map((r) => (r.id === id ? updated : r)));
    },
    []
  );

  const removeRecurringTask = useCallback(async (id: string) => {
    await recurringTaskService.deleteRecurringTask(id);
    setRecurringTasks((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return {
    recurringTasks,
    isLoading,
    error,
    addRecurringTask,
    editRecurringTask,
    removeRecurringTask,
  };
}
