import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  /** Optional sub-text shown beneath the value (e.g. "+5 this month") */
  subtitle?: string;
  change?: number;
  icon: LucideIcon;
}

export function StatsCard({ title, value, subtitle, change, icon: Icon }: StatsCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {change !== undefined && change !== 0 && (
              <p
                className={cn(
                  'text-xs',
                  isPositive && 'text-green-600',
                  isNegative && 'text-red-600'
                )}
              >
                {isPositive && '+'}
                {change}% from last month
              </p>
            )}
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
