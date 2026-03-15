// src/features/badges/components/badge-card.tsx
import { Zap, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BadgeItem } from '@/core/api/services';
import { BADGE_TYPE_META, DEFAULT_BADGE_META } from '../constants/type-meta';

export function BadgeCard({ badge }: { badge: BadgeItem }) {
  const meta = BADGE_TYPE_META[badge.type?.toUpperCase()] ?? DEFAULT_BADGE_META;
  const Icon = meta.icon;

  return (
    <Card className='group overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md'>
      <div className={`h-1 w-full ${meta.colour.split(' ')[0]}`} />
      <CardContent className='pb-4 pt-5'>
        <div className='flex flex-col items-center gap-3 text-center'>
          <div className={`flex h-14 w-14 items-center justify-center rounded-full ${meta.colour}`}>
            {badge.imageUrl ? (
              <img
                src={badge.imageUrl}
                alt={badge.title}
                className='h-9 w-9 object-contain'
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <Icon className='h-7 w-7' />
            )}
          </div>

          <div className='space-y-0.5'>
            <h3 className='text-sm font-semibold leading-tight'>{badge.title}</h3>
            {badge.ar_title && (
              <p className='text-xs text-muted-foreground' dir='rtl'>{badge.ar_title}</p>
            )}
            {badge.description && (
              <p className='mt-1 line-clamp-2 text-xs text-muted-foreground'>{badge.description}</p>
            )}
          </div>

          <div className='flex flex-wrap items-center justify-center gap-2'>
            {badge.xpReward > 0 && (
              <Badge variant='secondary' className='gap-1 px-2 text-xs'>
                <Zap className='h-3 w-3 text-yellow-500' />
                {badge.xpReward} XP
              </Badge>
            )}
            {badge.pointsReward > 0 && (
              <Badge variant='outline' className='gap-1 px-2 text-xs'>
                <Star className='h-3 w-3 text-blue-500' />
                {badge.pointsReward} pts
              </Badge>
            )}
          </div>

          <Badge
            variant='outline'
            className={`text-[10px] font-medium uppercase tracking-wide ${meta.colour}`}
          >
            {meta.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
