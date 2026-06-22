import { useRecurringTasks } from '@/features/recurring-tasks/hooks/useRecurringTasks';
import { RecurringTaskComposer } from '@/features/recurring-tasks/components/RecurringTaskComposer';
import { RecurringTaskItem } from '@/features/recurring-tasks/components/RecurringTaskItem';

export function RecurringTasksPage() {
  const {
    recurringTasks,
    isLoading,
    error,
    addRecurringTask,
    editRecurringTask,
    removeRecurringTask,
  } = useRecurringTasks();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-(family-name:--font-display) text-2xl font-semibold text-(--color-ink) md:text-3xl">
          Recurring Tasks
        </h1>
        <p className="text-(--color-ink-soft)">
          Set it once — matching tasks appear on your list automatically when
          they're due. Pause anytime without losing the schedule.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <RecurringTaskComposer onCreate={addRecurringTask} />

        {error && (
          <p role="alert" className="text-sm text-(--color-error)">
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-[72px] animate-pulse rounded-xl border border-(--color-border) bg-(--color-paper-raised)"
              />
            ))}
          </div>
        ) : recurringTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-(--color-border) px-6 py-12 text-center">
            <p className="text-sm text-(--color-ink-soft)">
              No recurring tasks yet. Add one above — like "wash hair every 3
              days" or "pay internet bill monthly."
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {recurringTasks.map((rt) => (
              <RecurringTaskItem
                key={rt.id}
                recurringTask={rt}
                onToggleActive={(active) => editRecurringTask(rt.id, { active })}
                onDelete={() => removeRecurringTask(rt.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
