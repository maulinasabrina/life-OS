import { supabaseAdmin } from '../configs/supabaseAdmin';
import type {
  CreateJournalEntryInput,
  JournalEntry,
  JournalEntryWithImages,
  JournalImage,
  UpdateJournalEntryInput,
} from '../types/journal';

const BUCKET = 'journal-images';
// Signed URLs expire after 1 hour. The frontend should refetch or
// re-request if it needs to display images after that window.
const SIGNED_URL_TTL_SECONDS = 3600;

/**
 * Converts a storage_path to a signed URL so the frontend can display
 * the image without the bucket being public.
 */
async function signImageUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to sign image URL: ${error?.message ?? 'unknown error'}`);
  }

  return data.signedUrl;
}

async function attachSignedUrls(images: JournalImage[]): Promise<JournalImage[]> {
  return Promise.all(
    images.map(async (img) => ({
      ...img,
      image_url: await signImageUrl(img.storage_path),
    }))
  );
}

export interface ListJournalOptions {
  search?: string;
  tag?: string;
}

export async function listJournalEntries(
  userId: string,
  options: ListJournalOptions = {}
): Promise<JournalEntry[]> {
  let query = supabaseAdmin
    .from('journal_entries')
    .select('id, user_id, title, content, entry_date, tags, created_at, updated_at')
    .eq('user_id', userId)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (options.search) {
    // Use Postgres full-text search via the generated search_vector column.
    // websearch_to_tsquery handles phrases, negation, and OR naturally, so
    // the user doesn't need to know tsquery syntax.
    query = query.textSearch('search_vector', options.search, {
      type: 'websearch',
      config: 'english',
    });
  }

  if (options.tag) {
    // Postgres array contains operator: tags @> ARRAY[tag]
    query = query.contains('tags', [options.tag.toLowerCase()]);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list journal entries: ${error.message}`);
  }

  return data ?? [];
}

export async function getJournalEntry(
  userId: string,
  entryId: string
): Promise<JournalEntryWithImages | null> {
  const { data: entry, error: entryError } = await supabaseAdmin
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('id', entryId)
    .single();

  if (entryError) {
    if (entryError.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch journal entry: ${entryError.message}`);
  }

  const { data: images, error: imagesError } = await supabaseAdmin
    .from('journal_images')
    .select('*')
    .eq('journal_entry_id', entryId)
    .order('created_at', { ascending: true });

  if (imagesError) {
    throw new Error(`Failed to fetch journal images: ${imagesError.message}`);
  }

  const signedImages = await attachSignedUrls(images ?? []);

  return { ...entry, images: signedImages };
}

export async function createJournalEntry(
  userId: string,
  input: CreateJournalEntryInput
): Promise<JournalEntry> {
  const { data, error } = await supabaseAdmin
    .from('journal_entries')
    .insert({
      user_id: userId,
      title: input.title,
      content: input.content ?? '',
      entry_date: input.entry_date,
      tags: input.tags ?? [],
    })
    .select('id, user_id, title, content, entry_date, tags, created_at, updated_at')
    .single();

  if (error) {
    throw new Error(`Failed to create journal entry: ${error.message}`);
  }

  return data;
}

export async function updateJournalEntry(
  userId: string,
  entryId: string,
  input: UpdateJournalEntryInput
): Promise<JournalEntry | null> {
  const { data, error } = await supabaseAdmin
    .from('journal_entries')
    .update(input)
    .eq('user_id', userId)
    .eq('id', entryId)
    .select('id, user_id, title, content, entry_date, tags, created_at, updated_at')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to update journal entry: ${error.message}`);
  }

  return data;
}

export async function deleteJournalEntry(userId: string, entryId: string): Promise<boolean> {
  // Fetch image storage paths before deleting the row (cascade will remove
  // the journal_images rows, but we need to clean up Storage objects too).
  const { data: images } = await supabaseAdmin
    .from('journal_images')
    .select('storage_path')
    .eq('journal_entry_id', entryId);

  if (images && images.length > 0) {
    const paths = images.map((img) => img.storage_path);
    const { error: storageError } = await supabaseAdmin.storage
      .from(BUCKET)
      .remove(paths);
    if (storageError) {
      throw new Error(`Failed to delete journal images from storage: ${storageError.message}`);
    }
  }

  const { error, count } = await supabaseAdmin
    .from('journal_entries')
    .delete({ count: 'exact' })
    .eq('user_id', userId)
    .eq('id', entryId);

  if (error) {
    throw new Error(`Failed to delete journal entry: ${error.message}`);
  }

  return (count ?? 0) > 0;
}

/**
 * Uploads an image file to Supabase Storage under the path
 * `userId/entryId/filename`, inserts a journal_images row, and returns
 * the row with a fresh signed URL.
 */
export async function uploadJournalImage(
  userId: string,
  entryId: string,
  fileBuffer: Buffer,
  originalFileName: string,
  mimeType: string
): Promise<JournalImage> {
  // Verify the entry belongs to this user before uploading.
  const { data: entry, error: entryError } = await supabaseAdmin
    .from('journal_entries')
    .select('id')
    .eq('id', entryId)
    .eq('user_id', userId)
    .maybeSingle();

  if (entryError) {
    throw new Error(`Failed to verify journal entry ownership: ${entryError.message}`);
  }
  if (!entry) {
    throw new Error('ENTRY_NOT_FOUND');
  }

  // Sanitise the filename and make it unique to avoid collisions.
  const ext = originalFileName.split('.').pop()?.toLowerCase() ?? 'jpg';
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const storagePath = `${userId}/${entryId}/${uniqueName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: false });

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  const { data: imageRow, error: insertError } = await supabaseAdmin
    .from('journal_images')
    .insert({ journal_entry_id: entryId, image_url: '', storage_path: storagePath })
    .select('*')
    .single();

  if (insertError) {
    // Best-effort cleanup of the just-uploaded file.
    await supabaseAdmin.storage.from(BUCKET).remove([storagePath]);
    throw new Error(`Failed to save image record: ${insertError.message}`);
  }

  const signedUrl = await signImageUrl(storagePath);
  return { ...imageRow, image_url: signedUrl };
}

export async function deleteJournalImage(
  userId: string,
  entryId: string,
  imageId: string
): Promise<boolean> {
  // Verify ownership via the parent entry.
  const { data: image, error: fetchError } = await supabaseAdmin
    .from('journal_images')
    .select('id, storage_path, journal_entry_id')
    .eq('id', imageId)
    .eq('journal_entry_id', entryId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Failed to fetch journal image: ${fetchError.message}`);
  }
  if (!image) return false;

  // Verify the entry belongs to this user.
  const { data: entry } = await supabaseAdmin
    .from('journal_entries')
    .select('id')
    .eq('id', entryId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!entry) return false;

  await supabaseAdmin.storage.from(BUCKET).remove([image.storage_path]);

  const { error: deleteError, count } = await supabaseAdmin
    .from('journal_images')
    .delete({ count: 'exact' })
    .eq('id', imageId);

  if (deleteError) {
    throw new Error(`Failed to delete image record: ${deleteError.message}`);
  }

  return (count ?? 0) > 0;
}
