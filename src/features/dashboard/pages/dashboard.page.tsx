import { useQuery } from '@tanstack/react-query';
import { analyticsService, usersService, coursesService, labsService } from '@/core/api/services';
import { StatsCards } from '../components/stats-cards';
import { GrowthChart } from '../components/growth-chart';
import { EngagementMetrics } from '../components/engagement-metrics';
import { TopContentTable } from '../components/top-content-table';
import { RecentActivityFeed } from '../components/recent-activity-feed';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: analyticsService.getOverview,
  });

  const { data: userStats } = useQuery({
    queryKey: ['users', 'stats'],
    queryFn: usersService.getStats,
  });

  const { data: courseStats } = useQuery({
    queryKey: ['courses', 'stats'],
    queryFn: coursesService.getStats,
  });

  const { data: labStats } = useQuery({
    queryKey: ['labs', 'stats'],
    queryFn: labsService.getStats,
  });

  const { data: growth } = useQuery({
    queryKey: ['analytics', 'growth'],
    queryFn: analyticsService.getGrowth,
  });

  const { data: engagement } = useQuery({
    queryKey: ['analytics', 'engagement'],
    queryFn: analyticsService.getEngagement,
  });

  const { data: topContent } = useQuery({
    queryKey: ['analytics', 'top-content'],
    queryFn: analyticsService.getTopContent,
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['analytics', 'recent-activity'],
    queryFn: analyticsService.getRecentActivity,
  });

  if (overviewError) {
    return (
      <div className="flex h-full items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and analytics</p>
      </div>

      {/* Stats Cards */}
      {overviewLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <StatsCards
          overview={overview}
          userStats={userStats}
          courseStats={courseStats}
          labStats={labStats}
        />
      )}

      {/* Growth Chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GrowthChart data={growth} />
        <EngagementMetrics data={engagement} />
      </div>

      {/* Top Content & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopContentTable data={topContent} />
        <RecentActivityFeed data={recentActivity} />
      </div>
    </div>
  );
}
