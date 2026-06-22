import { useRef, useState } from 'react';
import type { JournalImage } from '@/shared/types/journal';

interface ImageGalleryProps {
  images: JournalImage[];
  onUpload: (file: File) => Promise<JournalImage>;
  onDelete: (imageId: string) => Promise<void>;
}

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/gif';

export function ImageGallery({ images, onUpload, onDelete }: ImageGalleryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
      // Reset so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-(--color-ink-soft)">
          Images ({images.length})
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-paper-raised) px-3 py-1.5 text-sm font-medium text-(--color-ink) transition-colors hover:bg-(--color-sage-soft) disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
              Uploading…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Add image
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload image"
        />
      </div>

      {error && <p className="text-sm text-(--color-error)">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((img) => (
            <div key={img.id} className="group relative overflow-hidden rounded-xl">
              <img
                src={img.image_url}
                alt="Journal attachment"
                className="h-32 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onDelete(img.id)}
                aria-label="Delete image"
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-(--color-ink)/70 text-(--color-paper) opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M2 2l8 8M10 2l-8 8" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
