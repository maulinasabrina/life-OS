import { Link } from 'react-router-dom';
import type { JournalEntry } from '@/shared/types/journal';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onDelete: () => void;
  onTagClick: (tag: string) => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function JournalEntryCard({ entry, onDelete, onTagClick }: JournalEntryCardProps) {
  const preview = stripHtml(entry.content).slice(0, 180);

  return (
    <article className="group flex flex-col gap-2.5 rounded-2xl border border-(--color-border) bg-(--color-paper-raised) p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-(--color-ink-soft)">{formatDate(entry.entry_date)}</p>
          <Link to={`/journal/${entry.id}`} className="mt-0.5 block">
            <h2 className="font-(family-name:--font-display) text-lg font-semibold text-(--color-ink) hover:text-(--color-sage) transition-colors line-clamp-2">
              {entry.title}
            </h2>
          </Link>
        </div>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete "${entry.title}"`}
          className="shrink-0 rounded-md p-1.5 text-(--color-ink-soft) opacity-0 transition-opacity hover:bg-(--color-error-soft) hover:text-(--color-error) focus-visible:opacity-100 group-hover:opacity-100"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
          </svg>
        </button>
      </div>

      {preview && (
        <p className="line-clamp-2 text-sm text-(--color-ink-soft)">{preview}</p>
      )}

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick(tag)}
              className="rounded-full bg-(--color-sage-soft) px-2.5 py-0.5 text-xs font-medium text-(--color-sage) transition-colors hover:bg-(--color-sage) hover:text-(--color-paper)"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
