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
  Layers,
  Award,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar, mobileOpen, closeMobileSidebar } =
    useUIStore();
  const { t } = useTranslation('common');

  const navItems = [
    {
      icon: LayoutDashboard,
      label: t('nav.dashboard'),
      path: ROUTES.DASHBOARD,
    },
    { icon: Users,        label: t('nav.users'),    path: ROUTES.USERS },
    { icon: BookOpen,     label: t('nav.courses'),  path: ROUTES.COURSES },
    { icon: FlaskConical, label: t('nav.labs'),     path: ROUTES.LABS },
    { icon: Layers,       label: t('nav.paths'),    path: ROUTES.PATHS },
    { icon: Map,          label: t('nav.map'),      path: ROUTES.MAP },
    { icon: Award,        label: t('nav.badges'),   path: ROUTES.BADGES },
    { icon: Bell,         label: 'Notifications',   path: ROUTES.NOTIFICATIONS },
  ];

  const bottomItems = [
    { icon: Settings, label: t('nav.settings'), path: ROUTES.SETTINGS },
  ];

  interface NavItem {
    icon: React.ForwardRefExoticComponent<any>;
    label: string;
    path: string;
  }

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive =
      location.pathname === item.path ||
      (item.path !== ROUTES.DASHBOARD &&
        location.pathname.startsWith(item.path));

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={closeMobileSidebar}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          sidebarCollapsed && 'lg:justify-center lg:px-2',
        )}
        title={sidebarCollapsed ? item.label : undefined}>
        <item.icon className='h-5 w-5 flex-shrink-0' />
        <span
          className={cn(
            'truncate text-sm font-medium',
            sidebarCollapsed && 'lg:hidden',
          )}>
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'fixed top-0 z-40 h-screen bg-card',
        'ltr:left-0 ltr:border-r rtl:right-0 rtl:border-l',
        'transition-all duration-300 ease-in-out',
        'ltr:-translate-x-full rtl:translate-x-full',
        mobileOpen && 'ltr:!translate-x-0 rtl:!translate-x-0',
        'lg:ltr:translate-x-0 lg:rtl:translate-x-0',
        'w-72',
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-64',
      )}>
      <div className='flex h-full flex-col'>
        {/* ── Logo area ──────────────────────────────────────────────────── */}
        <div className='flex h-16 items-center justify-between gap-2 border-b px-4'>
          <div
            className={cn(
              'flex items-center overflow-hidden transition-all duration-300',
              sidebarCollapsed
                ? 'lg:w-0 lg:opacity-0 lg:pointer-events-none'
                : 'lg:opacity-100',
            )}>
            <Logo size='sm' showBadge />
          </div>

          {/* Desktop: collapse toggle */}
          <Button
            variant='ghost'
            size='icon'
            onClick={toggleSidebar}
            className={cn(
              'hidden lg:flex flex-shrink-0',
              sidebarCollapsed && 'mx-auto',
            )}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {sidebarCollapsed ? (
              <ChevronRight className='h-4 w-4' />
            ) : (
              <ChevronLeft className='h-4 w-4' />
            )}
          </Button>

          {/* Mobile: close (X) button */}
          <Button
            variant='ghost'
            size='icon'
            onClick={closeMobileSidebar}
            className='flex flex-shrink-0 lg:hidden'>
            <X className='h-4 w-4' />
          </Button>
        </div>

        {/* ── Main Navigation ───────────────────────────────────────────── */}
        <nav className='flex-1 space-y-1 overflow-y-auto p-3'>
          {navItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </nav>

        {/* ── Bottom Navigation (Settings) ────────────────────────────── */}
        <div className='border-t p-3 space-y-1'>
          {bottomItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </div>
      </div>
    </aside>
  );
}
