import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { ActivityEvent } from '@/core/types';
import { UserPlus, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityFeedProps {
  data?: ActivityEvent[];
}

export function RecentActivityFeed({ data }: RecentActivityFeedProps) {
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

  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'user_registered':
        return <UserPlus className="h-4 w-4 text-blue-600" />;
      case 'course_enrolled':
        return <BookOpen className="h-4 w-4 text-green-600" />;
      case 'lab_completed':
        return <CheckCircle className="h-4 w-4 text-purple-600" />;
    }
  };

  const getEventText = (event: ActivityEvent) => {
    switch (event.type) {
      case 'user_registered':
        return `${event.user.name} joined the platform`;
      case 'course_enrolled':
        return (
          <>
            {event.user.name} enrolled in <span className="font-medium">{event.course?.title}</span>
          </>
        );
      case 'lab_completed':
        return (
          <>
            {event.user.name} completed <span className="font-medium">{event.lab?.title}</span>
          </>
        );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest platform events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.slice(0, 10).map((event, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {getInitials(event.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  {getEventIcon(event.type)}
                  <p className="text-sm">{getEventText(event)}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
