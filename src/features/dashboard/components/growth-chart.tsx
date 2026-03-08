import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { GrowthTrends } from '@/core/types';
import { TrendingUp } from 'lucide-react';

interface GrowthChartProps {
  data?: GrowthTrends;
}

export function GrowthChart({ data }: GrowthChartProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-32' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-64' />
        </CardContent>
      </Card>
    );
  }

  // Calculate totals for display
  const totalNewUsers = data.users.reduce((sum, item) => sum + item.count, 0);
  const totalEnrollments = data.enrollments.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <TrendingUp className='h-5 w-5' />
          Growth Trends
        </CardTitle>
        <CardDescription>
          Monthly user registrations and course enrollments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {/* Summary Stats */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='rounded-lg border p-4'>
              <div className='text-2xl font-bold'>{totalNewUsers}</div>
              <div className='text-sm text-muted-foreground'>
                New Users (12 months)
              </div>
            </div>
            <div className='rounded-lg border p-4'>
              <div className='text-2xl font-bold'>{totalEnrollments}</div>
              <div className='text-sm text-muted-foreground'>
                Enrollments (12 months)
              </div>
            </div>
          </div>

          {/* Simple bar visualization */}
          <div className='space-y-3'>
            <div className='text-sm font-medium'>Recent Months</div>
            {data.users.slice(-6).map((item, idx) => (
              <div key={item.month} className='space-y-1'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground' key={idx}>
                    {item.month}
                  </span>
                  <span className='font-medium'>{item.count} users</span>
                </div>
                <div className='h-2 w-full overflow-hidden rounded-full bg-secondary'>
                  <div
                    className='h-full bg-primary transition-all'
                    style={{
                      width: `${(item.count / Math.max(...data.users.map((u) => u.count))) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
