import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '@/shared/layouts/navConfig';
import { NavIcon } from '@/shared/layouts/NavIcon';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile scrim, shown only when the drawer is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-(--color-ink)/30 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-(--color-border) bg-(--color-paper-raised) transition-transform duration-200 md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Primary"
      >
        <div className="flex h-16 items-center px-6">
          <span className="font-(family-name:--font-display) text-lg font-semibold text-(--color-ink)">
            Life OS
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) =>
            item.available ? (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-(--color-sage-soft) text-(--color-sage)'
                      : 'text-(--color-ink-soft) hover:bg-(--color-sage-soft)/60 hover:text-(--color-ink)'
                  }`
                }
              >
                <NavIcon icon={item.icon} />
                {item.label}
              </NavLink>
            ) : (
              <div
                key={item.path}
                aria-disabled="true"
                title={`${item.label} arrives in a later phase`}
                className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-(--color-ink-soft)/45"
              >
                <span className="flex items-center gap-3">
                  <NavIcon icon={item.icon} className="text-(--color-ink-soft)/45" />
                  {item.label}
                </span>
                <span className="rounded-full border border-dashed border-(--color-border) px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                  Soon
                </span>
              </div>
            )
          )}
        </nav>
      </aside>
    </>
  );
}
