import { useState, type FormEvent } from 'react';
import { useQuickTasks } from '@/features/tasks/hooks/useQuickTasks';
import { TaskCheckbox } from '@/features/tasks/components/TaskCheckbox';

export function QuickTaskInbox() {
  const { quickTasks, isLoading, error, addQuickTask, toggleQuickTask, removeQuickTask } =
    useQuickTasks();
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await addQuickTask(title.trim());
      setTitle('');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-(--color-border) bg-(--color-paper-raised) p-5">
      <div>
        <h2 className="font-(family-name:--font-display) text-lg font-semibold text-(--color-ink)">
          Quick capture
        </h2>
        <p className="text-sm text-(--color-ink-soft)">
          Jot it down before you lose it. Sort it out later.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Type and hit enter…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-(--color-border) bg-(--color-paper) px-3 py-2 text-sm text-(--color-ink) outline-none placeholder:text-(--color-ink-soft)/50 focus-visible:border-(--color-sage)"
        />
        <button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          aria-label="Add quick task"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-ink) text-(--color-paper) transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </form>

      {error && <p className="text-sm text-(--color-error)">{error}</p>}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-9 animate-pulse rounded-lg bg-(--color-paper)" />
          ))}
        </div>
      ) : quickTasks.length === 0 ? (
        <p className="py-4 text-center text-sm text-(--color-ink-soft)">
          Your inbox is empty.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {quickTasks.map((qt) => (
            <li key={qt.id} className="group flex items-center gap-2.5 rounded-lg px-1 py-1.5">
              <TaskCheckbox
                checked={qt.completed}
                onChange={(completed) => toggleQuickTask(qt.id, completed)}
                label={qt.title}
              />
              <span
                className={`min-w-0 flex-1 truncate text-sm text-(--color-ink) ${
                  qt.completed ? 'text-(--color-ink-soft) line-through' : ''
                }`}
              >
                {qt.title}
              </span>
              <button
                type="button"
                onClick={() => removeQuickTask(qt.id)}
                aria-label={`Delete "${qt.title}"`}
                className="shrink-0 rounded-md p-1 text-(--color-ink-soft) opacity-0 transition-opacity hover:bg-(--color-error-soft) hover:text-(--color-error) focus-visible:opacity-100 group-hover:opacity-100"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
