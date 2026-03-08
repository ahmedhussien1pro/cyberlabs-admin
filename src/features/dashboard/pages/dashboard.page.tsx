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
import { TopContent } from '../components/top-content';
import { RecentActivity } from '../components/recent-activity';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Users, BookOpen, FlaskConical, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  // Fetch all stats
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useQuery({
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

  // Show error if main overview fails
  if (overviewError) {
    console.error('Dashboard overview error:', overviewError);
    return (
      <div className="flex h-full items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. This might be a backend connectivity issue.
            <br />
            <span className="text-xs mt-2 block opacity-75">
              Check console for details or verify API endpoint configuration.
            </span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your CyberLabs platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewLoading || usersLoading ? (
          <Skeleton className="h-32" />
        ) : (
          <StatsCard
            title="Total Users"
            value={usersStats?.total ?? overview?.users ?? 0}
            change={overview?.usersGrowth ?? 0}
            icon={Users}
          />
        )}

        {overviewLoading || coursesLoading ? (
          <Skeleton className="h-32" />
        ) : (
          <StatsCard
            title="Courses"
            value={coursesStats?.total ?? overview?.courses ?? 0}
            change={overview?.coursesGrowth ?? 0}
            icon={BookOpen}
          />
        )}

        {overviewLoading || labsLoading ? (
          <Skeleton className="h-32" />
        ) : (
          <StatsCard
            title="Labs"
            value={labsStats?.total ?? overview?.labs ?? 0}
            change={overview?.labsGrowth ?? 0}
            icon={FlaskConical}
          />
        )}

        {overviewLoading ? (
          <Skeleton className="h-32" />
        ) : (
          <StatsCard
            title="Total Completions"
            value={overview?.completions ?? 0}
            change={overview?.completionsGrowth ?? 0}
            icon={TrendingUp}
          />
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <GrowthChart data={growth} />
        <EngagementMetrics data={engagement} />
      </div>

      {/* Content & Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <TopContent data={topContent} />
        <RecentActivity data={recentActivity} />
      </div>
    </div>
  );
}
