import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { useUIStore } from '@/core/store/ui.store';
import { cn } from '@/lib/utils';

export default function AdminLayout() {
  const { sidebarCollapsed, mobileOpen, closeMobileSidebar } = useUIStore();

  // Auto-close mobile drawer when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        closeMobileSidebar();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [closeMobileSidebar]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Mobile backdrop overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      <Sidebar />

      {/* ── Main content ── */}
      <div
        className={cn(
          'flex flex-1 flex-col transition-[margin] duration-300 ease-in-out min-w-0',
          // Mobile: no margin (sidebar is overlay)
          'ml-0 mr-0',
          // Desktop: margin matches sidebar width
          sidebarCollapsed
            ? 'lg:ltr:ml-20 lg:rtl:mr-20'
            : 'lg:ltr:ml-64 lg:rtl:mr-64',
        )}
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
