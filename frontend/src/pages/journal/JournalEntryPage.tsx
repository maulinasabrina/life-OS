import { useParams, Navigate } from 'react-router-dom';
import { JournalEntryEditor } from '@/features/journal/components/JournalEntryEditor';

export function JournalEntryPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) return <Navigate to="/journal" replace />;

  return (
    <div className="mx-auto max-w-3xl">
      <JournalEntryEditor entryId={id} />
    </div>
  );
}
