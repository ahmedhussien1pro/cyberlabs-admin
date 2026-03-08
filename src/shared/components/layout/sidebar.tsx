import { Link, useLocation } from 'react-router-dom';
import { useUIStore } from '@/core/store/ui.store';
import { ROUTES } from '@/shared/constants';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FlaskConical,
  Map,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
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
        'fixed top-0 z-40 h-screen bg-card transition-all duration-300',
        'ltr:left-0 ltr:border-r rtl:right-0 rtl:border-l',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <svg
                  className="h-6 w-6 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <span className="text-lg font-semibold">CyberLabs</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(sidebarCollapsed && 'mx-auto')}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== ROUTES.DASHBOARD &&
                location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  sidebarCollapsed && 'justify-center'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
