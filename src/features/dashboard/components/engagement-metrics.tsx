import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { EngagementMetrics as EngagementData } from '@/core/types';
import { Activity, Play, Send, Clock } from 'lucide-react';

interface EngagementMetricsProps {
  data?: EngagementData;
}

export function EngagementMetrics({ data }: EngagementMetricsProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const metrics = [
    {
      label: 'Active Users',
      value: data.activeUsers,
      icon: Activity,
      description: 'Last 30 days',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
    },
    {
      label: 'Lab Launches',
      value: data.labLaunches,
      icon: Play,
      description: 'Last 30 days',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-950',
    },
    {
      label: 'Submissions',
      value: data.submissions,
      icon: Send,
      description: 'Last 30 days',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-950',
    },
    {
      label: 'Avg. Session',
      value: formatDuration(data.avgSessionDuration),
      icon: Clock,
      description: 'Average duration',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-950',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Engagement Metrics
        </CardTitle>
        <CardDescription>User activity over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-2 ${metric.bgColor}`}>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
                <div className="text-xs text-muted-foreground">{metric.description}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
