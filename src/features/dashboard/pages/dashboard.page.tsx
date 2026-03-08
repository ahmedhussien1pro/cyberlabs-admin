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
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Users, BookOpen, FlaskConical, TrendingUp, Activity, Clock } from 'lucide-react';

export default function DashboardPage() {
  // Fetch all stats
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: analyticsService.getOverview,
    retry: 0,
  });

  const { data: usersStats, isLoading: usersLoading } = useQuery({
    queryKey: ['users', 'stats'],
    queryFn: usersService.getStats,
    retry: 0,
  });

  const { data: coursesStats, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', 'stats'],
    queryFn: coursesService.getStats,
    retry: 0,
  });

  const { data: labsStats, isLoading: labsLoading } = useQuery({
    queryKey: ['labs', 'stats'],
    queryFn: labsService.getStats,
    retry: 0,
  });

  const { data: growth } = useQuery({
    queryKey: ['analytics', 'growth'],
    queryFn: analyticsService.getGrowth,
    retry: 0,
  });

  const { data: engagement } = useQuery({
    queryKey: ['analytics', 'engagement'],
    queryFn: analyticsService.getEngagement,
    retry: 0,
  });

  // Check if we have ANY data
  const hasAnyData = usersStats || coursesStats || labsStats || overview;
  const isStillLoading = overviewLoading || usersLoading || coursesLoading || labsLoading;

  // Show info message if analytics APIs are not available
  const showAnalyticsWarning = overviewError && !isStillLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your CyberLabs platform</p>
      </div>

      {/* Analytics Warning */}
      {showAnalyticsWarning && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Analytics endpoints are currently unavailable. Showing basic stats only.
            <br />
            <span className="text-xs mt-1 block opacity-75">
              Contact backend team to enable analytics endpoints for full dashboard features.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {usersLoading ? (
          <Skeleton className="h-32" />
        ) : (
          <StatsCard
            title="Total Users"
            value={usersStats?.total ?? 0}
            change={overview?.usersChange}
            icon={Users}
          />
        )}

        {coursesLoading ? (
          <Skeleton className="h-32" />
        ) : (
          <StatsCard
            title="Total Courses"
            value={coursesStats?.total ?? 0}
            change={overview?.coursesChange}
            icon={BookOpen}
          />
        )}

        {labsLoading ? (
          <Skeleton className="h-32" />
        ) : (
          <StatsCard
            title="Total Labs"
            value={labsStats?.total ?? 0}
            change={overview?.labsChange}
            icon={FlaskConical}
          />
        )}

        {usersLoading ? (
          <Skeleton className="h-32" />
        ) : (
          <StatsCard
            title="Active Users"
            value={usersStats?.active ?? 0}
            icon={Activity}
          />
        )}
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Users Breakdown */}
        {usersStats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Users Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Users</span>
                <span className="font-semibold">{usersStats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active</span>
                <span className="font-semibold text-green-600">{usersStats.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Suspended</span>
                <span className="font-semibold text-red-600">{usersStats.suspended}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Admins</span>
                <span className="font-semibold text-blue-600">{usersStats.admins}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Courses Breakdown */}
        {coursesStats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Courses Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Courses</span>
                <span className="font-semibold">{coursesStats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Published</span>
                <span className="font-semibold text-green-600">{coursesStats.published}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Draft</span>
                <span className="font-semibold text-orange-600">{coursesStats.draft}</span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">By Difficulty</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Beginner</span>
                    <span>{coursesStats.byDifficulty.beginner}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Intermediate</span>
                    <span>{coursesStats.byDifficulty.intermediate}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Advanced</span>
                    <span>{coursesStats.byDifficulty.advanced}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Labs Breakdown */}
        {labsStats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Labs Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Labs</span>
                <span className="font-semibold">{labsStats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Published</span>
                <span className="font-semibold text-green-600">{labsStats.published}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Draft</span>
                <span className="font-semibold text-orange-600">{labsStats.draft}</span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">By Execution Mode</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Browser</span>
                    <span>{labsStats.byExecutionMode.browser}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Docker</span>
                    <span>{labsStats.byExecutionMode.docker}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Static</span>
                    <span>{labsStats.byExecutionMode.static}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts - Only show if data is available */}
      {(growth || engagement) && (
        <div className="grid gap-6 md:grid-cols-2">
          {growth && <GrowthChart data={growth} />}
          {engagement && <EngagementMetrics data={engagement} />}
        </div>
      )}

      {/* Empty State */}
      {!hasAnyData && !isStillLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              The dashboard will populate automatically once you have users, courses, and labs in your system.
              <br />
              Start by creating your first course or lab!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
