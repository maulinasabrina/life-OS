import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { signOut } from '@/features/auth/services/authService';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    await signOut();
    navigate('/login', { replace: true });
  }

  const initial = user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <header className="flex h-16 items-center justify-between border-b border-(--color-border) bg-(--color-paper-raised) px-4 md:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-(--color-ink) hover:bg-(--color-sage-soft) md:hidden"
        aria-label="Open menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      <div className="hidden md:block" />

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsMenuOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-(--color-sage) text-sm font-semibold text-(--color-paper) transition-opacity hover:opacity-90"
          aria-haspopup="true"
          aria-expanded={isMenuOpen}
          aria-label="User menu"
        >
          {initial}
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-(--color-border) bg-(--color-paper-raised) p-1.5 shadow-lg">
            <div className="truncate px-3 py-2 text-sm text-(--color-ink-soft)">
              {user?.email}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-(--color-ink) hover:bg-(--color-sage-soft)"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
