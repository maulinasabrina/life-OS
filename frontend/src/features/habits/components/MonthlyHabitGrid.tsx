import { daysInMonth as getDaysInMonth, todayDateString } from '@/shared/utils/date';
import type { HabitWithStats } from '@/shared/types/habit';

interface MonthlyHabitGridProps {
  habits: HabitWithStats[];
  year: number;
  month: number;
  onToggleDay: (habitId: string, date: string, completed: boolean) => void;
  onDeleteHabit: (habitId: string) => void;
}

function dateForDay(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function MonthlyHabitGrid({
  habits,
  year,
  month,
  onToggleDay,
  onDeleteHabit,
}: MonthlyHabitGridProps) {
  const totalDays = getDaysInMonth(year, month);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const today = todayDateString();

  return (
    <div className="overflow-x-auto rounded-2xl border border-(--color-border) bg-(--color-paper-raised)">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 border-b border-(--color-border) bg-(--color-paper-raised) px-4 py-3 text-left font-medium text-(--color-ink-soft)">
              Habit
            </th>
            {days.map((day) => {
              const isToday = dateForDay(year, month, day) === today;
              return (
                <th
                  key={day}
                  className={`min-w-9 border-b border-(--color-border) px-1 py-3 text-center text-xs font-medium ${
                    isToday ? 'text-(--color-sage)' : 'text-(--color-ink-soft)'
                  }`}
                >
                  {day}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {habits.map((habit) => {
            const completedDates = new Set(
              habit.logs.filter((l) => l.completed).map((l) => l.completed_date)
            );

            return (
              <tr key={habit.id} className="group/row">
                <td className="sticky left-0 z-10 border-b border-(--color-border) bg-(--color-paper-raised) px-4 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="whitespace-nowrap text-(--color-ink)">{habit.title}</span>
                    <button
                      type="button"
                      onClick={() => onDeleteHabit(habit.id)}
                      aria-label={`Delete habit "${habit.title}"`}
                      className="shrink-0 rounded-md p-1 text-(--color-ink-soft) opacity-0 transition-opacity hover:bg-(--color-error-soft) hover:text-(--color-error) focus-visible:opacity-100 group-hover/row:opacity-100"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
                      </svg>
                    </button>
                  </div>
                </td>
                {days.map((day) => {
                  const date = dateForDay(year, month, day);
                  const isCompleted = completedDates.has(date);
                  const isFuture = date > today;

                  return (
                    <td key={day} className="border-b border-(--color-border) p-1 text-center">
                      <button
                        type="button"
                        disabled={isFuture}
                        onClick={() => onToggleDay(habit.id, date, !isCompleted)}
                        aria-label={`${habit.title}, day ${day}, ${isCompleted ? 'completed' : 'not completed'}`}
                        aria-pressed={isCompleted}
                        className={`mx-auto flex h-6 w-6 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-25 ${
                          isCompleted
                            ? 'border-(--color-sage) bg-(--color-sage) text-(--color-paper)'
                            : 'border-(--color-border) bg-(--color-paper) hover:border-(--color-sage)'
                        }`}
                      >
                        {isCompleted && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path
                              d="M2 6l2.5 2.5L10 3"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
