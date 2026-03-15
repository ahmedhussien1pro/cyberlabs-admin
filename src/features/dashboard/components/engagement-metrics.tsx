// src/features/dashboard/components/engagement-metrics.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, FlaskConical, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EngagementMetrics as EngagementMetricsType } from '@/core/types';
import { formatDuration } from '../utils/format-duration';

interface EngagementMetricsProps {
  data: EngagementMetricsType;
}

const METRICS = [
  {
    key: 'activeUsers' as const,
    label: 'Active Users',
    sublabel: 'last 30 days',
    icon: Users,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    barColor: 'bg-blue-500',
  },
  {
    key: 'labLaunches' as const,
    label: 'Lab Launches',
    sublabel: 'last 30 days',
    icon: FlaskConical,
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    barColor: 'bg-purple-500',
  },
  {
    key: 'submissions' as const,
    label: 'Submissions',
    sublabel: 'last 30 days',
    icon: Activity,
    iconColor: 'text-green-500',
    bgColor: 'bg-green-500/10',
    barColor: 'bg-green-500',
  },
  {
    key: 'avgSessionDuration' as const,
    label: 'Avg Session',
    sublabel: 'per lab attempt',
    icon: Clock,
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    barColor: 'bg-orange-500',
    format: formatDuration,
  },
];

export function EngagementMetrics({ data }: EngagementMetricsProps) {
  const numericValues = [
    data.activeUsers,
    data.labLaunches,
    data.submissions,
    data.avgSessionDuration,
  ];
  const maxVal = Math.max(...numericValues, 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Metrics (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {METRICS.map(({ key, label, sublabel, icon: Icon, iconColor, bgColor, barColor, format }) => {
            const raw = data[key];
            const displayVal = format ? format(raw) : raw.toLocaleString();
            const pct = Math.min((raw / maxVal) * 100, 100);

            return (
              <div key={key} className='flex items-center gap-3'>
                <div className={cn('rounded-lg p-2 shrink-0', bgColor)}>
                  <Icon className={cn('h-4 w-4', iconColor)} />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between mb-1'>
                    <div>
                      <span className='text-sm font-medium'>{label}</span>
                      <span className='text-xs text-muted-foreground ml-1.5'>
                        {sublabel}
                      </span>
                    </div>
                    <span className='text-sm font-bold tabular-nums'>
                      {displayVal}
                    </span>
                  </div>
                  <div className='h-1.5 bg-muted rounded-full overflow-hidden'>
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        barColor,
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
