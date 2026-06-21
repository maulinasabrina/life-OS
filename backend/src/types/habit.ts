export type HabitFrequency = 'daily' | 'weekly';

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  frequency: HabitFrequency;
  created_at: string;
}

export interface CreateHabitInput {
  title: string;
  frequency: HabitFrequency;
}

export interface UpdateHabitInput {
  title?: string;
  frequency?: HabitFrequency;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  completed_date: string; // YYYY-MM-DD
  completed: boolean;
}

/**
 * A habit combined with its log entries for a given week window, plus
 * derived (not stored) stats — current streak and a 30-day completion rate.
 */
export interface HabitWithStats extends Habit {
  logs: HabitLog[];
  currentStreak: number;
  completionRate: number; // 0-100, rounded
}
