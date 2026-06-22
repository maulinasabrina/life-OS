import type {
  CreateRecurringTaskInput,
  RecurrenceType,
  UpdateRecurringTaskInput,
} from '../types/recurringTask';
import { ValidationError } from './ValidationError';

const VALID_RECURRENCE_TYPES: RecurrenceType[] = ['daily', 'weekly', 'monthly'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function assertValidDate(value: unknown, field: string): void {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value) || Number.isNaN(Date.parse(value))) {
    throw new ValidationError(`${field} must be a valid date in YYYY-MM-DD format.`);
  }
}

function assertValidInterval(value: unknown): void {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 365) {
    throw new ValidationError('recurrence_interval must be an integer between 1 and 365.');
  }
}

export function validateCreateRecurringTask(body: unknown): CreateRecurringTaskInput {
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('Request body must be an object.');
  }
  const { title, recurrence_type, recurrence_interval, start_date } = body as Record<
    string,
    unknown
  >;

  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new ValidationError('title is required and must be a non-empty string.');
  }
  if (title.length > 200) {
    throw new ValidationError('title must be 200 characters or fewer.');
  }
  if (!VALID_RECURRENCE_TYPES.includes(recurrence_type as RecurrenceType)) {
    throw new ValidationError(
      `recurrence_type must be one of: ${VALID_RECURRENCE_TYPES.join(', ')}.`
    );
  }
  assertValidInterval(recurrence_interval);
  assertValidDate(start_date, 'start_date');

  return {
    title: title.trim(),
    recurrence_type: recurrence_type as RecurrenceType,
    recurrence_interval: recurrence_interval as number,
    start_date: start_date as string,
  };
}

export function validateUpdateRecurringTask(body: unknown): UpdateRecurringTaskInput {
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('Request body must be an object.');
  }
  const { title, recurrence_type, recurrence_interval, start_date, active } = body as Record<
    string,
    unknown
  >;

  const result: UpdateRecurringTaskInput = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      throw new ValidationError('title must be a non-empty string.');
    }
    if (title.length > 200) {
      throw new ValidationError('title must be 200 characters or fewer.');
    }
    result.title = title.trim();
  }

  if (recurrence_type !== undefined) {
    if (!VALID_RECURRENCE_TYPES.includes(recurrence_type as RecurrenceType)) {
      throw new ValidationError(
        `recurrence_type must be one of: ${VALID_RECURRENCE_TYPES.join(', ')}.`
      );
    }
    result.recurrence_type = recurrence_type as RecurrenceType;
  }

  if (recurrence_interval !== undefined) {
    assertValidInterval(recurrence_interval);
    result.recurrence_interval = recurrence_interval as number;
  }

  if (start_date !== undefined) {
    assertValidDate(start_date, 'start_date');
    result.start_date = start_date as string;
  }

  if (active !== undefined) {
    if (typeof active !== 'boolean') {
      throw new ValidationError('active must be a boolean.');
    }
    result.active = active;
  }

  if (Object.keys(result).length === 0) {
    throw new ValidationError('At least one field must be provided to update.');
  }

  return result;
}
