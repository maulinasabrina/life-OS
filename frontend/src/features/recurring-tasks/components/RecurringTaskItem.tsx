import type { RecurringTask } from '@/shared/types/recurringTask';

interface RecurringTaskItemProps {
  recurringTask: RecurringTask;
  onToggleActive: (active: boolean) => void;
  onDelete: () => void;
}

function describeRecurrence(rt: RecurringTask): string {
  const unit =
    rt.recurrence_type === 'daily' ? 'day' : rt.recurrence_type === 'weekly' ? 'week' : 'month';
  const plural = rt.recurrence_interval === 1 ? unit : `${unit}s`;
  return `Every ${rt.recurrence_interval} ${plural}`;
}

export function RecurringTaskItem({
  recurringTask,
  onToggleActive,
  onDelete,
}: RecurringTaskItemProps) {
  return (
    <li className="group flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-paper-raised) px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium ${
            recurringTask.active ? 'text-(--color-ink)' : 'text-(--color-ink-soft) line-through'
          }`}
        >
          {recurringTask.title}
        </p>
        <p className="mt-0.5 text-xs text-(--color-ink-soft)">
          {describeRecurrence(recurringTask)} · since {recurringTask.start_date}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={recurringTask.active}
        aria-label={
          recurringTask.active ? 'Pause this recurring task' : 'Resume this recurring task'
        }
        onClick={() => onToggleActive(!recurringTask.active)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          recurringTask.active ? 'bg-(--color-sage)' : 'bg-(--color-border)'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-(--color-paper-raised) shadow transition-transform ${
            recurringTask.active ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </button>

      <button
        type="button"
        onClick={onDelete}
        aria-label={`Delete recurring task "${recurringTask.title}"`}
        className="shrink-0 rounded-md p-1.5 text-(--color-ink-soft) opacity-0 transition-opacity hover:bg-(--color-error-soft) hover:text-(--color-error) focus-visible:opacity-100 group-hover:opacity-100"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
        </svg>
      </button>
    </li>
  );
}
