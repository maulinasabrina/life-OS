import multer from 'multer';
import { ValidationError } from '../validators/ValidationError';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Stores the file in memory (as req.file.buffer) before we forward it to
 * Supabase Storage. 10 MB limit; JPEG/PNG/WebP/GIF only.
 */
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ValidationError(
          `Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, GIF.`
        ) as unknown as null,
        false
      );
    }
  },
});
