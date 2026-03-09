import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/core/store/auth.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sun,
  Moon,
  Monitor,
  Languages,
  User,
  Shield,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Theme option button ───────────────────────────────────────────────
function ThemeOption({
  icon: Icon,
  label,
  value,
  current,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  current: string | undefined;
  onClick: () => void;
}) {
  const active = current === value;
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all',
        active
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-accent',
      )}
    >
      <Icon className="h-6 w-6" />
      <span className="text-xs font-medium">{label}</span>
      {active && (
        <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary" />
      )}
    </button>
  );
}

// ── Language option button ────────────────────────────────────────────
function LangOption({
  code,
  label,
  nativeLabel,
  current,
  onClick,
}: {
  code: string;
  label: string;
  nativeLabel: string;
  current: string;
  onClick: () => void;
}) {
  const active = current === code;
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all text-left',
        active
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-accent',
      )}
    >
      <div className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs opacity-70">{nativeLabel}</span>
      </div>
      {active && (
        <CheckCircle2 className="ml-auto h-4 w-4 text-primary flex-shrink-0" />
      )}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { i18n } = useTranslation('common');
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((s) => s.user);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('i18nextLng', lang);
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your admin preferences</p>
      </div>

      {/* ── Profile Card ────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Profile</CardTitle>
          </div>
          <CardDescription>Your admin account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.username}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-primary">
                    {(user.username ?? user.email ?? 'A')[0].toUpperCase()}
                  </span>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold truncate">{user.username ?? '—'}</p>
                  <Badge
                    variant="secondary"
                    className="gap-1 text-xs"
                  >
                    <Shield className="h-3 w-3" />
                    {user.role}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not logged in</p>
          )}
        </CardContent>
      </Card>

      {/* ── Appearance Card ─────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Appearance</CardTitle>
          </div>
          <CardDescription>Choose your preferred interface theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <ThemeOption
              icon={Sun}
              label="Light"
              value="light"
              current={theme}
              onClick={() => setTheme('light')}
            />
            <ThemeOption
              icon={Moon}
              label="Dark"
              value="dark"
              current={theme}
              onClick={() => setTheme('dark')}
            />
            <ThemeOption
              icon={Monitor}
              label="System"
              value="system"
              current={theme}
              onClick={() => setTheme('system')}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Language Card ───────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Language</CardTitle>
          </div>
          <CardDescription>Select the admin dashboard display language</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <LangOption
              code="en"
              label="English"
              nativeLabel="English"
              current={i18n.language}
              onClick={() => changeLanguage('en')}
            />
            <LangOption
              code="ar"
              label="Arabic"
              nativeLabel="العربية"
              current={i18n.language}
              onClick={() => changeLanguage('ar')}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── About Card ──────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">About</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Platform</span>
            <span className="font-medium">CyberLabs Admin</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Version</span>
            <Badge variant="outline" className="text-xs font-mono">v1.0.0</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Environment</span>
            <Badge
              variant="secondary"
              className={cn(
                'text-xs',
                import.meta.env.PROD
                  ? 'bg-green-500/10 text-green-600'
                  : 'bg-orange-500/10 text-orange-600',
              )}
            >
              {import.meta.env.PROD ? 'Production' : 'Development'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
