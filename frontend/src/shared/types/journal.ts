export interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string; // HTML from Tiptap
  entry_date: string; // YYYY-MM-DD
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface JournalImage {
  id: string;
  journal_entry_id: string;
  image_url: string; // signed URL, valid for 1 hour
  storage_path: string;
  created_at: string;
}

export interface JournalEntryWithImages extends JournalEntry {
  images: JournalImage[];
}

export interface CreateJournalEntryInput {
  title: string;
  content?: string;
  entry_date: string;
  tags?: string[];
}

export interface UpdateJournalEntryInput {
  title?: string;
  content?: string;
  entry_date?: string;
  tags?: string[];
}
