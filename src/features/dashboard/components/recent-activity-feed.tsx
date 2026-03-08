import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, BookOpen, FlaskConical } from 'lucide-react';
import type { ActivityEvent } from '@/core/types';

interface RecentActivityFeedProps {
  activities: ActivityEvent[];
}

const TYPE_CONFIG = {
  user_registered: {
    icon: UserPlus,
    color: 'text-blue-500',
    label: 'New User',
    variant: 'secondary' as const,
  },
  course_enrolled: {
    icon: BookOpen,
    color: 'text-green-500',
    label: 'Enrollment',
    variant: 'default' as const,
  },
  lab_completed: {
    icon: FlaskConical,
    color: 'text-purple-500',
    label: 'Lab Done',
    variant: 'outline' as const,
  },
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-3 max-h-80 overflow-y-auto'>
          {activities.length === 0 && (
            <p className='text-sm text-muted-foreground text-center py-4'>
              No recent activity
            </p>
          )}
          {activities.map((event, idx) => {
            const config =
              TYPE_CONFIG[event.type] ?? TYPE_CONFIG.user_registered;
            const Icon = config.icon;
            const target = event.course?.title ?? event.lab?.title ?? '—';

            return (
              <div key={idx} className='flex items-start gap-3'>
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${config.color}`} />
                <div className='flex-1 min-w-0'>
                  <p className='text-sm'>
                    <span className='font-medium'>{event.user.name}</span>
                    {event.type === 'user_registered' && ' registered'}
                    {event.type === 'course_enrolled' &&
                      ` enrolled in ${target}`}
                    {event.type === 'lab_completed' && ` completed ${target}`}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {timeAgo(event.timestamp)}
                  </p>
                </div>
                <Badge variant={config.variant} className='text-xs shrink-0'>
                  {config.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
