import type { Request, Response, NextFunction } from 'express';

/**
 * Catches errors passed via next(err) or thrown in async route handlers
 * wrapped with asyncHandler. Kept generic for Phase 1; expand with
 * typed error classes (NotFoundError, ValidationError, etc.) as the
 * app grows in later phases.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
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
