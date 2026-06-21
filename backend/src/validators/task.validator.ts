import type { CreateTaskInput, UpdateTaskInput, TaskPriority, TaskStatus } from '../types/task';

const VALID_PRIORITIES: TaskPriority[] = ['none', 'low', 'medium', 'high'];
const VALID_STATUSES: TaskStatus[] = ['todo', 'pending', 'completed', 'overdue'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

function assertValidDate(value: unknown, field: string): void {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value) || Number.isNaN(Date.parse(value))) {
    throw new ValidationError(`${field} must be a valid date in YYYY-MM-DD format.`);
  }
}

export function validateCreateTask(body: unknown): CreateTaskInput {
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('Request body must be an object.');
  }
  const { title, description, priority, due_date } = body as Record<string, unknown>;

  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new ValidationError('title is required and must be a non-empty string.');
  }
  if (title.length > 200) {
    throw new ValidationError('title must be 200 characters or fewer.');
  }
  if (description !== undefined && description !== null && typeof description !== 'string') {
    throw new ValidationError('description must be a string.');
  }
  if (priority !== undefined && !VALID_PRIORITIES.includes(priority as TaskPriority)) {
    throw new ValidationError(`priority must be one of: ${VALID_PRIORITIES.join(', ')}.`);
  }
  if (due_date !== undefined && due_date !== null) {
    assertValidDate(due_date, 'due_date');
  }

  return {
    title: title.trim(),
    description: (description as string | null | undefined) ?? null,
    priority: (priority as TaskPriority | undefined) ?? 'none',
    due_date: (due_date as string | null | undefined) ?? null,
  };
}

export function validateUpdateTask(body: unknown): UpdateTaskInput {
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('Request body must be an object.');
  }
  const { title, description, status, priority, due_date } = body as Record<string, unknown>;

  const result: UpdateTaskInput = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      throw new ValidationError('title must be a non-empty string.');
    }
    if (title.length > 200) {
      throw new ValidationError('title must be 200 characters or fewer.');
    }
    result.title = title.trim();
  }

  if (description !== undefined) {
    if (description !== null && typeof description !== 'string') {
      throw new ValidationError('description must be a string or null.');
    }
    result.description = description as string | null;
  }

  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status as TaskStatus)) {
      throw new ValidationError(`status must be one of: ${VALID_STATUSES.join(', ')}.`);
    }
    result.status = status as TaskStatus;
  }

  if (priority !== undefined) {
    if (!VALID_PRIORITIES.includes(priority as TaskPriority)) {
      throw new ValidationError(`priority must be one of: ${VALID_PRIORITIES.join(', ')}.`);
    }
    result.priority = priority as TaskPriority;
  }

  if (due_date !== undefined) {
    if (due_date !== null) {
      assertValidDate(due_date, 'due_date');
    }
    result.due_date = due_date as string | null;
  }

  if (Object.keys(result).length === 0) {
    throw new ValidationError('At least one field must be provided to update.');
  }

  return result;
}

export function validateCreateQuickTask(body: unknown): { title: string } {
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('Request body must be an object.');
  }
  const { title } = body as Record<string, unknown>;

  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new ValidationError('title is required and must be a non-empty string.');
  }
  if (title.length > 200) {
    throw new ValidationError('title must be 200 characters or fewer.');
  }

  return { title: title.trim() };
}
