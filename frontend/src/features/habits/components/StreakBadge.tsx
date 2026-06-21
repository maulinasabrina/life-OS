interface StreakBadgeProps {
  streak: number;
  frequency: 'daily' | 'weekly';
}

export function StreakBadge({ streak, frequency }: StreakBadgeProps) {
  if (streak === 0) {
    return <span className="text-xs text-(--color-ink-soft)">No streak yet</span>;
  }

  const unit =
    frequency === 'daily'
      ? streak === 1
        ? 'day'
        : 'days'
      : streak === 1
        ? 'week'
        : 'weeks';

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-(--color-terracotta)">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2c1 3-2 4-2 7a3 3 0 0 0 6 0c2 1 3 3 3 5a7 7 0 1 1-14 0c0-4 3-6 4-9 1 1 2 2 3-3z" />
      </svg>
      {streak} {unit}
    </span>
  );
}
