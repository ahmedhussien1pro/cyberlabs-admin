// src/features/courses/components/course-state-dropdown.tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { coursesService } from '@/core/api/services';
import type { CourseState } from '@/core/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe, FileEdit, Clock, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseStateDropdownProps {
  courseId: string;
  currentState?: CourseState;
  isPublished: boolean;
}

const STATE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  PUBLISHED: {
    label: 'Published',
    icon: Globe,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20',
  },
  DRAFT: {
    label: 'Draft',
    icon: FileEdit,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20',
  },
  COMING_SOON: {
    label: 'Coming Soon',
    icon: Clock,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20',
  },
};

export function CourseStateDropdown({
  courseId,
  currentState,
  isPublished,
}: CourseStateDropdownProps) {
  const queryClient = useQueryClient();

  const effectiveState: CourseState =
    currentState ?? (isPublished ? 'PUBLISHED' : 'DRAFT');
  const config = STATE_CONFIG[effectiveState] ?? STATE_CONFIG['DRAFT'];
  const Icon = config.icon;

  const mutation = useMutation({
    mutationFn: (state: CourseState) =>
      coursesService.updateState(courseId, state),
    onSuccess: (_, state) => {
      toast.success(`State changed to ${STATE_CONFIG[state]?.label ?? state}`);
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
    onError: () => toast.error('Failed to update state'),
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className={cn(
            'h-7 gap-1.5 px-2 text-xs font-semibold border',
            config.bg,
            config.color,
          )}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <Loader2 className='h-3 w-3 animate-spin' />
          ) : (
            <Icon className='h-3 w-3' />
          )}
          {config.label}
          <ChevronDown className='h-2.5 w-2.5 opacity-60' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-44'>
        {(Object.entries(STATE_CONFIG) as [CourseState, (typeof STATE_CONFIG)[string]][]).map(
          ([state, cfg]) => {
            const ItemIcon = cfg.icon;
            return (
              <DropdownMenuItem
                key={state}
                disabled={state === effectiveState}
                onClick={() => mutation.mutate(state)}
                className={cn(
                  'gap-2 text-xs cursor-pointer',
                  state === effectiveState && 'opacity-50 cursor-default',
                )}
              >
                <ItemIcon className={cn('h-3.5 w-3.5', cfg.color)} />
                {cfg.label}
              </DropdownMenuItem>
            );
          },
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
