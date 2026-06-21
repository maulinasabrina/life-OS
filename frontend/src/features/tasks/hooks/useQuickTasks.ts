import { useCallback, useEffect, useState } from 'react';
import * as quickTaskService from '@/features/tasks/services/quickTaskService';
import type { QuickTask } from '@/shared/types/task';

interface UseQuickTasksResult {
  quickTasks: QuickTask[];
  isLoading: boolean;
  error: string | null;
  addQuickTask: (title: string) => Promise<void>;
  toggleQuickTask: (id: string, completed: boolean) => Promise<void>;
  removeQuickTask: (id: string) => Promise<void>;
}

export function useQuickTasks(): UseQuickTasksResult {
  const [quickTasks, setQuickTasks] = useState<QuickTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    quickTaskService
      .fetchQuickTasks()
      .then(setQuickTasks)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load quick tasks.')
      )
      .finally(() => setIsLoading(false));
  }, []);

  const addQuickTask = useCallback(async (title: string) => {
    const created = await quickTaskService.createQuickTask(title);
    setQuickTasks((prev) => [created, ...prev]);
  }, []);

  const toggleQuickTask = useCallback(async (id: string, completed: boolean) => {
    const updated = await quickTaskService.toggleQuickTask(id, completed);
    setQuickTasks((prev) => prev.map((q) => (q.id === id ? updated : q)));
  }, []);

  const removeQuickTask = useCallback(async (id: string) => {
    await quickTaskService.deleteQuickTask(id);
    setQuickTasks((prev) => prev.filter((q) => q.id !== id));
  }, []);

  return { quickTasks, isLoading, error, addQuickTask, toggleQuickTask, removeQuickTask };
}
