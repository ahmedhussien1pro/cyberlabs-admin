// src/features/dashboard/pages/dashboard.page.tsx
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Clock, RefreshCw, Users, BookOpen, FlaskConical, GraduationCap, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import {
  analyticsService, usersService, coursesService, labsService,
} from '@/core/api/services';
import type {
  GrowthTrends, EngagementMetrics as EngagementData,
  TopContent, ActivityEvent,
} from '@/core/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  StatsCard, GrowthChart, EngagementMetrics, RecentActivityFeed,
  TopContentTable, QuickActions, BreakdownCard, DashboardErrorAlert, XpBanner,
} from '../components';
import { calcUserChangePercent, getErrorType } from '../utils/dashboard.utils';

const REFETCH_INTERVAL = 5 * 60 * 1000;

export default function DashboardPage() {
  const { t } = useTranslation('dashboard');

  const { data: overview,  isLoading: overviewLoading,  error: overviewError,
          refetch: refetchOverview, dataUpdatedAt: overviewUpdatedAt } =
    useQuery({ queryKey: ['analytics', 'overview'], queryFn: analyticsService.getOverview, retry: 1, refetchInterval: REFETCH_INTERVAL });

  const { data: usersStats,   isLoading: usersLoading,   error: usersError,   refetch: refetchUsers }   =
    useQuery({ queryKey: ['users',    'stats'], queryFn: usersService.getStats,   retry: 1, refetchInterval: REFETCH_INTERVAL });
  const { data: coursesStats, isLoading: coursesLoading, error: coursesError, refetch: refetchCourses } =
    useQuery({ queryKey: ['courses',  'stats'], queryFn: coursesService.getStats, retry: 1, refetchInterval: REFETCH_INTERVAL });
  const { data: labsStats,    isLoading: labsLoading,    error: labsError,    refetch: refetchLabs }    =
    useQuery({ queryKey: ['labs',     'stats'], queryFn: labsService.getStats,    retry: 1, refetchInterval: REFETCH_INTERVAL });

  const { data: growth }         = useQuery({ queryKey: ['analytics', 'growth'],          queryFn: analyticsService.getGrowth,         retry: 1, refetchInterval: REFETCH_INTERVAL });
  const { data: engagement }     = useQuery({ queryKey: ['analytics', 'engagement'],      queryFn: analyticsService.getEngagement,     retry: 1, refetchInterval: REFETCH_INTERVAL });
  const { data: topContent }     = useQuery({ queryKey: ['analytics', 'top-content'],     queryFn: analyticsService.getTopContent,     retry: 1, refetchInterval: REFETCH_INTERVAL });
  const { data: recentActivity } = useQuery({ queryKey: ['analytics', 'recent-activity'], queryFn: analyticsService.getRecentActivity, retry: 1, refetchInterval: REFETCH_INTERVAL });

  const isLoading   = overviewLoading || usersLoading || coursesLoading || labsLoading;
  const hasAnyData  = overview || usersStats || coursesStats || labsStats;
  const errorType   = getErrorType(overviewError, usersError, coursesError, labsError);
  const showError   = !!errorType && !isLoading;
  const lastUpdated = overviewUpdatedAt ? format(new Date(overviewUpdatedAt), 'HH:mm:ss') : null;

  const handleRefreshAll = () => { refetchOverview(); refetchUsers(); refetchCourses(); refetchLabs(); };

  // typed aliases — cast from unknown to the real core types
  const ov  = overview    as any;
  const us  = usersStats  as any;
  const cs  = coursesStats as any;
  const ls  = labsStats   as any;
  const growthData      = growth        as GrowthTrends     | undefined;
  const engagementData  = engagement    as EngagementData   | undefined;
  const topContentData  = topContent    as TopContent       | undefined;
  const activityData    = recentActivity as ActivityEvent[] | undefined;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>{t('title') || 'Dashboard'}</h1>
          <p className='text-muted-foreground'>{t('subtitle') || 'Platform overview and analytics'}</p>
        </div>
        <div className='flex items-center gap-3'>
          {lastUpdated && (
            <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
              <Clock className='h-3.5 w-3.5' /> Updated at {lastUpdated}
            </span>
          )}
          <Button variant='outline' size='sm' onClick={handleRefreshAll} disabled={isLoading} className='gap-2'>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <QuickActions />

      {showError && <DashboardErrorAlert errorType={errorType} warningText={t('warnings.analytics')} />}

      {/* KPI Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {usersLoading    ? <Skeleton className='h-32' /> : <StatsCard title={t('stats.totalUsers')       || 'Total Users'}        value={us?.total ?? ov?.users ?? 0}       subtitle={`+${us?.newThisMonth ?? 0} this month`}      change={calcUserChangePercent(us?.total ?? 0, us?.newThisMonth ?? 0)} icon={Users}         accentColor='blue'   />}
        {coursesLoading  ? <Skeleton className='h-32' /> : <StatsCard title={t('stats.courses')         || 'Courses'}            value={cs?.total ?? ov?.courses ?? 0}     subtitle={`${cs?.published ?? 0} published`}           icon={BookOpen}      accentColor='green'  />}
        {labsLoading     ? <Skeleton className='h-32' /> : <StatsCard title={t('stats.labs')            || 'Labs'}               value={ls?.total ?? ov?.labs ?? 0}        subtitle={`${ls?.published ?? 0} published`}           icon={FlaskConical}  accentColor='purple' />}
        {overviewLoading ? <Skeleton className='h-32' /> : <StatsCard title={t('stats.totalEnrollments')|| 'Total Enrollments'}  value={ov?.enrollments ?? 0}              subtitle={`${ov?.labCompletions ?? 0} lab completions`} icon={GraduationCap} accentColor='orange' />}
      </div>

      {/* Breakdown Cards */}
      <div className='grid gap-4 md:grid-cols-3'>
        {us && <BreakdownCard title={t('breakdown.users')   || 'Users Breakdown'}   icon={Users}        rows={[{ label:'Total', value: us.total }, { label:'New This Month', value: us.newThisMonth, badge:'secondary' }, { label:'Suspended', value: us.suspended, badge:'destructive' }]} section={{ heading:'By Role',       rows: Object.entries(us.byRole      ?? {}) as [string, number][] }} />}
        {cs && <BreakdownCard title={t('breakdown.courses') || 'Courses Breakdown'} icon={BookOpen}     rows={[{ label:'Total', value: cs.total }, { label:'Published',     value: cs.published,    badge:'green'      }, { label:'Unpublished', value: cs.unpublished, badge:'outline' }, { label:'Featured', value: cs.featured, badge:'secondary' }]} section={{ heading:'By State',      rows: Object.entries(cs.byState     ?? {}) as [string, number][] }} />}
        {ls && <BreakdownCard title={t('breakdown.labs')    || 'Labs Breakdown'}    icon={FlaskConical} rows={[{ label:'Total', value: ls.total }, { label:'Published',     value: ls.published,    badge:'green'      }, { label:'Unpublished', value: ls.unpublished, badge:'outline' }, { label:'Completions', value: ls.totalCompletions, badge:'secondary' }]} section={{ heading:'By Difficulty', rows: Object.entries(ls.byDifficulty ?? {}) as [string, number][] }} />}
      </div>

      {ov && <XpBanner totalXP={ov.totalXP} totalPoints={ov.totalPoints} />}

      {(growthData || engagementData) && (
        <div className='grid gap-6 lg:grid-cols-5'>
          {growthData     && <div className='lg:col-span-3'><GrowthChart       data={growthData}     /></div>}
          {engagementData && <div className='lg:col-span-2'><EngagementMetrics data={engagementData} /></div>}
        </div>
      )}

      {(topContentData || activityData) && (
        <div className='grid gap-6 lg:grid-cols-2'>
          {topContentData && <TopContentTable    data={topContentData}    />}
          {activityData   && <RecentActivityFeed activities={activityData} />}
        </div>
      )}

      {!hasAnyData && !isLoading && !showError && (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-16'>
            <TrendingUp className='mb-4 h-12 w-12 text-muted-foreground' />
            <h3 className='mb-2 text-lg font-semibold'>{t('emptyState.title') || 'No Data Available'}</h3>
            <p className='max-w-md text-center text-sm text-muted-foreground'>
              {t('emptyState.description') || 'Start by adding users, courses, or labs to see analytics here.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
