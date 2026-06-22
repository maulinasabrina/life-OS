import { useCallback, useEffect, useState } from 'react';
import * as journalService from '@/features/journal/services/journalService';
import type { JournalEntryWithImages, JournalImage } from '@/shared/types/journal';

interface UseJournalEntryResult {
  entry: JournalEntryWithImages | null;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
  save: (fields: {
    title: string;
    content: string;
    entry_date: string;
    tags: string[];
  }) => Promise<void>;
  uploadImage: (file: File) => Promise<JournalImage>;
  removeImage: (imageId: string) => Promise<void>;
}

export function useJournalEntry(entryId: string | null): UseJournalEntryResult {
  const [entry, setEntry] = useState<JournalEntryWithImages | null>(null);
  const [isLoading, setIsLoading] = useState(entryId !== null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!entryId) {
      setIsLoading(false);
      return;
    }
    let isMounted = true;
    setIsLoading(true);
    journalService
      .fetchJournalEntry(entryId)
      .then((data) => {
        if (isMounted) setEntry(data);
      })
      .catch((err) => {
        if (isMounted)
          setError(err instanceof Error ? err.message : 'Failed to load entry.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [entryId]);

  const save = useCallback(
    async (fields: {
      title: string;
      content: string;
      entry_date: string;
      tags: string[];
    }) => {
      setIsSaving(true);
      try {
        if (entryId) {
          const updated = await journalService.updateJournalEntry(entryId, fields);
          setEntry((prev) => (prev ? { ...prev, ...updated } : null));
        }
      } finally {
        setIsSaving(false);
      }
    },
    [entryId]
  );

  const uploadImage = useCallback(
    async (file: File): Promise<JournalImage> => {
      if (!entryId) throw new Error('Cannot upload image before saving the entry.');
      const image = await journalService.uploadJournalImage(entryId, file);
      setEntry((prev) =>
        prev ? { ...prev, images: [...prev.images, image] } : null
      );
      return image;
    },
    [entryId]
  );

  const removeImage = useCallback(
    async (imageId: string) => {
      if (!entryId) return;
      await journalService.deleteJournalImage(entryId, imageId);
      setEntry((prev) =>
        prev ? { ...prev, images: prev.images.filter((i) => i.id !== imageId) } : null
      );
    },
    [entryId]
  );

  return { entry, isLoading, error, isSaving, save, uploadImage, removeImage };
}
