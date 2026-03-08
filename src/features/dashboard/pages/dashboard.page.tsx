import { useQuery } from '@tanstack/react-query';
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
        <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
        <p className='text-muted-foreground'>
          CyberLabs platform overview — real-time stats
        </p>
      </div>

      {/* Analytics Warning */}
      {showAnalyticsWarning && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Analytics endpoints are unavailable. Check that the backend is
            running and your JWT token is valid.
          </AlertDescription>
        </Alert>
      )}

      {/* Primary KPI Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {usersLoading ? (
          <Skeleton className='h-32' />
        ) : (
          <StatsCard
            title='Total Users'
            value={usersStats?.total ?? overview?.users ?? 0}
            subtitle={`+${usersStats?.newThisMonth ?? 0} this month`}
            icon={Users}
          />
        )}

        {coursesLoading ? (
          <Skeleton className='h-32' />
        ) : (
          <StatsCard
            title='Courses'
            value={coursesStats?.total ?? overview?.courses ?? 0}
            subtitle={`${coursesStats?.published ?? 0} published`}
            icon={BookOpen}
          />
        )}

        {labsLoading ? (
          <Skeleton className='h-32' />
        ) : (
          <StatsCard
            title='Labs'
            value={labsStats?.total ?? overview?.labs ?? 0}
            subtitle={`${labsStats?.published ?? 0} published`}
            icon={FlaskConical}
          />
        )}

        {overviewLoading ? (
          <Skeleton className='h-32' />
        ) : (
          <StatsCard
            title='Total Enrollments'
            value={overview?.enrollments ?? 0}
            subtitle={`${overview?.labCompletions ?? 0} lab completions`}
            icon={GraduationCap}
          />
        )}
      </div>

      {/* Secondary Stats Row */}
      <div className='grid gap-4 md:grid-cols-3'>
        {/* Users Breakdown */}
        {usersStats && (
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <Users className='h-4 w-4' />
                Users Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Total</span>
                <span className='font-semibold'>{usersStats.total}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  New This Month
                </span>
                <Badge variant='secondary'>{usersStats.newThisMonth}</Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Suspended</span>
                <Badge variant='destructive'>{usersStats.suspended}</Badge>
              </div>
              <div className='pt-2 border-t space-y-1'>
                <p className='text-xs text-muted-foreground mb-1'>By Role</p>
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

        {/* Courses Breakdown */}
        {coursesStats && (
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <BookOpen className='h-4 w-4' />
                Courses Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Total</span>
                <span className='font-semibold'>{coursesStats.total}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Published</span>
                <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'>
                  {coursesStats.published}
                </Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  Unpublished
                </span>
                <Badge variant='outline'>{coursesStats.unpublished}</Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Featured</span>
                <Badge variant='secondary'>{coursesStats.featured}</Badge>
              </div>
              <div className='pt-2 border-t space-y-1'>
                <p className='text-xs text-muted-foreground mb-1'>By State</p>
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

        {/* Labs Breakdown */}
        {labsStats && (
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <FlaskConical className='h-4 w-4' />
                Labs Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Total</span>
                <span className='font-semibold'>{labsStats.total}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Published</span>
                <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'>
                  {labsStats.published}
                </Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  Unpublished
                </span>
                <Badge variant='outline'>{labsStats.unpublished}</Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  Completions
                </span>
                <Badge variant='secondary'>{labsStats.totalCompletions}</Badge>
              </div>
              <div className='pt-2 border-t space-y-1'>
                <p className='text-xs text-muted-foreground mb-1'>
                  By Difficulty
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
                  Total XP Awarded
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
                  Total Points Awarded
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
      {!hasAnyData && !isStillLoading && (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-16'>
            <TrendingUp className='h-12 w-12 text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold mb-2'>No Data Available</h3>
            <p className='text-sm text-muted-foreground text-center max-w-md'>
              The dashboard will populate automatically once you have users,
              courses, and labs. Start by creating your first course or lab!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
