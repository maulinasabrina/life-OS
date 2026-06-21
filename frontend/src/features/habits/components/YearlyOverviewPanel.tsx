import { useYearlyOverview } from '@/features/habits/hooks/useYearlyOverview';
import { MonthOverviewCard } from '@/features/habits/components/MonthOverviewCard';

interface YearlyOverviewPanelProps {
  year: number;
}

function encouragement(average: number): string {
  if (average >= 70) return "You're keeping up a strong rhythm. Keep it going.";
  if (average >= 35) return "There's good progress here. Keep building consistency.";
  if (average > 0) return 'A start is a start — small steps add up.';
  return 'No habits tracked yet this year. Start one to see your progress here.';
}

export function YearlyOverviewPanel({ year }: YearlyOverviewPanelProps) {
  const { overview, isLoading, error } = useYearlyOverview(year);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-28 animate-pulse rounded-2xl border border-(--color-border) bg-(--color-paper-raised)" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-(--color-border) bg-(--color-paper-raised)"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <p role="alert" className="text-sm text-(--color-error)">
        {error ?? 'Failed to load yearly overview.'}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-(--color-border) bg-(--color-paper-raised) p-6">
        <p className="text-sm font-medium text-(--color-ink-soft)">Yearly score</p>
        <p className="mt-1 font-(family-name:--font-display) text-4xl font-semibold text-(--color-sage)">
          {overview.yearlyAverage}%
        </p>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          average across all months · {encouragement(overview.yearlyAverage)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {overview.months.map((m) => (
          <MonthOverviewCard key={m.month} data={m} />
        ))}
      </div>
    </div>
  );
}
