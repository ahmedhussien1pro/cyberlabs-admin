import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { useUIStore } from '@/core/store/ui.store';
import { ROUTES } from '@/shared/constants';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Sun, Moon, Languages, Menu } from 'lucide-react';
import Cookies from 'js-cookie';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';

export function Header() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { i18n, t } = useTranslation('common');
  const { openMobileSidebar } = useUIStore();

  const handleLogout = () => {
    Cookies.remove('access_token');
    clearAuth();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(next);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">

      {/* ── Left side ── */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <Button
          variant="ghost"
          size="icon"
          onClick={openMobileSidebar}
          className="flex lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Page title */}
        <div className="hidden sm:block">
          <h2 className="text-lg font-semibold leading-none">
            {t('adminPanel', 'لوحة الإدارة')}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t('adminSubtitle', 'إدارة منصة CyberLabs')}
          </p>
        </div>
      </div>

      {/* ── Right side ── */}
      <div className="flex items-center gap-1">
        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLanguage}
          title={i18n.language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
        >
          <Languages className="h-5 w-5" />
          <span className="sr-only">Toggle Language</span>
        </Button>

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span className="sr-only">Toggle Theme</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user?.name ? getInitials(user.name) : 'AD'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>{t('profile', 'Profile')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('logout', 'Logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

    </header>
  );
}
