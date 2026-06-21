import { monthAbbr } from '@/shared/utils/date';

interface MonthSelectorProps {
  selectedMonth: number;
  onSelect: (month: number) => void;
}

export function MonthSelector({ selectedMonth, onSelect }: MonthSelectorProps) {
  return (
    <div role="tablist" aria-label="Select month" className="flex gap-1 overflow-x-auto pb-1">
      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
        <button
          key={month}
          type="button"
          role="tab"
          aria-selected={selectedMonth === month}
          onClick={() => onSelect(month)}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            selectedMonth === month
              ? 'bg-(--color-sage) text-(--color-paper)'
              : 'text-(--color-ink-soft) hover:bg-(--color-sage-soft)'
          }`}
        >
          {monthAbbr(month)}
        </button>
      ))}
    </div>
  );
}
