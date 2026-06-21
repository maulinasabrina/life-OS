import { useCallback, useEffect, useState } from 'react';
import * as taskService from '@/features/tasks/services/taskService';
import type {
  CreateTaskInput,
  Task,
  TaskRange,
  UpdateTaskInput,
} from '@/shared/types/task';

interface UseTasksResult {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  addTask: (input: CreateTaskInput) => Promise<void>;
  editTask: (id: string, input: UpdateTaskInput) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Loads and manages tasks for a given range (daily/weekly/monthly, or all
 * tasks when range is omitted). Mutations update local state optimistically
 * via the server's returned row, avoiding a full refetch after every change.
 */
export function useTasks(range?: TaskRange): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await taskService.fetchTasks(range);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks.');
    } finally {
      setIsLoading(false);
    }
  }, [range]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addTask = useCallback(
    async (input: CreateTaskInput) => {
      await taskService.createTask(input);
      // Refetch rather than splicing locally: the new task may or may not
      // belong in the current range filter (daily/weekly/monthly), and
      // that decision is made server-side.
      await refresh();
    },
    [refresh]
  );

  const editTask = useCallback(
    async (id: string, input: UpdateTaskInput) => {
      const updated = await taskService.updateTask(id, input);
      if ('due_date' in input) {
        // due_date changed — it may no longer belong in the current
        // range filter, so refetch rather than patching in place.
        await refresh();
      } else {
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      }
    },
    [refresh]
  );

  const removeTask = useCallback(async (id: string) => {
    await taskService.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tasks, isLoading, error, addTask, editTask, removeTask, refresh };
}
