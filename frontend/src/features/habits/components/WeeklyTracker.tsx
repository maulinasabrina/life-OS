import { currentWeekDates, dayOfMonth, todayDateString, weekdayLabel } from '@/shared/utils/date';
import type { HabitLog } from '@/shared/types/habit';

interface WeeklyTrackerProps {
  logs: HabitLog[];
  onToggle: (date: string, completed: boolean) => void;
}

export function WeeklyTracker({ logs, onToggle }: WeeklyTrackerProps) {
  const week = currentWeekDates();
  const today = todayDateString();
  const completedDates = new Set(logs.filter((l) => l.completed).map((l) => l.completed_date));

  return (
    <div className="flex gap-1.5">
      {week.map((date) => {
        const isCompleted = completedDates.has(date);
        const isToday = date === today;
        const isFuture = date > today;

        return (
          <button
            key={date}
            type="button"
            disabled={isFuture}
            onClick={() => onToggle(date, !isCompleted)}
            aria-label={`${weekdayLabel(date)} ${dayOfMonth(date)}, ${isCompleted ? 'completed' : 'not completed'}`}
            aria-pressed={isCompleted}
            className={`flex h-11 w-9 flex-col items-center justify-center gap-0.5 rounded-lg border text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
              isCompleted
                ? 'border-(--color-sage) bg-(--color-sage) text-(--color-paper)'
                : isToday
                  ? 'border-(--color-sage) bg-(--color-paper) text-(--color-ink)'
                  : 'border-(--color-border) bg-(--color-paper) text-(--color-ink-soft) hover:border-(--color-sage)'
            }`}
          >
            <span className="text-[10px] uppercase tracking-wide opacity-70">
              {weekdayLabel(date)}
            </span>
            <span>{dayOfMonth(date)}</span>
          </button>
        );
      })}
    </div>
  );
}
