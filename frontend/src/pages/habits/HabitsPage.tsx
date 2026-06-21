import { useState } from 'react';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { HabitComposer } from '@/features/habits/components/HabitComposer';
import { MonthSelector } from '@/features/habits/components/MonthSelector';
import { MonthlyHabitGrid } from '@/features/habits/components/MonthlyHabitGrid';
import { HabitsViewTabs } from '@/features/habits/components/HabitsViewTabs';
import { YearlyOverviewPanel } from '@/features/habits/components/YearlyOverviewPanel';
import { monthName } from '@/shared/utils/date';

const now = new Date();

export function HabitsPage() {
  const [view, setView] = useState<'tracker' | 'overview'>('tracker');
  const [year] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { habits, isLoading, error, addHabit, removeHabit, toggleLog } = useHabits(year, month);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-(family-name:--font-display) text-2xl font-semibold text-(--color-ink) md:text-3xl">
          Habits
        </h1>
        <p className="text-(--color-ink-soft)">
          Small, repeated actions, tracked one day at a time.
        </p>
      </div>

      <HabitsViewTabs value={view} onChange={setView} />

      {view === 'tracker' ? (
        <div className="flex flex-col gap-4">
          <HabitComposer onCreate={addHabit} />

          {error && (
            <p role="alert" className="text-sm text-(--color-error)">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-(family-name:--font-display) text-lg font-semibold text-(--color-ink)">
                {monthName(month)} {year}
              </h2>
            </div>
            <MonthSelector selectedMonth={month} onSelect={setMonth} />
          </div>

          {isLoading ? (
            <div className="h-64 animate-pulse rounded-2xl border border-(--color-border) bg-(--color-paper-raised)" />
          ) : habits.length === 0 ? (
            <div className="rounded-xl border border-dashed border-(--color-border) px-6 py-12 text-center">
              <p className="text-sm text-(--color-ink-soft)">
                No habits yet. Add one above to start your first streak.
              </p>
            </div>
          ) : (
            <MonthlyHabitGrid
              habits={habits}
              year={year}
              month={month}
              onToggleDay={(habitId, date, completed) => toggleLog(habitId, date, completed)}
              onDeleteHabit={removeHabit}
            />
          )}
        </div>
      ) : (
        <YearlyOverviewPanel year={year} />
      )}
    </div>
  );
}
