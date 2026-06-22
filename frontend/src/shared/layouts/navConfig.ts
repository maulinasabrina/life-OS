export interface NavItem {
  label: string;
  path: string;
  available: boolean;
  icon: 'dashboard' | 'tasks' | 'habits' | 'journal' | 'analytics' | 'moodboard';
}

/**
 * Single source of truth for sidebar navigation.
 * `available` reflects what's actually built per the roadmap —
 * update this as later phases ship rather than hardcoding in the Sidebar.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', available: true, icon: 'dashboard' },
  { label: 'Tasks', path: '/tasks', available: true, icon: 'tasks' },
  { label: 'Habits', path: '/habits', available: true, icon: 'habits' },
  { label: 'Journal', path: '/journal', available: true, icon: 'journal' },
  { label: 'Analytics', path: '/analytics', available: false, icon: 'analytics' },
  { label: 'Moodboard', path: '/moodboard', available: false, icon: 'moodboard' },
];
