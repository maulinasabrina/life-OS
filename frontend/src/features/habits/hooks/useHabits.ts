import { useCallback, useEffect, useState } from 'react';
import * as habitService from '@/features/habits/services/habitService';
import type { CreateHabitInput, HabitWithStats } from '@/shared/types/habit';

interface UseHabitsResult {
  habits: HabitWithStats[];
  isLoading: boolean;
  error: string | null;
  addHabit: (input: CreateHabitInput) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  toggleLog: (habitId: string, date: string, completed: boolean) => Promise<void>;
}

/**
 * Loads habits with their derived stats (streak, completion rate) for a
 * given calendar month, plus that month's log entries for the grid.
 * After any log toggle, refetches the full list rather than patching
 * locally — streak/completion-rate are derived server-side from the full
 * log set, so a local patch would need to reimplement that math and risk
 * drifting from the backend's actual calculation.
 */
export function useHabits(year: number, month: number): UseHabitsResult {
  const [habits, setHabits] = useState<HabitWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await habitService.fetchHabits(year, month);
      setHabits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load habits.');
    } finally {
      setIsLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addHabit = useCallback(
    async (input: CreateHabitInput) => {
      await habitService.createHabit(input);
      await refresh();
    },
    [refresh]
  );

  const removeHabit = useCallback(async (id: string) => {
    await habitService.deleteHabit(id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const toggleLog = useCallback(
    async (habitId: string, date: string, completed: boolean) => {
      await habitService.setHabitLog(habitId, date, completed);
      await refresh();
    },
    [refresh]
  );

  return { habits, isLoading, error, addHabit, removeHabit, toggleLog };
}
