import { useState, type FormEvent } from 'react';
import type { CreateTaskInput, TaskPriority } from '@/shared/types/task';
import { Button } from '@/shared/components/Button';

interface TaskComposerProps {
  onCreate: (input: CreateTaskInput) => Promise<void>;
}

const PRIORITY_OPTIONS: TaskPriority[] = ['none', 'low', 'medium', 'high'];

export function TaskComposer({ onCreate }: TaskComposerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('none');
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
        priority,
        due_date: dueDate || null,
      });
      setTitle('');
      setDueDate('');
      setPriority('none');
      setIsExpanded(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task.');
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
        Add a task
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
        placeholder="What needs doing?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border-0 bg-transparent text-sm font-medium text-(--color-ink) outline-none placeholder:text-(--color-ink-soft)/50"
      />

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-lg border border-(--color-border) bg-(--color-paper) px-2.5 py-1.5 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-sage)"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          className="rounded-lg border border-(--color-border) bg-(--color-paper) px-2.5 py-1.5 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-sage)"
        >
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p === 'none' ? 'No priority' : p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-(--color-error)">{error}</p>}

      <div className="flex items-center gap-2">
        <Button type="submit" isLoading={isSubmitting} disabled={!title.trim()}>
          Add task
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
