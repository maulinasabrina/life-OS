import type { Task, TaskRange } from '@/shared/types/task';
import { TaskItem } from '@/features/tasks/components/TaskItem';
import { TaskComposer } from '@/features/tasks/components/TaskComposer';
import type { CreateTaskInput } from '@/shared/types/task';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  range: TaskRange;
  onCreate: (input: CreateTaskInput) => Promise<void>;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

const EMPTY_COPY: Record<TaskRange, string> = {
  daily: "Nothing due today. Add one below, or enjoy the clear day.",
  weekly: "No tasks due this week yet.",
  monthly: "No tasks due this month yet.",
};

export function TaskList({
  tasks,
  isLoading,
  error,
  range,
  onCreate,
  onToggleComplete,
  onDelete,
}: TaskListProps) {
  return (
    <div className="flex flex-col gap-3">
      <TaskComposer onCreate={onCreate} />

      {error && (
        <p role="alert" className="text-sm text-(--color-error)">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[72px] animate-pulse rounded-xl border border-(--color-border) bg-(--color-paper-raised)"
            />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-(--color-border) px-6 py-12 text-center">
          <p className="text-sm text-(--color-ink-soft)">{EMPTY_COPY[range]}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={(completed) =>
                onToggleComplete(task.id, completed)
              }
              onDelete={() => onDelete(task.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
