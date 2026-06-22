import { useState, type FormEvent } from 'react';
import type { CreateRecurringTaskInput, RecurrenceType } from '@/shared/types/recurringTask';
import { Button } from '@/shared/components/Button';
import { todayDateString } from '@/shared/utils/date';

interface RecurringTaskComposerProps {
  onCreate: (input: CreateRecurringTaskInput) => Promise<void>;
}

const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  daily: 'day(s)',
  weekly: 'week(s)',
  monthly: 'month(s)',
};

export function RecurringTaskComposer({ onCreate }: RecurringTaskComposerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('daily');
  const [interval, setInterval] = useState(1);
  const [startDate, setStartDate] = useState(todayDateString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onCreate({
        title: title.trim(),
        recurrence_type: recurrenceType,
        recurrence_interval: interval,
        start_date: startDate,
      });
      setTitle('');
      setRecurrenceType('daily');
      setInterval(1);
      setStartDate(todayDateString());
      setIsExpanded(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create recurring task.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="flex w-full items-center gap-2 rounded-xl border border-dashed border-(--color-border) px-4 py-3 text-sm font-medium text-(--color-ink-soft) transition-colors hover:border-(--color-sage) hover:text-(--color-sage)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add a recurring task
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-(--color-border) bg-(--color-paper-raised) p-4"
    >
      <input
        type="text"
        autoFocus
        placeholder="e.g. Wash hair, Pay internet bill"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border-0 bg-transparent text-sm font-medium text-(--color-ink) outline-none placeholder:text-(--color-ink-soft)/50"
      />

      <div className="flex flex-wrap items-center gap-2 text-sm text-(--color-ink-soft)">
        <span>Every</span>
        <input
          type="number"
          min={1}
          max={365}
          value={interval}
          onChange={(e) => setInterval(Math.max(1, Number(e.target.value) || 1))}
          className="w-16 rounded-lg border border-(--color-border) bg-(--color-paper) px-2 py-1.5 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-sage)"
        />
        <select
          value={recurrenceType}
          onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
          className="rounded-lg border border-(--color-border) bg-(--color-paper) px-2.5 py-1.5 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-sage)"
        >
          <option value="daily">{RECURRENCE_LABELS.daily}</option>
          <option value="weekly">{RECURRENCE_LABELS.weekly}</option>
          <option value="monthly">{RECURRENCE_LABELS.monthly}</option>
        </select>
        <span>starting</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-lg border border-(--color-border) bg-(--color-paper) px-2.5 py-1.5 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-sage)"
        />
      </div>

      {error && <p className="text-sm text-(--color-error)">{error}</p>}

      <div className="flex items-center gap-2">
        <Button type="submit" isLoading={isSubmitting} disabled={!title.trim()}>
          Add recurring task
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setIsExpanded(false);
            setError(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
