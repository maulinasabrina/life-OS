import type { MonthlyOverview } from '@/shared/types/habit';
import { monthName } from '@/shared/utils/date';
import { completionTier } from '@/features/habits/utils/completionTier';

interface MonthOverviewCardProps {
  data: MonthlyOverview;
}

export function MonthOverviewCard({ data }: MonthOverviewCardProps) {
  const tier = completionTier(data.completionRate, data.hasStarted);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-paper-raised) p-5">
      <p className="font-(family-name:--font-display) text-base font-semibold text-(--color-ink)">
        {monthName(data.month)}
      </p>

      <p
        className={`text-3xl font-semibold ${
          data.hasStarted ? 'text-(--color-ink)' : 'text-(--color-ink-soft)'
        }`}
      >
        {data.completionRate}%
      </p>
      <p className="-mt-2 text-xs text-(--color-ink-soft)">habit progress</p>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--color-border)">
        <div
          className="h-full rounded-full bg-(--color-sage) transition-[width]"
          style={{ width: `${Math.max(0, Math.min(100, data.completionRate))}%` }}
        />
      </div>

      <span
        className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium ${tier.className}`}
      >
        {tier.label}
      </span>
    </div>
  );
}
