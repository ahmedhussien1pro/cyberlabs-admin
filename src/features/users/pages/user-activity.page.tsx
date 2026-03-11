// src/features/users/pages/user-activity.page.tsx
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { usersService } from '@/core/api/services';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ROUTES } from '@/shared/constants';
import {
  ArrowLeft,
  BookOpen,
  FlaskConical,
  Trophy,
  Zap,
  LogIn,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Filter,
  Activity,
  Star,
  Shield,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// ── Types ──
type ActivityType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'COURSE_ENROLLED'
  | 'COURSE_COMPLETED'
  | 'LAB_STARTED'
  | 'LAB_COMPLETED'
  | 'BADGE_EARNED'
  | 'XP_GAINED'
  | 'ROLE_CHANGED'
  | 'SUSPENDED'
  | 'UNSUSPENDED';

interface ActivityItem {
  id: string;
  type: ActivityType;
  description?: string;
  metadata?: Record<string, any>;
  xpGained?: number;
  createdAt: string;
}

// ── Icon & color per activity type ──
const ACTIVITY_CONFIG: Record<
  ActivityType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  LOGIN: { icon: LogIn, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  LOGOUT: { icon: LogIn, color: 'text-muted-foreground', bg: 'bg-muted/30' },
  COURSE_ENROLLED: {
    icon: BookOpen,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  COURSE_COMPLETED: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  LAB_STARTED: {
    icon: FlaskConical,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  LAB_COMPLETED: {
    icon: CheckCircle2,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  BADGE_EARNED: {
    icon: Trophy,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
  XP_GAINED: { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ROLE_CHANGED: {
    icon: Shield,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  SUSPENDED: {
    icon: XCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
  UNSUSPENDED: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
};

const FILTER_TYPES: { key: ActivityType | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'LOGIN', label: 'Logins' },
  { key: 'COURSE_ENROLLED', label: 'Courses' },
  { key: 'LAB_STARTED', label: 'Labs' },
  { key: 'BADGE_EARNED', label: 'Badges' },
  { key: 'XP_GAINED', label: 'XP' },
];

export default function UserActivityPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('userActivity');
  const dateLocale = i18n.language === 'ar' ? ar : enUS;
  const [filter, setFilter] = useState<ActivityType | 'ALL'>('ALL');

  // Fetch user info for the header
  const { data: user } = useQuery({
    queryKey: ['users', 'detail', id],
    queryFn: () => usersService.getById(id!),
    enabled: !!id,
  });

  // Fetch activity log — falls back to empty if endpoint doesn't exist yet
  const {
    data: activityData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['users', 'activity', id, filter],
    queryFn: async () => {
      try {
        return await usersService.getActivity(id!, {
          type: filter === 'ALL' ? undefined : filter,
          limit: 100,
        });
      } catch {
        // Return mock/empty data if endpoint not yet implemented
        return { items: [], total: 0 };
      }
    },
    enabled: !!id,
  });

  const activities: ActivityItem[] = Array.isArray(activityData)
    ? activityData
    : ((activityData as any)?.items ?? (activityData as any)?.data ?? []);

  const initials = user
    ? (user.name ?? user.email)
        .split(' ')
        .slice(0, 2)
        .map((w: string) => w[0]?.toUpperCase())
        .join('')
    : '?';

  // Group by date
  const grouped: Record<string, ActivityItem[]> = {};
  for (const item of activities) {
    const day = format(new Date(item.createdAt), 'yyyy-MM-dd');
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(item);
  }
  const days = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className='flex h-[calc(100vh-4rem)] flex-col overflow-hidden'>
      {/* ── Header ── */}
      <div className='flex items-center justify-between gap-4 border-b border-border/60 bg-background px-5 py-3 flex-wrap'>
        <div className='flex items-center gap-3'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => navigate(ROUTES.USER_DETAIL(id!))}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white text-sm font-bold'>
            {initials}
          </div>
          <div>
            <h1 className='text-base font-bold'>
              {user ? (user.name ?? user.email) : '...'}
            </h1>
            <p className='text-xs text-muted-foreground flex items-center gap-1'>
              <Activity className='h-3 w-3' /> {t('header.subtitle')}
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <div className='flex items-center gap-4 text-xs text-muted-foreground'>
          <span className='flex items-center gap-1'>
            <Activity className='h-3.5 w-3.5' />
            {activities.length} {t('header.events')}
          </span>
          {user?.points && (
            <span className='flex items-center gap-1 text-yellow-400'>
              <Star className='h-3.5 w-3.5' />
              {t('header.level')} {user.points.level}
            </span>
          )}
          <Link to={ROUTES.USER_DETAIL(id!)}>
            <Button variant='outline' size='sm' className='h-7 text-xs gap-1.5'>
              {t('header.backToProfile')}
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className='flex items-center gap-1.5 overflow-x-auto border-b border-border/40 bg-muted/10 px-4 py-2'>
        <Filter className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
        {FILTER_TYPES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              'shrink-0 rounded-md border px-3 py-1 text-xs font-medium transition-all',
              filter === key
                ? 'border-blue-500/40 bg-blue-500/10 text-blue-400'
                : 'border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            )}>
            {t(`filter.${key.toLowerCase()}`, label)}
          </button>
        ))}
      </div>

      {/* ── Timeline ── */}
      <ScrollArea className='flex-1'>
        <div className='p-5 space-y-6'>
          {isLoading && (
            <div className='space-y-3'>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className='flex gap-3'>
                  <Skeleton className='h-9 w-9 rounded-lg shrink-0' />
                  <div className='flex-1 space-y-1.5'>
                    <Skeleton className='h-4 w-48' />
                    <Skeleton className='h-3 w-24' />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{t('error.load')}</AlertDescription>
            </Alert>
          )}

          {!isLoading && activities.length === 0 && (
            <div className='flex flex-col items-center justify-center gap-3 py-20'>
              <div className='flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/30'>
                <Activity className='h-8 w-8 text-muted-foreground/30' />
              </div>
              <p className='text-sm font-medium text-muted-foreground'>
                {t('empty.title')}
              </p>
              <p className='text-xs text-muted-foreground/60'>
                {t('empty.subtitle')}
              </p>
            </div>
          )}

          {days.map((day) => (
            <div key={day}>
              {/* Day separator */}
              <div className='flex items-center gap-3 mb-3'>
                <div className='h-px flex-1 bg-border/50' />
                <span className='flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-[11px] font-medium text-muted-foreground'>
                  <Clock className='h-3 w-3' />
                  {format(new Date(day), 'EEEE, d MMM yyyy', {
                    locale: dateLocale,
                  })}
                </span>
                <div className='h-px flex-1 bg-border/50' />
              </div>

              <div className='space-y-2'>
                {grouped[day].map((item) => {
                  const cfg =
                    ACTIVITY_CONFIG[item.type] ?? ACTIVITY_CONFIG.XP_GAINED;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={item.id}
                      className='flex items-start gap-3 rounded-xl border border-border/50 bg-card p-3 hover:border-border transition-colors'>
                      <div
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                          cfg.bg,
                        )}>
                        <Icon className={cn('h-4 w-4', cfg.color)} />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center justify-between gap-2 flex-wrap'>
                          <p className='text-sm font-medium'>
                            {t(
                              `events.${item.type.toLowerCase()}`,
                              item.type.replace(/_/g, ' '),
                            )}
                          </p>
                          <span className='text-[11px] text-muted-foreground shrink-0'>
                            {format(new Date(item.createdAt), 'HH:mm')}
                          </span>
                        </div>
                        {item.description && (
                          <p className='mt-0.5 text-xs text-muted-foreground'>
                            {item.description}
                          </p>
                        )}
                        {item.metadata?.courseTitle && (
                          <Badge
                            variant='outline'
                            className='mt-1 text-[10px] border-blue-500/30 text-blue-400 bg-blue-500/5'>
                            <BookOpen className='mr-1 h-2.5 w-2.5' />{' '}
                            {item.metadata.courseTitle}
                          </Badge>
                        )}
                        {item.metadata?.labTitle && (
                          <Badge
                            variant='outline'
                            className='mt-1 text-[10px] border-violet-500/30 text-violet-400 bg-violet-500/5'>
                            <FlaskConical className='mr-1 h-2.5 w-2.5' />{' '}
                            {item.metadata.labTitle}
                          </Badge>
                        )}
                        {item.metadata?.badgeName && (
                          <Badge
                            variant='outline'
                            className='mt-1 text-[10px] border-yellow-500/30 text-yellow-400 bg-yellow-500/5'>
                            <Trophy className='mr-1 h-2.5 w-2.5' />{' '}
                            {item.metadata.badgeName}
                          </Badge>
                        )}
                      </div>
                      {item.xpGained && item.xpGained > 0 && (
                        <Badge className='shrink-0 bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px]'>
                          <Zap className='mr-1 h-2.5 w-2.5' />+{item.xpGained}{' '}
                          XP
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
