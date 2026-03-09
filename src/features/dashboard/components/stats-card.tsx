import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  change?: number;
  icon: LucideIcon;
  accentColor?: 'blue' | 'green' | 'purple' | 'orange' | 'yellow' | 'red';
}

const accentMap = {
  blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-500',   border: 'border-l-blue-500' },
  green:  { bg: 'bg-green-500/10',  text: 'text-green-500',  border: 'border-l-green-500' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-l-purple-500' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-l-orange-500' },
  yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-l-yellow-500' },
  red:    { bg: 'bg-red-500/10',    text: 'text-red-500',    border: 'border-l-red-500' },
};

export function StatsCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  accentColor = 'blue',
}: StatsCardProps) {
  const colors = accentMap[accentColor];
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <Card
      className={cn(
        'border-l-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
        colors.border,
      )}
    >
      <CardContent className='p-6'>
        <div className='flex items-start justify-between'>
          <div className='space-y-1 flex-1 min-w-0'>
            <p className='text-sm font-medium text-muted-foreground truncate'>
              {title}
            </p>
            <p className='text-2xl font-bold tracking-tight'>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className='text-xs text-muted-foreground'>{subtitle}</p>
            )}
            {change !== undefined && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-medium mt-1',
                  isPositive && 'text-green-600 dark:text-green-400',
                  isNegative && 'text-red-600 dark:text-red-400',
                  !isPositive && !isNegative && 'text-muted-foreground',
                )}
              >
                {isPositive ? (
                  <TrendingUp className='h-3 w-3' />
                ) : isNegative ? (
                  <TrendingDown className='h-3 w-3' />
                ) : (
                  <Minus className='h-3 w-3' />
                )}
                {isPositive && '+'}
                {change}% vs last month
              </div>
            )}
          </div>
          <div className={cn('rounded-xl p-3 ml-3 shrink-0', colors.bg)}>
            <Icon className={cn('h-6 w-6', colors.text)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
