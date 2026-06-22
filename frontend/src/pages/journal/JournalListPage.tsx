import { Link } from 'react-router-dom';
import { useJournal } from '@/features/journal/hooks/useJournal';
import { JournalEntryCard } from '@/features/journal/components/JournalEntryCard';

export function JournalListPage() {
  const {
    entries,
    isLoading,
    error,
    search,
    setSearch,
    activeTag,
    setActiveTag,
    removeEntry,
  } = useJournal();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-(family-name:--font-display) text-2xl font-semibold text-(--color-ink) md:text-3xl">
            Journal
          </h1>
          <p className="text-(--color-ink-soft)">
            A private space to write, reflect, and remember.
          </p>
        </div>
        <Link
          to="/journal/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-(--color-ink) px-4 py-2.5 text-sm font-medium text-(--color-paper) transition-opacity hover:opacity-90"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New entry
        </Link>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-ink-soft)"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search entries…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-paper-raised) py-2.5 pl-9 pr-4 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-sage)"
          />
        </div>

        {activeTag && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-(--color-ink-soft)">Filtering by tag:</span>
            <button
              type="button"
              onClick={() => setActiveTag('')}
              className="inline-flex items-center gap-1 rounded-full bg-(--color-sage) px-3 py-0.5 text-xs font-medium text-(--color-paper)"
            >
              {activeTag}
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M2 2l8 8M10 2l-8 8" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {error && <p role="alert" className="text-sm text-(--color-error)">{error}</p>}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-(--color-border) bg-(--color-paper-raised)" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-(--color-border) px-6 py-16 text-center">
          <p className="text-sm text-(--color-ink-soft)">
            {search || activeTag
              ? 'No entries match your search.'
              : 'No entries yet.'}
          </p>
          {!search && !activeTag && (
            <Link
              to="/journal/new"
              className="mt-3 inline-block text-sm font-medium text-(--color-ink) underline underline-offset-2"
            >
              Write your first entry
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {entries.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onDelete={() => removeEntry(entry.id)}
              onTagClick={setActiveTag}
            />
          ))}
        </div>
      )}
    </div>
  );
}
