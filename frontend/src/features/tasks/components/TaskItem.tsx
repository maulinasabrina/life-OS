import type { Task } from '@/shared/types/task';
import { PriorityBadge } from '@/features/tasks/components/PriorityBadge';
import { StatusBadge } from '@/features/tasks/components/StatusBadge';
import { TaskCheckbox } from '@/features/tasks/components/TaskCheckbox';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (completed: boolean) => void;
  onDelete: () => void;
}

function formatDueDate(dueDate: string | null): string | null {
  if (!dueDate) return null;
  const date = new Date(`${dueDate}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function TaskItem({ task, onToggleComplete, onDelete }: TaskItemProps) {
  const isCompleted = task.status === 'completed';
  const dueLabel = formatDueDate(task.due_date);

  return (
    <li className="group flex items-start gap-3 rounded-xl border border-(--color-border) bg-(--color-paper-raised) px-4 py-3.5">
      <div className="mt-0.5">
        <TaskCheckbox
          checked={isCompleted}
          onChange={onToggleComplete}
          label={task.title}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium text-(--color-ink) ${
            isCompleted ? 'text-(--color-ink-soft) line-through' : ''
          }`}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 truncate text-sm text-(--color-ink-soft)">
            {task.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          {dueLabel && (
            <span className="text-xs text-(--color-ink-soft)">{dueLabel}</span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onDelete}
        aria-label={`Delete "${task.title}"`}
        className="rounded-md p-1.5 text-(--color-ink-soft) opacity-0 transition-opacity hover:bg-(--color-error-soft) hover:text-(--color-error) focus-visible:opacity-100 group-hover:opacity-100"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
        </svg>
      </button>
    </li>
  );
}
