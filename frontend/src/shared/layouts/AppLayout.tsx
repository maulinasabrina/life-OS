import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/shared/layouts/Sidebar';
import { Topbar } from '@/shared/layouts/Topbar';

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-full">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-(--color-paper) p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
