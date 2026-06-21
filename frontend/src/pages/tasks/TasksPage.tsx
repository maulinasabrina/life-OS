import { useState } from 'react';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { TaskRangeTabs } from '@/features/tasks/components/TaskRangeTabs';
import { TaskList } from '@/features/tasks/components/TaskList';
import { QuickTaskInbox } from '@/features/tasks/components/QuickTaskInbox';
import type { TaskRange } from '@/shared/types/task';

export function TasksPage() {
  const [range, setRange] = useState<TaskRange>('daily');
  const { tasks, isLoading, error, addTask, editTask, removeTask } = useTasks(range);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-(family-name:--font-display) text-2xl font-semibold text-(--color-ink) md:text-3xl">
          Tasks
        </h1>
        <p className="text-(--color-ink-soft)">
          Plan what's ahead, one day, week, or month at a time.
        </p>
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

        <QuickTaskInbox />
      </div>
    </div>
  );
}
