import type { TaskPriority } from '@/shared/types/task';

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  none: 'hidden',
  low: 'bg-(--color-sage-soft) text-(--color-sage)',
  medium: 'bg-(--color-terracotta-soft) text-(--color-terracotta)',
  high: 'bg-(--color-error-soft) text-(--color-error)',
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  none: '',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  if (priority === 'none') return null;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[priority]}`}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
