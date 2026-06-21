import { apiFetch } from '@/shared/services/apiClient';
import type { UserProfile } from '@/shared/types/user';

export async function getCurrentUserProfile(): Promise<UserProfile> {
  const { user } = await apiFetch<{ user: UserProfile }>('/users/me');
  return user;
}
