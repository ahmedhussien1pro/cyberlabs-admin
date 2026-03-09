import { Link, useLocation } from 'react-router-dom';
import { useUIStore } from '@/core/store/ui.store';
import { ROUTES } from '@/shared/constants';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/shared/components/common/Logo';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FlaskConical,
  Map,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const location = useLocation();
  const {
    sidebarCollapsed,
    toggleSidebar,
    mobileOpen,
    closeMobileSidebar,
  } = useUIStore();
  const { t } = useTranslation('common');

  const navItems = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), path: ROUTES.DASHBOARD },
    { icon: Users,           label: t('nav.users'),     path: ROUTES.USERS },
    { icon: BookOpen,        label: t('nav.courses'),   path: ROUTES.COURSES },
    { icon: FlaskConical,    label: t('nav.labs'),      path: ROUTES.LABS },
    { icon: Map,             label: t('nav.paths'),     path: ROUTES.PATHS },
  ];

  return (
    <aside
      className={cn(
        // Base positioning
        'fixed top-0 z-40 h-screen bg-card',
        'ltr:left-0 ltr:border-r rtl:right-0 rtl:border-l',
        'transition-all duration-300 ease-in-out',

        // ── Mobile (< lg): off-screen by default, slides in when open ──────
        'ltr:-translate-x-full rtl:translate-x-full',
        mobileOpen && 'ltr:!translate-x-0 rtl:!translate-x-0',

        // ── Desktop (≥ lg): always visible ──────────────────────────────────
        'lg:ltr:translate-x-0 lg:rtl:translate-x-0',

        // ── Width ──────────────────────────────────────────────────────────
        'w-72',                                    // mobile always full
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-64', // desktop respects collapse
      )}
    >
      <div className="flex h-full flex-col">

        {/* ── Logo area ───────────────────────────────────────────────────── */}
        <div className="flex h-16 items-center justify-between gap-2 border-b px-4">

          {/* Logo: visible on mobile always + desktop when expanded */}
          <div
            className={cn(
              'flex items-center overflow-hidden transition-all duration-300',
              // Desktop collapsed → hide
              sidebarCollapsed ? 'lg:w-0 lg:opacity-0 lg:pointer-events-none' : 'lg:opacity-100',
            )}
          >
            <Logo size="sm" showBadge />
          </div>

          {/* Desktop: collapse toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              'hidden lg:flex flex-shrink-0',
              sidebarCollapsed && 'mx-auto',
            )}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>

          {/* Mobile: close (X) button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={closeMobileSidebar}
            className="flex flex-shrink-0 lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* ── Navigation ─────────────────────────────────────────────────── */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== ROUTES.DASHBOARD &&
                location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileSidebar} // close on mobile nav click
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  // Desktop collapsed: center icon only
                  sidebarCollapsed && 'lg:justify-center lg:px-2',
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />

                {/* Label: always visible on mobile, depends on collapse on desktop */}
                <span
                  className={cn(
                    'truncate text-sm font-medium',
                    sidebarCollapsed && 'lg:hidden',
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

      </div>
    </aside>
  );
}
