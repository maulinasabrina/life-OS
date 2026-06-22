import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import type { Task } from '@/shared/types/task';

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(from: string, to: string): number {
  const msPerDay = 86_400_000;
  return Math.round(
    (new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) / msPerDay
  );
}

function countdownLabel(daysAway: number): string {
  if (daysAway === 1) return 'Tomorrow';
  return `In ${daysAway} days`;
}

interface RecurringRow {
  task: Task;
  daysAway: number;
}

export function RecurringTasksWidget() {
  // Fetch all tasks (no range) — the recurrence engine will already have
  // generated upcoming occurrences into the tasks table; we just filter
  // for the ones with a recurring_task_id. No new API or logic changes.
  const { tasks, isLoading } = useTasks();
  const today = todayString();

  const { todayRows, upcomingRows } = useMemo(() => {
    const recurring = tasks.filter((t) => t.recurring_task_id !== null && t.due_date !== null);
    const todayRows: Task[] = [];
    const upcomingRows: RecurringRow[] = [];

    for (const t of recurring) {
      const daysAway = daysBetween(today, t.due_date!);
      if (daysAway === 0) {
        todayRows.push(t);
      } else if (daysAway > 0 && daysAway <= 14) {
        upcomingRows.push({ task: t, daysAway });
      }
    }

    upcomingRows.sort((a, b) => a.daysAway - b.daysAway);
    return { todayRows, upcomingRows };
  }, [tasks, today]);

  const isEmpty = !isLoading && todayRows.length === 0 && upcomingRows.length === 0;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-(--color-border) bg-(--color-paper-raised) p-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-(family-name:--font-display) text-lg font-semibold text-(--color-ink)">
            Recurring
          </h2>
          <p className="text-sm text-(--color-ink-soft)">Auto-scheduled tasks.</p>
        </div>
        <Link
          to="/tasks/recurring"
          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-(--color-ink-soft) transition-colors hover:bg-(--color-sage-soft) hover:text-(--color-ink)"
        >
          Manage
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-9 animate-pulse rounded-lg bg-(--color-paper)" />
          ))}
        </div>
      ) : isEmpty ? (
        <p className="py-4 text-center text-sm text-(--color-ink-soft)">
          No recurring tasks yet.{' '}
          <Link
            to="/tasks/recurring"
            className="font-medium text-(--color-ink) underline underline-offset-2"
          >
            Add one
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {todayRows.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-(--color-ink-soft)">
                Today
              </p>
              <ul className="flex flex-col gap-1">
                {todayRows.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-2.5 rounded-lg bg-(--color-sage-soft) px-3 py-2"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 text-(--color-sage)"
                      aria-hidden="true"
                    >
                      <path d="M3 12a9 9 0 1 1 2.6 6.4M3 12V7m0 5h5" />
                    </svg>
                    <span className="min-w-0 truncate text-sm font-medium text-(--color-ink)">
                      {task.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {upcomingRows.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-(--color-ink-soft)">
                Coming up
              </p>
              <ul className="flex flex-col gap-1">
                {upcomingRows.map(({ task, daysAway }) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between gap-2 rounded-lg px-1 py-1.5"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0 text-(--color-ink-soft)"
                        aria-hidden="true"
                      >
                        <path d="M3 12a9 9 0 1 1 2.6 6.4M3 12V7m0 5h5" />
                      </svg>
                      <span className="min-w-0 truncate text-sm text-(--color-ink)">
                        {task.title}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-(--color-ink-soft)">
                      {countdownLabel(daysAway)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
