// src/features/dashboard/components/xp-banner.tsx
import { Trophy, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Props { totalXP: number; totalPoints: number; }

export function XpBanner({ totalXP, totalPoints }: Props) {
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <Card className='border-l-4 border-l-yellow-500'>
        <CardContent className='flex items-center gap-4 pt-6'>
          <div className='rounded-xl bg-yellow-500/10 p-3'>
            <Trophy className='h-7 w-7 text-yellow-500' />
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Total XP Awarded</p>
            <p className='text-2xl font-bold'>{totalXP.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
      <Card className='border-l-4 border-l-blue-500'>
        <CardContent className='flex items-center gap-4 pt-6'>
          <div className='rounded-xl bg-blue-500/10 p-3'>
            <UserPlus className='h-7 w-7 text-blue-500' />
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Total Points Awarded</p>
            <p className='text-2xl font-bold'>{totalPoints.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
