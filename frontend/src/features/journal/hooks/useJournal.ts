import { useCallback, useEffect, useState } from 'react';
import * as journalService from '@/features/journal/services/journalService';
import type { JournalEntry } from '@/shared/types/journal';

interface UseJournalResult {
  entries: JournalEntry[];
  isLoading: boolean;
  error: string | null;
  search: string;
  setSearch: (q: string) => void;
  activeTag: string;
  setActiveTag: (tag: string) => void;
  removeEntry: (id: string) => Promise<void>;
}

export function useJournal(): UseJournalResult {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');

  // Debounce search so we don't fire on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async (q: string, tag: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await journalService.fetchJournalEntries({
        search: q || undefined,
        tag: tag || undefined,
      });
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load journal entries.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load(debouncedSearch, activeTag);
  }, [load, debouncedSearch, activeTag]);

  const removeEntry = useCallback(async (id: string) => {
    await journalService.deleteJournalEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return {
    entries,
    isLoading,
    error,
    search,
    setSearch,
    activeTag,
    setActiveTag,
    removeEntry,
  };
}
