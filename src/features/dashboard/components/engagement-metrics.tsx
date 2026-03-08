import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, FlaskConical, Clock } from 'lucide-react';
import type { EngagementMetrics as EngagementMetricsType } from '@/core/types';

interface EngagementMetricsProps {
  data: EngagementMetricsType;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMin = minutes % 60;
  return `${hours}h ${remainingMin}m`;
}

export function EngagementMetrics({ data }: EngagementMetricsProps) {
  const metrics = [
    {
      label: 'Active Users (30d)',
      value: data.activeUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Lab Launches (30d)',
      value: data.labLaunches.toLocaleString(),
      icon: FlaskConical,
      color: 'text-green-500',
    },
    {
      label: 'Submissions (30d)',
      value: data.submissions.toLocaleString(),
      icon: Activity,
      color: 'text-purple-500',
    },
    {
      label: 'Avg Session Duration',
      value: formatDuration(data.avgSessionDuration),
      icon: Clock,
      color: 'text-orange-500',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Metrics (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-4'>
          {metrics.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className='flex items-start gap-3 p-3 rounded-lg bg-muted/50'>
              <Icon className={`h-5 w-5 mt-0.5 ${color}`} />
              <div>
                <p className='text-xs text-muted-foreground'>{label}</p>
                <p className='text-lg font-bold'>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
