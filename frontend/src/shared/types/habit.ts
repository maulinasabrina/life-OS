export type HabitFrequency = 'daily' | 'weekly';

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  frequency: HabitFrequency;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  completed_date: string;
  completed: boolean;
}

export interface HabitWithStats extends Habit {
  logs: HabitLog[];
  currentStreak: number;
  completionRate: number;
}

export interface MonthlyOverview {
  month: number;
  completionRate: number;
  hasStarted: boolean;
}

export interface YearlyOverview {
  year: number;
  yearlyAverage: number;
  months: MonthlyOverview[];
}

export interface CreateHabitInput {
  title: string;
  frequency: HabitFrequency;
}
