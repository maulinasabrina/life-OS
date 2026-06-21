import type { CreateHabitInput, UpdateHabitInput, HabitFrequency } from '../types/habit';
import { ValidationError } from './ValidationError';

const VALID_FREQUENCIES: HabitFrequency[] = ['daily', 'weekly'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function validateCreateHabit(body: unknown): CreateHabitInput {
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('Request body must be an object.');
  }
  const { title, frequency } = body as Record<string, unknown>;

  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new ValidationError('title is required and must be a non-empty string.');
  }
  if (title.length > 200) {
    throw new ValidationError('title must be 200 characters or fewer.');
  }
  if (!VALID_FREQUENCIES.includes(frequency as HabitFrequency)) {
    throw new ValidationError(`frequency must be one of: ${VALID_FREQUENCIES.join(', ')}.`);
  }

  return { title: title.trim(), frequency: frequency as HabitFrequency };
}

export function validateUpdateHabit(body: unknown): UpdateHabitInput {
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('Request body must be an object.');
  }
  const { title, frequency } = body as Record<string, unknown>;

  const result: UpdateHabitInput = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      throw new ValidationError('title must be a non-empty string.');
    }
    if (title.length > 200) {
      throw new ValidationError('title must be 200 characters or fewer.');
    }
    result.title = title.trim();
  }

  if (frequency !== undefined) {
    if (!VALID_FREQUENCIES.includes(frequency as HabitFrequency)) {
      throw new ValidationError(`frequency must be one of: ${VALID_FREQUENCIES.join(', ')}.`);
    }
    result.frequency = frequency as HabitFrequency;
  }

  if (Object.keys(result).length === 0) {
    throw new ValidationError('At least one field must be provided to update.');
  }

  return result;
}

export function validateLogDate(value: unknown): string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value) || Number.isNaN(Date.parse(value))) {
    throw new ValidationError('date must be a valid date in YYYY-MM-DD format.');
  }
  return value;
}

export function validateCompletedFlag(value: unknown): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError('completed must be a boolean.');
  }
  return value;
}

const currentYear = new Date().getUTCFullYear();

export function validateYearParam(value: unknown): number {
  if (value === undefined) return currentYear;
  const year = Number(value);
  if (!Number.isInteger(year) || year < 2000 || year > currentYear + 1) {
    throw new ValidationError('year must be a valid integer year.');
  }
  return year;
}

export function validateMonthParam(value: unknown): number {
  if (value === undefined) return new Date().getUTCMonth() + 1;
  const month = Number(value);
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new ValidationError('month must be an integer between 1 and 12.');
  }
  return month;
}
