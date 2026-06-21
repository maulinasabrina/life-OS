import type { TaskStatus } from '@/shared/types/task';

const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: 'bg-(--color-paper) text-(--color-ink-soft) border border-(--color-border)',
  pending: 'bg-(--color-terracotta-soft) text-(--color-terracotta)',
  completed: 'bg-(--color-sage-soft) text-(--color-sage)',
  overdue: 'bg-(--color-error-soft) text-(--color-error)',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To do',
  pending: 'Pending',
  completed: 'Completed',
  overdue: 'Overdue',
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
