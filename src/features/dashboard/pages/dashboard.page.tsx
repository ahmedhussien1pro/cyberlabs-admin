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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  Users,
  BookOpen,
  FlaskConical,
  UserPlus,
  TrendingUp,
  GraduationCap,
  Trophy,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

export default function DashboardPage() {
  const { t } = useTranslation('dashboard');

  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: analyticsService.getOverview,
    retry: 1,
  });

  const {
    data: usersStats,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ['users', 'stats'],
    queryFn: usersService.getStats,
    retry: 1,
  });

  const {
    data: coursesStats,
    isLoading: coursesLoading,
    error: coursesError,
    refetch: refetchCourses,
  } = useQuery({
    queryKey: ['courses', 'stats'],
    queryFn: coursesService.getStats,
    retry: 1,
  });

  const {
    data: labsStats,
    isLoading: labsLoading,
    error: labsError,
    refetch: refetchLabs,
  } = useQuery({
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

  // Track ALL errors
  const anyError = overviewError || usersError || coursesError || labsError;
  const showErrorAlert = anyError && !isStillLoading;

  // Detect error type for better UX
  const getErrorType = () => {
    const error: any = overviewError || usersError || coursesError || labsError;
    if (!error) return null;

    // Check for 403 Forbidden (most common - not admin)
    if (error?.response?.status === 403) return 'forbidden';

    // Check for 401 Unauthorized
    if (error?.response?.status === 401) return 'unauthorized';

    // Check for network errors
    if (error?.message?.includes('Network') || error?.code === 'ERR_NETWORK') {
      return 'network';
    }

    // Default server error
    return 'server';
  };

  const errorType = getErrorType();

  const handleRefreshAll = () => {
    refetchOverview();
    refetchUsers();
    refetchCourses();
    refetchLabs();
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            {t('title') || 'Dashboard'}
          </h1>
          <p className='text-muted-foreground'>
            {t('subtitle') || 'Platform overview and analytics'}
          </p>
        </div>
        {showErrorAlert && (
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefreshAll}
            className='gap-2'>
            <RefreshCw className='h-4 w-4' />
            Retry
          </Button>
        )}
      </div>

      {/* Enhanced Error Alerts */}
      {showErrorAlert && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle className='font-semibold'>
            {errorType === 'forbidden' && 'Access Denied'}
            {errorType === 'unauthorized' && 'Authentication Required'}
            {errorType === 'network' && 'Connection Error'}
            {errorType === 'server' && 'Server Error'}
          </AlertTitle>
          <AlertDescription className='mt-2'>
            {errorType === 'forbidden' && (
              <div className='space-y-2'>
                <p>You don't have admin permissions to view this dashboard.</p>
                <p className='text-xs'>
                  Contact your system administrator to grant you ADMIN role
                  access.
                </p>
              </div>
            )}
            {errorType === 'unauthorized' && (
              <p>Your session has expired. Please log in again.</p>
            )}
            {errorType === 'network' && (
              <div className='space-y-2'>
                <p>Cannot connect to the backend server.</p>
                <p className='text-xs'>
                  Check your internet connection or verify the API URL in your
                  environment settings.
                </p>
              </div>
            )}
            {errorType === 'server' && (
              <div className='space-y-2'>
                <p>
                  {t('warnings.analytics') || 'Failed to load analytics data.'}
                </p>
                <p className='text-xs'>
                  Please try again or contact support if the problem persists.
                </p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Permission Warning for Non-Admins */}
      {errorType === 'forbidden' && (
        <Alert>
          <ShieldAlert className='h-4 w-4' />
          <AlertTitle>Admin Access Required</AlertTitle>
          <AlertDescription className='space-y-2'>
            <p>This dashboard requires ADMIN role. Your current permissions:</p>
            <ul className='list-disc list-inside text-xs space-y-1 mt-2'>
              <li>You are logged in successfully ✓</li>
              <li>Your role does not have admin privileges ✗</li>
            </ul>
            <p className='text-xs mt-2'>
              To fix this, run the following SQL on your database:
            </p>
            <pre className='bg-muted p-2 rounded text-xs mt-2 overflow-x-auto'>
              UPDATE "User" SET role = 'ADMIN'{'\n'}WHERE email =
              'your-email@domain.com';
            </pre>
          </AlertDescription>
        </Alert>
      )}

      {/* Primary KPI Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {usersLoading ? (
          <Skeleton className='h-32' />
        ) : (
          <StatsCard
            title={t('stats.totalUsers') || 'Total Users'}
            value={usersStats?.total ?? overview?.users ?? 0}
            subtitle={
              t('stats.newThisMonth', {
                count: usersStats?.newThisMonth ?? 0,
              }) || `+${usersStats?.newThisMonth ?? 0} this month`
            }
            icon={Users}
          />
        )}

        {coursesLoading ? (
          <Skeleton className='h-32' />
        ) : (
          <StatsCard
            title={t('stats.courses') || 'Courses'}
            value={coursesStats?.total ?? overview?.courses ?? 0}
            subtitle={
              t('stats.published', { count: coursesStats?.published ?? 0 }) ||
              `${coursesStats?.published ?? 0} published`
            }
            icon={BookOpen}
          />
        )}

        {labsLoading ? (
          <Skeleton className='h-32' />
        ) : (
          <StatsCard
            title={t('stats.labs') || 'Labs'}
            value={labsStats?.total ?? overview?.labs ?? 0}
            subtitle={
              t('stats.published', { count: labsStats?.published ?? 0 }) ||
              `${labsStats?.published ?? 0} published`
            }
            icon={FlaskConical}
          />
        )}

        {overviewLoading ? (
          <Skeleton className='h-32' />
        ) : (
          <StatsCard
            title={t('stats.totalEnrollments') || 'Total Enrollments'}
            value={overview?.enrollments ?? 0}
            subtitle={
              t('stats.labCompletions', {
                count: overview?.labCompletions ?? 0,
              }) || `${overview?.labCompletions ?? 0} lab completions`
            }
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
                {t('breakdown.users') || 'Users Breakdown'}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  {t('breakdown.total') || 'Total'}
                </span>
                <span className='font-semibold'>{usersStats.total}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  {t('breakdown.newThisMonth') || 'New This Month'}
                </span>
                <Badge variant='secondary'>{usersStats.newThisMonth}</Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  {t('breakdown.suspended') || 'Suspended'}
                </span>
                <Badge variant='destructive'>{usersStats.suspended}</Badge>
              </div>
              <div className='pt-2 border-t space-y-1'>
                <p className='text-xs text-muted-foreground mb-1'>
                  {t('breakdown.byRole') || 'By Role'}
                </p>
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
                {t('breakdown.courses') || 'Courses Breakdown'}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  {t('breakdown.total') || 'Total'}
                </span>
                <span className='font-semibold'>{coursesStats.total}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  {t('breakdown.published') || 'Published'}
                </span>
                <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'>
                  {coursesStats.published}
                </Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  {t('breakdown.unpublished') || 'Unpublished'}
                </span>
                <Badge variant='outline'>{coursesStats.unpublished}</Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  {t('breakdown.featured') || 'Featured'}
                </span>
                <Badge variant='secondary'>{coursesStats.featured}</Badge>
              </div>
              <div className='pt-2 border-t space-y-1'>
                <p className='text-xs text-muted-foreground mb-1'>
                  {t('breakdown.byState') || 'By State'}
                </p>
                {Object.entries(coursesStats.byState).map(([state, count]) => (
                  <div key={state} className='flex justify-between text-xs'>
                    <span className='capitalize'>
                      {state.replace('_', ' ')}
                    </span>
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
                {t('breakdown.labs') || 'Labs Breakdown'}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  {t('breakdown.total') || 'Total'}
                </span>
                <span className='font-semibold'>{labsStats.total}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  {t('breakdown.published') || 'Published'}
                </span>
                <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'>
                  {labsStats.published}
                </Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  {t('breakdown.unpublished') || 'Unpublished'}
                </span>
                <Badge variant='outline'>{labsStats.unpublished}</Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  {t('breakdown.completions') || 'Completions'}
                </span>
                <Badge variant='secondary'>{labsStats.totalCompletions}</Badge>
              </div>
              <div className='pt-2 border-t space-y-1'>
                <p className='text-xs text-muted-foreground mb-1'>
                  {t('breakdown.byDifficulty') || 'By Difficulty'}
                </p>
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
                <p className='text-sm text-muted-foreground'>
                  {t('overview.totalXP') || 'Total XP Awarded'}
                </p>
                <p className='text-2xl font-bold'>
                  {overview.totalXP.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='flex items-center gap-4 pt-6'>
              <UserPlus className='h-8 w-8 text-blue-500' />
              <div>
                <p className='text-sm text-muted-foreground'>
                  {t('overview.totalPoints') || 'Total Points Awarded'}
                </p>
                <p className='text-2xl font-bold'>
                  {overview.totalPoints.toLocaleString()}
                </p>
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
      {!hasAnyData && !isStillLoading && !showErrorAlert && (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-16'>
            <TrendingUp className='h-12 w-12 text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold mb-2'>
              {t('emptyState.title') || 'No Data Available'}
            </h3>
            <p className='text-sm text-muted-foreground text-center max-w-md'>
              {t('emptyState.description') ||
                'Start by adding users, courses, or labs to see analytics here.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
