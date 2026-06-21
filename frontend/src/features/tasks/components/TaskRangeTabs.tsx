import type { TaskRange } from '@/shared/types/task';

interface TaskRangeTabsProps {
  value: TaskRange;
  onChange: (range: TaskRange) => void;
}

const RANGES: { value: TaskRange; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export function TaskRangeTabs({ value, onChange }: TaskRangeTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Task range"
      className="inline-flex gap-1 rounded-lg border border-(--color-border) bg-(--color-paper-raised) p-1"
    >
      {RANGES.map((r) => (
        <button
          key={r.value}
          type="button"
          role="tab"
          aria-selected={value === r.value}
          onClick={() => onChange(r.value)}
          className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
            value === r.value
              ? 'bg-(--color-sage) text-(--color-paper)'
              : 'text-(--color-ink-soft) hover:bg-(--color-sage-soft)'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
