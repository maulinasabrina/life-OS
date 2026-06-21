import type { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../validators/ValidationError';

/**
 * Catches errors passed via next(err) or thrown in async route handlers
 * wrapped with asyncHandler. ValidationError maps to 400; everything else
 * is treated as an unexpected server error (500).
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
    return;
  }

  console.error(err);

  const message = err instanceof Error ? err.message : 'Unexpected server error.';

  res.status(500).json({ error: message });
}

/**
 * Wraps an async route/controller handler so rejected promises are
 * forwarded to Express's error handler instead of crashing the process.
 */
export function asyncHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
