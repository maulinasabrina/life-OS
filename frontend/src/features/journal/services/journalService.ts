import { apiFetch } from '@/shared/services/apiClient';
import { supabase } from '@/shared/services/supabaseClient';
import type {
  CreateJournalEntryInput,
  JournalEntry,
  JournalEntryWithImages,
  JournalImage,
  UpdateJournalEntryInput,
} from '@/shared/types/journal';

export async function fetchJournalEntries(params?: {
  search?: string;
  tag?: string;
}): Promise<JournalEntry[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.tag) query.set('tag', params.tag);
  const qs = query.toString();
  const { entries } = await apiFetch<{ entries: JournalEntry[] }>(
    `/journal${qs ? `?${qs}` : ''}`
  );
  return entries;
}

export async function fetchJournalEntry(id: string): Promise<JournalEntryWithImages> {
  const { entry } = await apiFetch<{ entry: JournalEntryWithImages }>(`/journal/${id}`);
  return entry;
}

export async function createJournalEntry(
  input: CreateJournalEntryInput
): Promise<JournalEntry> {
  const { entry } = await apiFetch<{ entry: JournalEntry }>('/journal', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return entry;
}

export async function updateJournalEntry(
  id: string,
  input: UpdateJournalEntryInput
): Promise<JournalEntry> {
  const { entry } = await apiFetch<{ entry: JournalEntry }>(`/journal/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return entry;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  await apiFetch<void>(`/journal/${id}`, { method: 'DELETE' });
}

/**
 * Uploads an image via multipart/form-data. We call the backend (not
 * Supabase Storage directly) so the backend can verify entry ownership
 * before accepting the upload.
 */
export async function uploadJournalImage(
  entryId: string,
  file: File
): Promise<JournalImage> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('No active session.');

  const formData = new FormData();
  formData.append('image', file);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const response = await fetch(`${apiBaseUrl}/journal/${entryId}/images`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    // Don't set Content-Type — the browser sets it with the boundary automatically
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Image upload failed with status ${response.status}`);
  }

  const { image } = await response.json();
  return image;
}

export async function deleteJournalImage(entryId: string, imageId: string): Promise<void> {
  await apiFetch<void>(`/journal/${entryId}/images/${imageId}`, { method: 'DELETE' });
}
