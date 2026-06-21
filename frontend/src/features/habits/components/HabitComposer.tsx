import { useState, type FormEvent } from 'react';
import type { CreateHabitInput, HabitFrequency } from '@/shared/types/habit';
import { Button } from '@/shared/components/Button';

interface HabitComposerProps {
  onCreate: (input: CreateHabitInput) => Promise<void>;
}

export function HabitComposer({ onCreate }: HabitComposerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onCreate({ title: title.trim(), frequency });
      setTitle('');
      setFrequency('daily');
      setIsExpanded(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create habit.');
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
        Add a habit
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
        placeholder="What habit are you building?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border-0 bg-transparent text-sm font-medium text-(--color-ink) outline-none placeholder:text-(--color-ink-soft)/50"
      />

      <div className="flex items-center gap-2">
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
          className="rounded-lg border border-(--color-border) bg-(--color-paper) px-2.5 py-1.5 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-sage)"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      {error && <p className="text-sm text-(--color-error)">{error}</p>}

      <div className="flex items-center gap-2">
        <Button type="submit" isLoading={isSubmitting} disabled={!title.trim()}>
          Add habit
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
