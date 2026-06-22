// import { JournalEntryEditor } from '@/features/journal/components/JournalEntryEditor';

export function JournalNewPage() {
  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-(family-name:--font-display) text-xl font-semibold text-(--color-ink-soft)">
          New entry
        </h1>
      </div>
      {/* <JournalEntryEditor entryId={null} /> */}
    </div>
  );
}
