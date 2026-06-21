import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../configs/supabaseAdmin';

/**
 * Verifies the bearer token from the Authorization header against Supabase
 * and attaches the resolved user to req.user. Responds 401 if the header
 * is missing/malformed or the token is invalid/expired.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header.' });
    return;
  }

  const token = authHeader.slice('Bearer '.length);

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid or expired session.' });
    return;
  }

  req.user = data.user;
  next();
}
