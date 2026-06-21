import type { NavItem } from '@/shared/layouts/navConfig';

interface NavIconProps {
  icon: NavItem['icon'];
  className?: string;
}

/**
 * Small line-icon set for sidebar nav. Kept as inline SVG rather than an
 * icon library dependency since the set is small and fixed for Phase 1.
 */
export function NavIcon({ icon, className }: NavIconProps) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };

  switch (icon) {
    case 'dashboard':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      );
    case 'tasks':
      return (
        <svg {...common}>
          <path d="M9 11l2 2 4-4" />
          <rect x="3" y="3" width="18" height="18" rx="2.5" />
        </svg>
      );
    case 'habits':
      return (
        <svg {...common}>
          <path d="M12 2a7 7 0 0 0-7 7c0 4 3 6 7 13 4-7 7-9 7-13a7 7 0 0 0-7-7z" />
          <circle cx="12" cy="9" r="2.2" />
        </svg>
      );
    case 'journal':
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case 'analytics':
      return (
        <svg {...common}>
          <path d="M3 3v18h18" />
          <path d="M7 16l4-5 3 3 5-7" />
        </svg>
      );
    case 'moodboard':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2.5" />
          <circle cx="8.5" cy="8.5" r="1.75" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      );
  }
}
