// src/features/badges/pages/badges-list.page.tsx
import { useQuery } from '@tanstack/react-query';
import { Award, Trophy, AlertCircle } from 'lucide-react';
import { badgesService } from '@/core/api/services';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BADGE_TYPE_META, DEFAULT_BADGE_META } from '../constants/type-meta';
import { groupBadgesByType } from '../utils/group-badges';
import { BadgeCard } from '../components';

export default function BadgesListPage() {
  const { data: badges, isLoading, error } = useQuery({
    queryKey: ['badges', 'all'],
    queryFn: badgesService.getAll,
    staleTime: 1000 * 60 * 10,
  });

  const grouped = badges ? groupBadgesByType(badges) : {};

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Badges</h1>
          <p className='mt-1 text-muted-foreground'>Platform achievement badges catalog</p>
        </div>
        {badges && (
          <Badge variant='secondary' className='px-3 py-1 text-sm'>
            <Award className='mr-1 h-3.5 w-3.5' />
            {badges.length} badges
          </Badge>
        )}
      </div>

      {isLoading && (
        <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className='h-52 rounded-xl' />
          ))}
        </div>
      )}

      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>Failed to load badges. Please try again.</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && badges?.length === 0 && (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-20'>
            <Trophy className='mb-4 h-14 w-14 text-muted-foreground' />
            <p className='text-lg font-medium text-muted-foreground'>No badges configured yet</p>
            <p className='mt-1 text-sm text-muted-foreground'>
              Badges are awarded automatically based on user activity.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error &&
        Object.entries(grouped).map(([type, items]) => {
          const meta = BADGE_TYPE_META[type] ?? DEFAULT_BADGE_META;
          const Icon = meta.icon;
          return (
            <section key={type} className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Icon className='h-5 w-5 text-muted-foreground' />
                <h2 className='text-lg font-semibold'>{meta.label} Badges</h2>
                <Badge variant='outline' className='text-xs'>{items.length}</Badge>
              </div>
              <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
                {items.map((badge) => <BadgeCard key={badge.id} badge={badge} />)}
              </div>
            </section>
          );
        })}
    </div>
  );
}
