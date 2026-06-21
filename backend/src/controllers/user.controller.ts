import type { Request, Response } from 'express';
import { getUserProfileById } from '../services/user.service';

/**
 * GET /api/users/me
 * Returns the authenticated user's profile. req.user is guaranteed to be
 * set here because this route is mounted behind requireAuth.
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  const authUser = req.user!;

  const profile = await getUserProfileById(authUser.id);

  if (!profile) {
    // Signup trigger may not have run yet — treat as not-found rather
    // than a server error so the frontend can retry/poll if needed.
    res.status(404).json({ error: 'User profile not yet available.' });
    return;
  }

  res.status(200).json({ user: profile });
}
