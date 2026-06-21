import type { HabitWithStats } from '@/shared/types/habit';
import { WeeklyTracker } from '@/features/habits/components/WeeklyTracker';
import { StreakBadge } from '@/features/habits/components/StreakBadge';
import { CompletionRing } from '@/features/habits/components/CompletionRing';

interface HabitCardProps {
  habit: HabitWithStats;
  onToggleLog: (date: string, completed: boolean) => void;
  onDelete: () => void;
}

const FREQUENCY_LABEL: Record<HabitWithStats['frequency'], string> = {
  daily: 'Daily',
  weekly: 'Weekly',
};

export function HabitCard({ habit, onToggleLog, onDelete }: HabitCardProps) {
  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-(--color-border) bg-(--color-paper-raised) p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-(family-name:--font-display) text-base font-semibold text-(--color-ink)">
            {habit.title}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-full bg-(--color-sage-soft) px-2 py-0.5 text-xs font-medium text-(--color-sage)">
              {FREQUENCY_LABEL[habit.frequency]}
            </span>
            <StreakBadge streak={habit.currentStreak} frequency={habit.frequency} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CompletionRing percent={habit.completionRate} />
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete habit "${habit.title}"`}
            className="rounded-md p-1.5 text-(--color-ink-soft) opacity-0 transition-opacity hover:bg-(--color-error-soft) hover:text-(--color-error) focus-visible:opacity-100 group-hover:opacity-100"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
            </svg>
          </button>
        </div>
      </div>

      <WeeklyTracker logs={habit.logs} onToggle={onToggleLog} />
    </div>
  );
}
