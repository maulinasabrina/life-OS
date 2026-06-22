export type RecurrenceType = 'daily' | 'weekly' | 'monthly';

export interface RecurringTask {
  id: string;
  user_id: string;
  title: string;
  recurrence_type: RecurrenceType;
  recurrence_interval: number;
  start_date: string; // YYYY-MM-DD
  active: boolean;
  last_generated_date: string | null;
}

export interface CreateRecurringTaskInput {
  title: string;
  recurrence_type: RecurrenceType;
  recurrence_interval: number;
  start_date: string;
}

export interface UpdateRecurringTaskInput {
  title?: string;
  recurrence_type?: RecurrenceType;
  recurrence_interval?: number;
  start_date?: string;
  active?: boolean;
}
