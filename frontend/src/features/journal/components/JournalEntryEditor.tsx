import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RichTextEditor } from '@/features/journal/components/RichTextEditor';
import { TagsInput } from '@/features/journal/components/TagsInput';
import { ImageGallery } from '@/features/journal/components/ImageGallery';
import { useJournalEntry } from '@/features/journal/hooks/useJournalEntry';
import { createJournalEntry } from '@/features/journal/services/journalService';
import { Button } from '@/shared/components/Button';
import { todayDateString } from '@/shared/utils/date';

interface JournalEntryEditorProps {
  entryId: string | null; // null = new entry mode
  onCreated?: (id: string) => void; // called after a new entry is saved
}

export function JournalEntryEditor({ entryId, onCreated }: JournalEntryEditorProps) {
  const { entry, isLoading, error, isSaving, save, uploadImage, removeImage } =
    useJournalEntry(entryId);

  const navigate = useNavigate();

  // const [title, setTitle] = useState('');
  // const [content, setContent] = useState('');
  // const [entryDate, setEntryDate] = useState(todayDateString());
  // const [tags, setTags] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  // Jalankan ini di paling atas komponen JournalEntryEditor
const [title, setTitle] = useState(entry?.title || '');
const [content, setContent] = useState(entry?.content || '');
const [entryDate, setEntryDate] = useState(entry?.entry_date || todayDateString());
const [tags, setTags] = useState(entry?.tags || []); // sesuaikan default value array

// HAPUS atau comment out blok useEffect yang memicu error kemarin!
/*
useEffect(() => {
  if (entry) { ... }
}, [entry]);
*/

  // Autosave debounce ref
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNew = entryId === null;

  
  // Populate fields once the entry loads
  // useEffect(() => {
  //   if (entry) {
  //     setTitle(entry.title);
  //     setContent(entry.content);
  //     setEntryDate(entry.entry_date);
  //     setTags(entry.tags);
  //   }
  // }, [entry]);
  

  // Autosave for existing entries (not new ones — those need an explicit save)
  useEffect(() => {
    if (isNew || !entry) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      save({ title, content, entry_date: entryDate, tags }).catch(() => {
        // silent — the save button is still visible for manual retry
      });
    }, 1500);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, entryDate, tags]);

  async function handleSave() {
    setLocalError(null);
    if (!title.trim()) {
      setLocalError('Please add a title before saving.');
      return;
    }
    if (isNew) {
      try {
        const created = await createJournalEntry({
          title: title.trim(),
          content,
          entry_date: entryDate,
          tags,
        });
        onCreated?.(created.id);
        navigate(`/journal/${created.id}`, { replace: true });
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Failed to create entry.');
      }
    } else {
      await save({ title, content, entry_date: entryDate, tags });
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-xl bg-(--color-paper-raised)" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-(--color-error)">{error}</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Title */}
      <input
        type="text"
        placeholder="Entry title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border-0 bg-transparent font-(family-name:--font-display) text-2xl font-semibold text-(--color-ink) outline-none placeholder:text-(--color-ink-soft)/40 md:text-3xl"
      />

      {/* Date + tags row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <input
          type="date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          className="w-40 rounded-lg border border-(--color-border) bg-(--color-paper-raised) px-3 py-2 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-sage)"
        />
        <div className="flex-1">
          <TagsInput tags={tags} onChange={setTags} />
        </div>
      </div>

      {/* Rich text editor */}
      <RichTextEditor
        content={content}
        onChange={setContent}
        placeholder="What happened today? How are you feeling? Anything on your mind…"
      />

      {/* Image gallery — only available on saved entries */}
      {!isNew && entry && (
        <div className="rounded-xl border border-(--color-border) bg-(--color-paper-raised) p-4">
          <ImageGallery
            images={entry.images}
            onUpload={uploadImage}
            onDelete={removeImage}
          />
        </div>
      )}

      {isNew && (
        <p className="text-xs text-(--color-ink-soft)">
          Save the entry first, then you'll be able to attach images.
        </p>
      )}

      {(localError) && (
        <p role="alert" className="text-sm text-(--color-error)">
          {localError}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} isLoading={isSaving}>
          {isNew ? 'Save entry' : isSaving ? 'Saving…' : 'Saved'}
        </Button>
        <Button variant="secondary" onClick={() => navigate('/journal')}>
          Back to journal
        </Button>
      </div>
    </div>
  );
}
