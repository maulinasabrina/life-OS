import type { Request } from 'express';
import { ValidationError } from '../validators/ValidationError';

/**
 * Express 5 types req.params values as string | string[] for routes that
 * could match repeated segments. Our routes never do that, so this just
 * narrows the type and fails loudly if something unexpected comes through.
 */
export function getParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== 'string') {
    throw new ValidationError(`Missing or invalid route parameter: ${name}.`);
  }
  return value;
}
