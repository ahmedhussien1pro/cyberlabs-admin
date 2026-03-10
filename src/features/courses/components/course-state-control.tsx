import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCoursesApi } from '../services/admin-courses.api';
import type { CourseState } from '../types/admin-course.types';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const STATE_CONFIG: Record<
  CourseState,
  { label: string; arLabel: string; class: string }
> = {
  PUBLISHED: {
    label: 'Published',
    arLabel: 'منشور',
    class:
      'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25',
  },
  COMING_SOON: {
    label: 'Coming Soon',
    arLabel: 'قريباً',
    class:
      'bg-yellow-500/15 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/25',
  },
  DRAFT: {
    label: 'Draft',
    arLabel: 'مسودة',
    class:
      'bg-zinc-500/15 text-zinc-400 border-zinc-500/30 hover:bg-zinc-500/25',
  },
};

const STATES: CourseState[] = ['PUBLISHED', 'COMING_SOON', 'DRAFT'];

interface Props {
  courseId: string;
  currentState: CourseState;
  onStateChange?: (newState: CourseState) => void;
  compact?: boolean;
}

export function CourseStateControl({
  courseId,
  currentState,
  onStateChange,
  compact,
}: Props) {
  const queryClient = useQueryClient();
  const [optimisticState, setOptimisticState] =
    useState<CourseState>(currentState);

  const { mutate, isPending } = useMutation({
    mutationFn: (state: CourseState) =>
      adminCoursesApi.setState(courseId, state),
    onMutate: (newState) => {
      setOptimisticState(newState);
    },
    onSuccess: (_, newState) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      onStateChange?.(newState);
      toast.success(`Course state updated to ${STATE_CONFIG[newState].label}`);
    },
    onError: () => {
      setOptimisticState(currentState);
      toast.error('Failed to update course state');
    },
  });

  if (compact) {
    // Badge فقط — للعرض في الكارد
    const cfg = STATE_CONFIG[optimisticState];
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold',
          cfg.class,
        )}>
        {cfg.label}
      </span>
    );
  }

  return (
    <div className='flex items-center gap-1.5'>
      {isPending && (
        <Loader2 className='h-3.5 w-3.5 animate-spin text-muted-foreground' />
      )}
      {STATES.map((state) => {
        const cfg = STATE_CONFIG[state];
        const isActive = optimisticState === state;
        return (
          <button
            key={state}
            disabled={isPending || isActive}
            onClick={() => mutate(state)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-semibold transition-all',
              isActive
                ? cfg.class + ' cursor-default'
                : 'border-border/50 bg-transparent text-muted-foreground hover:bg-muted',
            )}>
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}
