// src/features/paths/components/path-admin-card.tsx
// CMS Phase 3: Frontend-identical path card + Admin Overlay + Inline Editing
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MapPin, BookOpen, Users, Lock, Unlock, Crown, Gem } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { PathAdminOverlayControls } from './path-admin-overlay-controls';
import { InlineEditable } from '@/features/courses/components/inline-editable';
import { pathsService } from '@/core/api/services';
import { PATHS_QUERY_KEYS } from '@/shared/constants/query-keys';
import type { LearningPathListItem } from '@/core/types/api.types';

const ACCESS_BADGE: Record<string, string> = {
  FREE:    'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  PRO:     'border-blue-500/40    text-blue-400    bg-blue-500/10',
  PREMIUM: 'border-violet-500/40  text-violet-400  bg-violet-500/10',
};
const ACCESS_ICON: Record<string, React.ElementType> = {
  FREE:    Unlock,
  PRO:     Crown,
  PREMIUM: Gem,
};

function PathThumbnail({ path, className }: { path: LearningPathListItem; className?: string }) {
  const img = path.thumbnail ?? (path as any).image;
  if (img) {
    return <img src={img} alt={path.title} loading='lazy' className={cn('w-full h-full object-cover', className)} />;
  }
  return (
    <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20'>
      <MapPin className='h-10 w-10 text-primary/60' />
    </div>
  );
}

interface Props {
  path: LearningPathListItem;
  index?: number;
}

export function PathAdminCard({ path, index = 0 }: Props) {
  const queryClient = useQueryClient();
  const access = (path as any).access ?? 'FREE';
  const AccessIcon = ACCESS_ICON[access] ?? Unlock;

  const updateMutation = useMutation({
    mutationFn: (data: { title?: string; description?: string; ar_title?: string }) =>
      pathsService.update(path.id, data as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PATHS_QUERY_KEYS.all }),
    onError: () => toast.error('Failed to save changes'),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        'group relative flex flex-col rounded-2xl border bg-card overflow-hidden',
        'transition-all duration-300 ring-1 ring-transparent',
        'hover:ring-primary/30 hover:shadow-xl hover:-translate-y-0.5',
      )}
    >
      {/* Admin Overlay */}
      <PathAdminOverlayControls path={path} />

      {/* Thumbnail */}
      <div className='relative aspect-video overflow-hidden bg-muted'>
        <PathThumbnail path={path} className='transition-transform duration-500 group-hover:scale-105' />

        {/* Status badge */}
        <div className='absolute top-2 start-2 z-20 pointer-events-none'>
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border',
            path.isPublished
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-zinc-500/20 border-zinc-500/40 text-zinc-300',
          )}>
            <span className={cn('h-1.5 w-1.5 rounded-full', path.isPublished ? 'bg-emerald-400' : 'bg-zinc-400')} />
            {path.isPublished ? 'Published' : 'Draft'}
          </span>
        </div>

        {/* Access badge */}
        {access !== 'FREE' && (
          <div className='absolute top-2 end-2 z-20 pointer-events-none'>
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border', ACCESS_BADGE[access])}>
              <AccessIcon className='h-2.5 w-2.5' />{access}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className='flex flex-col flex-1 p-4 gap-3'>
        {/* Title */}
        <div className='flex-1 min-w-0'>
          <InlineEditable
            value={path.title}
            onSave={(val) => updateMutation.mutateAsync({ title: val })}
            className='text-sm font-bold text-foreground leading-snug'
          />
          {path.ar_title && (
            <div className='mt-0.5' dir='rtl'>
              <InlineEditable
                value={path.ar_title}
                onSave={(val) => updateMutation.mutateAsync({ ar_title: val })}
                className='text-xs text-muted-foreground/70'
              />
            </div>
          )}
        </div>

        {/* Description */}
        {(path as any).description !== undefined && (
          <InlineEditable
            value={(path as any).description ?? ''}
            onSave={(val) => updateMutation.mutateAsync({ description: val })}
            as='textarea'
            className='text-xs text-muted-foreground leading-relaxed'
            placeholder='Add description...'
          />
        )}

        {/* Stats row */}
        <div className='mt-auto flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/30'>
          <span className='flex items-center gap-1'>
            <BookOpen className='h-3 w-3' />{path._count?.modules ?? 0} modules
          </span>
          <span className='flex items-center gap-1 ml-auto'>
            <Users className='h-3 w-3' />{path._count?.enrollments ?? 0} enrolled
          </span>
        </div>
      </div>
    </motion.div>
  );
}
