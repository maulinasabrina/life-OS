import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { TaskRangeTabs } from '@/features/tasks/components/TaskRangeTabs';
import { TaskList } from '@/features/tasks/components/TaskList';
import { QuickTaskInbox } from '@/features/tasks/components/QuickTaskInbox';
import { RecurringTasksWidget } from '@/features/recurring-tasks/components/RecurringTasksWidget';
import type { TaskRange } from '@/shared/types/task';

export function TasksPage() {
  const [range, setRange] = useState<TaskRange>('daily');
  const { tasks, isLoading, error, addTask, editTask, removeTask } = useTasks(range);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-(family-name:--font-display) text-2xl font-semibold text-(--color-ink) md:text-3xl">
            Tasks
          </h1>
          <p className="text-(--color-ink-soft)">
            Plan what's ahead, one day, week, or month at a time.
          </p>
        </div>
        <Link
          to="/tasks/recurring"
          className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-paper-raised) px-3.5 py-2 text-sm font-medium text-(--color-ink) transition-colors hover:bg-(--color-sage-soft)"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 1 2.6 6.4M3 12V7m0 5h5" />
          </svg>
          Recurring tasks
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <TaskRangeTabs value={range} onChange={setRange} />
          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            error={error}
            range={range}
            onCreate={addTask}
            onToggleComplete={(id, completed) =>
              editTask(id, { status: completed ? 'completed' : 'todo' })
            }
            onDelete={removeTask}
          />
        </div>

        <div className="flex flex-col gap-4">
          <QuickTaskInbox />
          <RecurringTasksWidget />
        </div>
      </div>
    </div>
  );
}
