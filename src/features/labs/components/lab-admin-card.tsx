// src/features/labs/components/lab-admin-card.tsx
// CMS Phase 2: Frontend-identical lab card + Admin Overlay + Inline Editing
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  FlaskConical,
  Terminal,
  Users,
  BarChart3,
  Target,
  Clock,
  BookOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { LabAdminOverlayControls } from './lab-admin-overlay-controls';
import { InlineEditable } from './inline-editable';
import { labsService } from '@/core/api/services';
import type { LabListItem } from '@/core/types';

// ── Color maps by difficulty ──────────────────────────────────────────────
const DIFF_BG: Record<string, string> = {
  BEGINNER: 'from-emerald-950 to-emerald-900 border-emerald-800/50',
  INTERMEDIATE: 'from-blue-950    to-blue-900    border-blue-800/50',
  ADVANCED: 'from-violet-950  to-violet-900  border-violet-800/50',
  EXPERT: 'from-rose-950    to-rose-900    border-rose-800/50',
};
const DIFF_TEXT: Record<string, string> = {
  BEGINNER: 'text-emerald-400',
  INTERMEDIATE: 'text-blue-400',
  ADVANCED: 'text-violet-400',
  EXPERT: 'text-rose-400',
};
const DIFF_RING: Record<string, string> = {
  BEGINNER: 'hover:ring-emerald-500/30',
  INTERMEDIATE: 'hover:ring-blue-500/30',
  ADVANCED: 'hover:ring-violet-500/30',
  EXPERT: 'hover:ring-rose-500/30',
};
const DIFF_BADGE: Record<string, string> = {
  BEGINNER: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  INTERMEDIATE: 'border-blue-500/40    text-blue-400    bg-blue-500/10',
  ADVANCED: 'border-violet-500/40  text-violet-400  bg-violet-500/10',
  EXPERT: 'border-rose-500/40    text-rose-400    bg-rose-500/10',
};
const EXEC_ICON: Record<string, React.ElementType> = {
  BROWSER: BookOpen,
  DOCKER: Terminal,
  VM: Terminal,
};

function LabThumbnail({
  lab,
  className,
}: {
  lab: LabListItem;
  className?: string;
}) {
  const img = (lab as any).thumbnail ?? (lab as any).image;
  const diff = lab.difficulty ?? 'INTERMEDIATE';
  if (img) {
    return (
      <img
        src={img}
        alt={lab.title}
        loading='lazy'
        className={cn('w-full h-full object-cover', className)}
      />
    );
  }
  return (
    <div
      className={cn(
        'w-full h-full flex items-center justify-center bg-gradient-to-br border',
        DIFF_BG[diff] ?? 'from-zinc-900 to-zinc-800 border-zinc-700',
      )}>
      <FlaskConical
        className={cn('h-10 w-10', DIFF_TEXT[diff] ?? 'text-zinc-400')}
      />
    </div>
  );
}

interface Props {
  lab: LabListItem;
  index?: number;
}

export function LabAdminCard({ lab, index = 0 }: Props) {
  const queryClient = useQueryClient();
  const diff = lab.difficulty ?? 'INTERMEDIATE';
  const ExecIcon = EXEC_ICON[lab.executionMode ?? 'BROWSER'] ?? BookOpen;

  const updateMutation = useMutation({
    mutationFn: (data: { title?: string; description?: string }) =>
      labsService.update(lab.id, data as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['labs'] }),
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
        DIFF_RING[diff],
        'hover:shadow-xl hover:-translate-y-0.5',
      )}>
      {/* Admin Overlay */}
      <LabAdminOverlayControls lab={lab} />

      {/* Thumbnail */}
      <div className='relative aspect-video overflow-hidden bg-muted'>
        <LabThumbnail
          lab={lab}
          className='transition-transform duration-500 group-hover:scale-105'
        />

        {/* Status badge */}
        <div className='absolute top-2 start-2 z-20 pointer-events-none'>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border',
              lab.isPublished
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-zinc-500/20 border-zinc-500/40 text-zinc-300',
            )}>
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                lab.isPublished ? 'bg-emerald-400' : 'bg-zinc-400',
              )}
            />
            {lab.isPublished ? 'Published' : 'Draft'}
          </span>
        </div>

        {/* Execution mode badge */}
        {lab.executionMode && (
          <div className='absolute top-2 end-2 z-20 pointer-events-none'>
            <span className='inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-black/40 text-white/80 border border-white/10'>
              <ExecIcon className='h-2.5 w-2.5' />
              {lab.executionMode}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className='flex flex-col flex-1 p-4 gap-3'>
        {/* Title */}
        <div className='flex-1 min-w-0'>
          <InlineEditable
            value={lab.title}
            onSave={(val) => updateMutation.mutateAsync({ title: val })}
            className='text-sm font-bold text-foreground leading-snug'
          />
          {(lab as any).ar_title && (
            <div className='mt-0.5' dir='rtl'>
              <InlineEditable
                value={(lab as any).ar_title}
                onSave={(val) =>
                  updateMutation.mutateAsync({ ar_title: val } as any)
                }
                className='text-xs text-muted-foreground/70'
              />
            </div>
          )}
        </div>

        {/* Description */}
        {(lab as any).description !== undefined && (
          <InlineEditable
            value={(lab as any).description ?? ''}
            onSave={(val) => updateMutation.mutateAsync({ description: val })}
            as='textarea'
            className='text-xs text-muted-foreground leading-relaxed'
            placeholder='Add description...'
          />
        )}

        {/* Badges */}
        <div className='flex flex-wrap items-center gap-1.5'>
          {lab.difficulty && (
            <Badge
              variant='outline'
              className={cn(
                'gap-1 text-[10px] font-semibold',
                DIFF_BADGE[lab.difficulty],
              )}>
              <BarChart3 className='h-3 w-3' />{' '}
              {lab.difficulty.charAt(0) + lab.difficulty.slice(1).toLowerCase()}
            </Badge>
          )}
          {lab.category && (
            <Badge
              variant='outline'
              className='gap-1 text-[10px] text-muted-foreground border-border/40'>
              <Target className='h-3 w-3' /> {lab.category.replace(/_/g, ' ')}
            </Badge>
          )}
          {(lab as any).estimatedTime && (
            <Badge
              variant='outline'
              className='gap-1 text-[10px] text-primary border-primary/30 bg-primary/5'>
              <Clock className='h-3 w-3' /> {(lab as any).estimatedTime}m
            </Badge>
          )}
        </div>

        {/* Stats row */}
        <div className='mt-auto flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/30'>
          <span className='flex items-center gap-1'>
            <Users className='h-3 w-3' />
            {lab._count?.submissions ?? 0} submissions
          </span>
          {(lab._count?.usersProgress ?? 0) > 0 && (
            <span className='flex items-center gap-1 ml-auto'>
              <FlaskConical className='h-3 w-3' />
              {lab._count.usersProgress} in progress
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
