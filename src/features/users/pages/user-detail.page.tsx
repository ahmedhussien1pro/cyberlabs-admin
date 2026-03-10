// src/features/users/pages/user-detail.page.tsx
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { usersService } from '@/core/api/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { UserRoleDialog } from '../components/user-role-dialog';
import { SuspendUserDialog } from '../components/suspend-user-dialog';
import { ROUTES } from '@/shared/constants';
import {
  AlertCircle, ArrowLeft, Mail, Calendar, Shield, Activity,
  Trophy, BookOpen, FlaskConical, CheckCircle2, XCircle, Clock,
  History, ExternalLink, Star, Zap, Target,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useState } from 'react';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('userDetail');
  const [roleDialogOpen,    setRoleDialogOpen]    = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);

  const dateLocale = i18n.language === 'ar' ? ar : enUS;

  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['users', 'detail', id],
    queryFn:  () => usersService.getById(id!),
    enabled:  !!id,
  });

  if (error) return (
    <div className='flex h-full items-center justify-center'>
      <Alert variant='destructive' className='max-w-md'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>{t('error.load')}</AlertDescription>
      </Alert>
    </div>
  );

  if (isLoading) return (
    <div className='space-y-6 p-6'>
      <Skeleton className='h-10 w-64' />
      <div className='grid gap-6 md:grid-cols-3'>
        <Skeleton className='h-96 md:col-span-1' />
        <div className='md:col-span-2 space-y-4'>
          {[1,2,3].map((i) => <Skeleton key={i} className='h-40' />)}
        </div>
      </div>
    </div>
  );

  if (!user) return (
    <Alert variant='destructive' className='max-w-md'>
      <AlertCircle className='h-4 w-4' />
      <AlertDescription>{t('error.notFound')}</AlertDescription>
    </Alert>
  );

  const isSuspended = user.security?.isSuspended ?? false;
  const isActive    = user.isActive !== false && !isSuspended;

  // XP progress to next level (rough formula: level * 500)
  const xpCurrent   = user.points?.totalXP ?? 0;
  const level       = user.points?.level ?? 1;
  const xpThreshold = level * 500;
  const xpProgress  = Math.min(100, Math.round((xpCurrent % xpThreshold) / xpThreshold * 100));

  // Avatar initials
  const initials = (user.name ?? user.email)
    .split(' ').slice(0, 2).map((w: string) => w[0]?.toUpperCase()).join('');

  return (
    <div className='space-y-6 p-6'>
      {/* ── Header ── */}
      <div className='flex items-center justify-between gap-4 flex-wrap'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' onClick={() => navigate(ROUTES.USERS)}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          {/* Avatar */}
          <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white text-xl font-bold shadow-lg'>
            {initials}
          </div>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>{user.name ?? user.email}</h1>
            <p className='text-muted-foreground text-sm'>{user.email}</p>
            <div className='mt-1 flex items-center gap-2'>
              <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className='text-[10px]'>
                {user.role}
              </Badge>
              <Badge
                variant={isSuspended ? 'destructive' : isActive ? 'default' : 'secondary'}
                className='text-[10px]'
              >
                {isSuspended ? t('status.suspended') : isActive ? t('status.active') : t('status.inactive')}
              </Badge>
            </div>
          </div>
        </div>

        <div className='flex gap-2 flex-wrap'>
          <Link to={ROUTES.USER_ACTIVITY(id!)}>
            <Button variant='outline' size='sm'>
              <History className='mr-2 h-4 w-4' />
              {t('actions.viewActivity')}
            </Button>
          </Link>
          <Button variant='outline' size='sm' onClick={() => setRoleDialogOpen(true)}>
            <Shield className='mr-2 h-4 w-4' />
            {t('actions.changeRole')}
          </Button>
          {isSuspended ? (
            <Button size='sm' onClick={() => setSuspendDialogOpen(true)}>
              <CheckCircle2 className='mr-2 h-4 w-4' />
              {t('actions.unsuspend')}
            </Button>
          ) : (
            <Button variant='destructive' size='sm' onClick={() => setSuspendDialogOpen(true)}>
              <XCircle className='mr-2 h-4 w-4' />
              {t('actions.suspend')}
            </Button>
          )}
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        {/* ── LEFT: Profile card ── */}
        <div className='space-y-4'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-semibold uppercase tracking-wider text-muted-foreground'>
                {t('sections.info')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center gap-3'>
                <Mail className='h-4 w-4 text-muted-foreground shrink-0' />
                <div>
                  <p className='text-xs text-muted-foreground'>{t('fields.email')}</p>
                  <p className='font-medium text-sm break-all'>{user.email}</p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                {user.isEmailVerified
                  ? <CheckCircle2 className='h-4 w-4 text-emerald-500 shrink-0' />
                  : <XCircle className='h-4 w-4 text-muted-foreground shrink-0' />}
                <div>
                  <p className='text-xs text-muted-foreground'>{t('fields.emailVerified')}</p>
                  <p className='text-sm font-medium'>
                    {user.isEmailVerified ? t('values.verified') : t('values.notVerified')}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                {user.twoFactorEnabled
                  ? <CheckCircle2 className='h-4 w-4 text-emerald-500 shrink-0' />
                  : <XCircle className='h-4 w-4 text-muted-foreground shrink-0' />}
                <div>
                  <p className='text-xs text-muted-foreground'>{t('fields.twoFactor')}</p>
                  <p className='text-sm font-medium'>
                    {user.twoFactorEnabled ? t('values.enabled') : t('values.disabled')}
                  </p>
                </div>
              </div>

              <Separator />

              <div className='flex items-center gap-3'>
                <Calendar className='h-4 w-4 text-muted-foreground shrink-0' />
                <div>
                  <p className='text-xs text-muted-foreground'>{t('fields.joined')}</p>
                  <p className='text-sm font-medium'>
                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: dateLocale })}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {format(new Date(user.createdAt), 'PPP', { locale: dateLocale })}
                  </p>
                </div>
              </div>

              {user.lastLoginAt && (
                <div className='flex items-center gap-3'>
                  <Clock className='h-4 w-4 text-muted-foreground shrink-0' />
                  <div>
                    <p className='text-xs text-muted-foreground'>{t('fields.lastLogin')}</p>
                    <p className='text-sm font-medium'>
                      {formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true, locale: dateLocale })}
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <p className='text-xs text-muted-foreground mb-1'>{t('fields.userId')}</p>
                <p className='font-mono text-[11px] break-all text-muted-foreground bg-muted/40 rounded px-2 py-1'>{user.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Suspension details */}
          {isSuspended && user.security && (
            <Card className='border-destructive/50 bg-destructive/5'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm text-destructive flex items-center gap-2'>
                  <XCircle className='h-4 w-4' />
                  {t('sections.suspension')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-2 text-sm'>
                {user.security.suspensionReason && (
                  <div>
                    <p className='text-xs text-muted-foreground'>{t('fields.reason')}</p>
                    <p className='font-medium'>{user.security.suspensionReason}</p>
                  </div>
                )}
                {user.security.suspendedAt && (
                  <div>
                    <p className='text-xs text-muted-foreground'>{t('fields.suspendedAt')}</p>
                    <p className='font-medium'>
                      {formatDistanceToNow(new Date(user.security.suspendedAt), { addSuffix: true, locale: dateLocale })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── RIGHT 2 cols: Stats ── */}
        <div className='md:col-span-2 space-y-4'>
          {/* XP / Level card */}
          {user.points && (
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base flex items-center gap-2'>
                  <Trophy className='h-4 w-4 text-yellow-500' />
                  {t('sections.progress')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-3 gap-6 text-center mb-4'>
                  <div className='flex flex-col items-center gap-1'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/15 ring-2 ring-yellow-500/30'>
                      <Star className='h-5 w-5 text-yellow-500' />
                    </div>
                    <p className='text-2xl font-bold text-yellow-500'>{user.points.level}</p>
                    <p className='text-xs text-muted-foreground'>{t('stats.level')}</p>
                  </div>
                  <div className='flex flex-col items-center gap-1'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/15 ring-2 ring-blue-500/30'>
                      <Zap className='h-5 w-5 text-blue-500' />
                    </div>
                    <p className='text-2xl font-bold text-blue-500'>{user.points.totalXP.toLocaleString()}</p>
                    <p className='text-xs text-muted-foreground'>{t('stats.totalXP')}</p>
                  </div>
                  <div className='flex flex-col items-center gap-1'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/15 ring-2 ring-purple-500/30'>
                      <Target className='h-5 w-5 text-purple-500' />
                    </div>
                    <p className='text-2xl font-bold text-purple-500'>{user.points.totalPoints.toLocaleString()}</p>
                    <p className='text-xs text-muted-foreground'>{t('stats.totalPoints')}</p>
                  </div>
                </div>
                <div>
                  <div className='flex items-center justify-between mb-1.5 text-xs text-muted-foreground'>
                    <span>{t('stats.xpProgress')}</span>
                    <span>{xpProgress}%</span>
                  </div>
                  <Progress value={xpProgress} className='h-2' />
                  <p className='mt-1 text-right text-[10px] text-muted-foreground'>
                    {t('stats.toNextLevel', { level: level + 1 })}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity counts */}
          {user._count && (
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base flex items-center gap-2'>
                  <Activity className='h-4 w-4 text-blue-400' />
                  {t('sections.activity')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-3 gap-4'>
                  <div className='flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-muted/20 p-4'>
                    <BookOpen className='h-6 w-6 text-blue-400' />
                    <p className='text-2xl font-bold'>{user._count.enrollments}</p>
                    <p className='text-xs text-muted-foreground text-center'>{t('stats.enrollments')}</p>
                  </div>
                  <div className='flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-muted/20 p-4'>
                    <FlaskConical className='h-6 w-6 text-violet-400' />
                    <p className='text-2xl font-bold'>{user._count.labProgress}</p>
                    <p className='text-xs text-muted-foreground text-center'>{t('stats.labProgress')}</p>
                  </div>
                  {user._count.badges !== undefined && (
                    <div className='flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-muted/20 p-4'>
                      <Trophy className='h-6 w-6 text-yellow-400' />
                      <p className='text-2xl font-bold'>{user._count.badges}</p>
                      <p className='text-xs text-muted-foreground text-center'>{t('stats.badges')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick links */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <ExternalLink className='h-4 w-4 text-muted-foreground' />
                {t('sections.quickLinks')}
              </CardTitle>
            </CardHeader>
            <CardContent className='flex flex-wrap gap-2'>
              <Link to={ROUTES.USER_ACTIVITY(id!)}>
                <Button variant='outline' size='sm' className='gap-1.5 text-xs'>
                  <History className='h-3.5 w-3.5' /> {t('links.activity')}
                </Button>
              </Link>
              <Link to={`${ROUTES.REFERRAL_LINKS}?user=${id}`}>
                <Button variant='outline' size='sm' className='gap-1.5 text-xs'>
                  <ExternalLink className='h-3.5 w-3.5' /> {t('links.referrals')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <UserRoleDialog
        user={user} open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen} onSuccess={refetch}
      />
      <SuspendUserDialog
        user={user} open={suspendDialogOpen}
        onOpenChange={setSuspendDialogOpen} onSuccess={refetch}
      />
    </div>
  );
}
