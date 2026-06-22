import type {
  CreateJournalEntryInput,
  UpdateJournalEntryInput,
} from '../types/journal';
import { ValidationError } from './ValidationError';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function assertValidDate(value: unknown, field: string): void {
  if (
    typeof value !== 'string' ||
    !DATE_PATTERN.test(value) ||
    Number.isNaN(Date.parse(value))
  ) {
    throw new ValidationError(`${field} must be a valid date in YYYY-MM-DD format.`);
  }
}

function parseTags(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    throw new ValidationError('tags must be an array of strings.');
  }
  return value.map((t, i) => {
    if (typeof t !== 'string') {
      throw new ValidationError(`tags[${i}] must be a string.`);
    }
    return t.trim().toLowerCase();
  }).filter(Boolean);
}

export function validateCreateJournalEntry(body: unknown): CreateJournalEntryInput {
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('Request body must be an object.');
  }
  const { title, content, entry_date, tags } = body as Record<string, unknown>;

  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new ValidationError('title is required and must be a non-empty string.');
  }
  if (title.length > 300) {
    throw new ValidationError('title must be 300 characters or fewer.');
  }
  assertValidDate(entry_date, 'entry_date');
  if (content !== undefined && typeof content !== 'string') {
    throw new ValidationError('content must be a string.');
  }

  return {
    title: title.trim(),
    content: typeof content === 'string' ? content : '',
    entry_date: entry_date as string,
    tags: parseTags(tags),
  };
}

export function validateUpdateJournalEntry(body: unknown): UpdateJournalEntryInput {
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('Request body must be an object.');
  }
  const { title, content, entry_date, tags } = body as Record<string, unknown>;
  const result: UpdateJournalEntryInput = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      throw new ValidationError('title must be a non-empty string.');
    }
    if (title.length > 300) {
      throw new ValidationError('title must be 300 characters or fewer.');
    }
    result.title = title.trim();
  }
  if (content !== undefined) {
    if (typeof content !== 'string') {
      throw new ValidationError('content must be a string.');
    }
    result.content = content;
  }
  if (entry_date !== undefined) {
    assertValidDate(entry_date, 'entry_date');
    result.entry_date = entry_date as string;
  }
  if (tags !== undefined) {
    result.tags = parseTags(tags);
  }
  if (Object.keys(result).length === 0) {
    throw new ValidationError('At least one field must be provided to update.');
  }

  return result;
}

export function validateSearchQuery(value: unknown): string | undefined {
  if (value === undefined || value === '') return undefined;
  if (typeof value !== 'string') {
    throw new ValidationError('search must be a string.');
  }
  return value.trim().slice(0, 200); // cap length, don't error on long queries
}
