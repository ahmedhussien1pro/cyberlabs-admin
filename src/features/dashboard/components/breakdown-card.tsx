// src/features/dashboard/components/breakdown-card.tsx
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface BreakdownRow {
  label: string;
  value: string | number;
  badge?: 'secondary' | 'destructive' | 'outline' | 'green';
}

export interface BreakdownSection {
  heading: string;
  rows: Array<[string, string | number]>;
}

interface Props {
  title: string;
  icon: React.ElementType;
  rows: BreakdownRow[];
  section?: BreakdownSection;
}

function badgeClass(variant: BreakdownRow['badge']) {
  if (variant === 'green') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
  return undefined;
}

export function BreakdownCard({ title, icon: Icon, rows, section }: Props) {
  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-base'>
          <Icon className='h-4 w-4' />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-2'>
        {rows.map(({ label, value, badge }) => (
          <div key={label} className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>{label}</span>
            {badge ? (
              <Badge
                variant={badge === 'green' ? undefined : badge}
                className={badgeClass(badge)}
              >
                {value}
              </Badge>
            ) : (
              <span className='font-semibold'>{value}</span>
            )}
          </div>
        ))}

        {section && (
          <div className='space-y-1 border-t pt-2'>
            <p className='mb-1 text-xs text-muted-foreground'>{section.heading}</p>
            {section.rows.map(([k, v]) => (
              <div key={k} className='flex justify-between text-xs'>
                <span className='capitalize'>{k.replace('_', ' ')}</span>
                <span className='font-medium'>{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
