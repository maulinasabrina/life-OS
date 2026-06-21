interface HabitsViewTabsProps {
  value: 'tracker' | 'overview';
  onChange: (value: 'tracker' | 'overview') => void;
}

export function HabitsViewTabs({ value, onChange }: HabitsViewTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Habits view"
      className="inline-flex gap-1 rounded-lg border border-(--color-border) bg-(--color-paper-raised) p-1"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === 'tracker'}
        onClick={() => onChange('tracker')}
        className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
          value === 'tracker'
            ? 'bg-(--color-sage) text-(--color-paper)'
            : 'text-(--color-ink-soft) hover:bg-(--color-sage-soft)'
        }`}
      >
        Tracker
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === 'overview'}
        onClick={() => onChange('overview')}
        className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
          value === 'overview'
            ? 'bg-(--color-sage) text-(--color-paper)'
            : 'text-(--color-ink-soft) hover:bg-(--color-sage-soft)'
        }`}
      >
        Yearly overview
      </button>
    </div>
  );
}
