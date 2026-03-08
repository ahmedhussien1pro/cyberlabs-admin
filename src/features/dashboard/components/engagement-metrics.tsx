import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EngagementMetrics } from '@/core/types';
import { Activity, Users, TrendingUp, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface EngagementMetricsProps {
  data?: EngagementMetrics;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function EngagementMetrics({ data }: EngagementMetricsProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Engagement Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      icon: Users,
      label: 'Active Users',
      value: data.activeUsers,
    },
    {
      icon: Activity,
      label: 'Lab Launches',
      value: data.labLaunches ?? 0,
    },
    {
      icon: TrendingUp,
      label: 'Completion Rate',
      value: `${data.completionRate}%`,
    },
    {
      icon: TrendingUp,
      label: 'Submissions',
      value: data.submissions ?? 0,
    },
    {
      icon: Clock,
      label: 'Avg Time/Lab',
      value: `${data.avgTimePerLab}min`,
    },
    {
      icon: Clock,
      label: 'Avg Session',
      value: data.avgSessionDuration ? formatDuration(data.avgSessionDuration) : 'N/A',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {metrics.map((metric, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <metric.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="text-lg font-semibold">{metric.value}</p>
              </div>
            </div>
          ))}
        </div>

        {data.topCategories && data.topCategories.length > 0 && (
          <div className="mt-6">
            <h4 className="mb-3 text-sm font-medium">Top Categories</h4>
            <div className="space-y-2">
              {data.topCategories.slice(0, 5).map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm">{cat.category}</span>
                  <span className="text-sm font-semibold">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
