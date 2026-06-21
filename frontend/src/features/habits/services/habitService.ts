import { apiFetch } from '@/shared/services/apiClient';
import type {
  CreateHabitInput,
  Habit,
  HabitLog,
  HabitWithStats,
  YearlyOverview,
} from '@/shared/types/habit';

export async function fetchHabits(year: number, month: number): Promise<HabitWithStats[]> {
  const { habits } = await apiFetch<{ habits: HabitWithStats[] }>(
    `/habits?year=${year}&month=${month}`
  );
  return habits;
}

export async function fetchYearlyOverview(year: number): Promise<YearlyOverview> {
  return apiFetch<YearlyOverview>(`/habits/yearly-overview?year=${year}`);
}

export async function createHabit(input: CreateHabitInput): Promise<Habit> {
  const { habit } = await apiFetch<{ habit: Habit }>('/habits', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return habit;
}

export async function deleteHabit(id: string): Promise<void> {
  await apiFetch<void>(`/habits/${id}`, { method: 'DELETE' });
}

export async function setHabitLog(
  habitId: string,
  date: string,
  completed: boolean
): Promise<HabitLog> {
  const { log } = await apiFetch<{ log: HabitLog }>(`/habits/${habitId}/logs`, {
    method: 'PUT',
    body: JSON.stringify({ date, completed }),
  });
  return log;
}
