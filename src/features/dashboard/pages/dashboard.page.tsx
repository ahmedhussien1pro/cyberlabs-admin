import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  analyticsService,
  usersService,
  coursesService,
  labsService,
} from '@/core/api/services';
import { StatsCard } from '../components/stats-card';
import { GrowthChart } from '../components/growth-chart';
import { EngagementMetrics } from '../components/engagement-metrics';
import { RecentActivityFeed } from '../components/recent-activity-feed';
import { TopContentTable } from '../components/top-content-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Users,
  BookOpen,
  FlaskConical,
  UserPlus,
  TrendingUp,
  GraduationCap,
  Trophy,
} from 'lucide-react';

export default function DashboardPage() {
  const { t } = useTranslation('dashboard');

  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
  } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: analyticsService.getOverview,
    retry: 1,
  });

  const { data: usersStats, isLoading: usersLoading } = useQuery({
    queryKey: ['users', 'stats'],
    queryFn: usersService.getStats,
    retry: 1,
  });

  const { data: coursesStats, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', 'stats'],
    queryFn: coursesService.getStats,
    retry: 1,
  });

  const { data: labsStats, isLoading: labsLoading } = useQuery({
    queryKey: ['labs', 'stats'],
    queryFn: labsService.getStats,
    retry: 1,
  });

  const { data: growth } = useQuery({
    queryKey: ['analytics', 'growth'],
    queryFn: analyticsService.getGrowth,
    retry: 1,
  });

  const { data: engagement } = useQuery({
    queryKey: ['analytics', 'engagement'],
    queryFn: analyticsService.getEngagement,
    retry: 1,
  });

  const { data: topContent } = useQuery({
    queryKey: ['analytics', 'top-content'],
    queryFn: analyticsService.getTopContent,
    retry: 1,
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['analytics', 'recent-activity'],
    queryFn: analyticsService.getRecentActivity,
    retry: 1,
  });

  const isStillLoading =
    overviewLoading || usersLoading || coursesLoading || labsLoading;
  const hasAnyData = overview || usersStats || coursesStats || labsStats;
  const showAnalyticsWarning = overviewError && !isStillLoading;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>{t('title')}</h1>
        <p className='text-muted-foreground'>{t('subtitle')}</p>
      </div>

      {/* Analytics Warning */}
      {showAnalyticsWarning && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{t('warnings.analytics')}</AlertDescription>
        </Alert>
      )}

      {/* Primary KPI Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {usersLoading ? (
          <Skeleton className='h-32' />
        ) : (
          <StatsCard
            title={t('stats.totalUsers')}
            value={usersStats?.total ?? overview?.users ?? 0}
            subtitle={t('stats.newThisMonth', { count: usersStats?.newThisMonth ?? 0 })}
            icon={Users}
          />
        )}

        {coursesLoading ? (
          <Skeleton className='h-32' />
        ) : (
          <StatsCard
            title={t('stats.courses')}
            value={coursesStats?.total ?? overview?.courses ?? 0}
            subtitle={t('stats.published', { count: coursesStats?.published ?? 0 })}
            icon={BookOpen}
          />
        )}

        {labsLoading ? (
          <Skeleton className='h-32' />
        ) : (
          <StatsCard
            title={t('stats.labs')}
            value={labsStats?.total ?? overview?.labs ?? 0}
            subtitle={t('stats.published', { count: labsStats?.published ?? 0 })}
            icon={FlaskConical}
          />
        )}

        {overviewLoading ? (
          <Skeleton className='h-32' />
        ) : (
          <StatsCard
            title={t('stats.totalEnrollments')}
            value={overview?.enrollments ?? 0}
            subtitle={t('stats.labCompletions', { count: overview?.labCompletions ?? 0 })}
            icon={GraduationCap}
          />
        )}
      </div>

      {/* Secondary Stats Row */}
      <div className='grid gap-4 md:grid-cols-3'>
        {usersStats && (
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <Users className='h-4 w-4' />
                {t('breakdown.users')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>{t('breakdown.total')}</span>
                <span className='font-semibold'>{usersStats.total}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>{t('breakdown.newThisMonth')}</span>
                <Badge variant='secondary'>{usersStats.newThisMonth}</Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>{t('breakdown.suspended')}</span>
                <Badge variant='destructive'>{usersStats.suspended}</Badge>
              </div>
              <div className='pt-2 border-t space-y-1'>
                <p className='text-xs text-muted-foreground mb-1'>{t('breakdown.byRole')}</p>
                {Object.entries(usersStats.byRole).map(([role, count]) => (
                  <div key={role} className='flex justify-between text-xs'>
                    <span className='capitalize'>{role.replace('_', ' ')}</span>
                    <span className='font-medium'>{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {coursesStats && (
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <BookOpen className='h-4 w-4' />
                {t('breakdown.courses')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>{t('breakdown.total')}</span>
                <span className='font-semibold'>{coursesStats.total}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>{t('breakdown.published')}</span>
                <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'>
                  {coursesStats.published}
                </Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>{t('breakdown.unpublished')}</span>
                <Badge variant='outline'>{coursesStats.unpublished}</Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>{t('breakdown.featured')}</span>
                <Badge variant='secondary'>{coursesStats.featured}</Badge>
              </div>
              <div className='pt-2 border-t space-y-1'>
                <p className='text-xs text-muted-foreground mb-1'>{t('breakdown.byState')}</p>
                {Object.entries(coursesStats.byState).map(([state, count]) => (
                  <div key={state} className='flex justify-between text-xs'>
                    <span className='capitalize'>{state.replace('_', ' ')}</span>
                    <span className='font-medium'>{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {labsStats && (
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <FlaskConical className='h-4 w-4' />
                {t('breakdown.labs')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>{t('breakdown.total')}</span>
                <span className='font-semibold'>{labsStats.total}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>{t('breakdown.published')}</span>
                <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'>
                  {labsStats.published}
                </Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>{t('breakdown.unpublished')}</span>
                <Badge variant='outline'>{labsStats.unpublished}</Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>{t('breakdown.completions')}</span>
                <Badge variant='secondary'>{labsStats.totalCompletions}</Badge>
              </div>
              <div className='pt-2 border-t space-y-1'>
                <p className='text-xs text-muted-foreground mb-1'>{t('breakdown.byDifficulty')}</p>
                {Object.entries(labsStats.byDifficulty).map(([diff, count]) => (
                  <div key={diff} className='flex justify-between text-xs'>
                    <span className='capitalize'>{diff}</span>
                    <span className='font-medium'>{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* XP / Points Banner */}
      {overview && (
        <div className='grid gap-4 md:grid-cols-2'>
          <Card>
            <CardContent className='flex items-center gap-4 pt-6'>
              <Trophy className='h-8 w-8 text-yellow-500' />
              <div>
                <p className='text-sm text-muted-foreground'>{t('overview.totalXP')}</p>
                <p className='text-2xl font-bold'>{overview.totalXP.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='flex items-center gap-4 pt-6'>
              <UserPlus className='h-8 w-8 text-blue-500' />
              <div>
                <p className='text-sm text-muted-foreground'>{t('overview.totalPoints')}</p>
                <p className='text-2xl font-bold'>{overview.totalPoints.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {(growth || engagement) && (
        <div className='grid gap-6 md:grid-cols-2'>
          {growth && <GrowthChart data={growth} />}
          {engagement && <EngagementMetrics data={engagement} />}
        </div>
      )}

      {/* Top Content + Activity */}
      {(topContent || recentActivity) && (
        <div className='grid gap-6 lg:grid-cols-2'>
          {topContent && <TopContentTable data={topContent} />}
          {recentActivity && <RecentActivityFeed activities={recentActivity} />}
        </div>
      )}

      {/* Empty State */}
      {!hasAnyData && !isStillLoading && (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-16'>
            <TrendingUp className='h-12 w-12 text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold mb-2'>{t('emptyState.title')}</h3>
            <p className='text-sm text-muted-foreground text-center max-w-md'>
              {t('emptyState.description')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
