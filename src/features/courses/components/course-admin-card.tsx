// src/features/courses/components/course-admin-card.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { coursesService } from '@/core/api/services';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  BookOpen,
  Pencil,
  Eye,
  Trash2,
  Users,
  Layers,
  Crown,
  Unlock,
  LayoutTemplate,
  MonitorPlay,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/shared/constants';
import { CourseStateDropdown } from './course-state-dropdown';
import type { CourseListItem } from '@/core/types';

interface CourseAdminCardProps {
  course: CourseListItem;
}

const COLOR_MAP: Record<
  string,
  { gradient: string; border: string; icon: string }
> = {
  EMERALD: {
    gradient: 'from-emerald-500/25 via-emerald-900/30 to-emerald-950/60',
    border: 'border-emerald-500/25',
    icon: 'text-emerald-400',
  },
  BLUE: {
    gradient: 'from-blue-500/25 via-blue-900/30 to-blue-950/60',
    border: 'border-blue-500/25',
    icon: 'text-blue-400',
  },
  VIOLET: {
    gradient: 'from-violet-500/25 via-violet-900/30 to-violet-950/60',
    border: 'border-violet-500/25',
    icon: 'text-violet-400',
  },
  ORANGE: {
    gradient: 'from-orange-500/25 via-orange-900/30 to-orange-950/60',
    border: 'border-orange-500/25',
    icon: 'text-orange-400',
  },
  ROSE: {
    gradient: 'from-rose-500/25 via-rose-900/30 to-rose-950/60',
    border: 'border-rose-500/25',
    icon: 'text-rose-400',
  },
  CYAN: {
    gradient: 'from-cyan-500/25 via-cyan-900/30 to-cyan-950/60',
    border: 'border-cyan-500/25',
    icon: 'text-cyan-400',
  },
};

const DIFFICULTY_COLOR: Record<string, string> = {
  BEGINNER: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  INTERMEDIATE: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
  ADVANCED: 'border-orange-500/40 text-orange-400 bg-orange-500/10',
  EXPERT: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
};

export function CourseAdminCard({ course }: CourseAdminCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const colorKey = ((course as any).color ?? 'BLUE').toUpperCase();
  const colors = COLOR_MAP[colorKey] ?? COLOR_MAP['BLUE'];

  const deleteMutation = useMutation({
    mutationFn: () => coursesService.delete(course.id),
    onSuccess: () => {
      toast.success('Course deleted');
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: () =>
      toast.error('Cannot delete — course may have active enrollments'),
  });

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border transition-all duration-200',
        'hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5',
        `bg-gradient-to-br ${colors.gradient}`,
        colors.border,
      )}
    >
      {/* ── Thumbnail ── */}
      <div className='relative h-36 overflow-hidden bg-black/20'>
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            loading='lazy'
            className='h-full w-full object-cover opacity-75 transition-transform duration-300 group-hover:scale-105'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center'>
            <BookOpen className={cn('h-10 w-10 opacity-20', colors.icon)} />
          </div>
        )}

        {/* Top-left badges */}
        <div className='absolute left-2 top-2 flex flex-wrap gap-1'>
          {(course as any).isNew && (
            <span className='rounded-full bg-yellow-500/90 px-2 py-0.5 text-[10px] font-bold text-black'>
              NEW
            </span>
          )}
          {(course as any).isFeatured && (
            <span className='flex items-center gap-0.5 rounded-full bg-purple-500/90 px-2 py-0.5 text-[10px] font-bold text-white'>
              <Star className='h-2.5 w-2.5' /> Featured
            </span>
          )}
        </div>

        {/* Access badge — top-right */}
        {course.access && (
          <div className='absolute right-2 top-2'>
            <Badge
              variant='outline'
              className={cn(
                'h-5 gap-1 border px-1.5 text-[10px] font-bold',
                course.access === 'FREE'
                  ? 'border-emerald-500/50 bg-emerald-950/80 text-emerald-300'
                  : 'border-violet-500/50 bg-violet-950/80 text-violet-300',
              )}
            >
              {course.access === 'FREE' ? (
                <Unlock className='h-2.5 w-2.5' />
              ) : (
                <Crown className='h-2.5 w-2.5' />
              )}
              {course.access}
            </Badge>
          </div>
        )}

        {/* Difficulty — bottom-left */}
        {course.difficulty && (
          <div className='absolute bottom-2 left-2'>
            <Badge
              variant='outline'
              className={cn(
                'h-4 px-1.5 text-[9px] font-semibold',
                DIFFICULTY_COLOR[course.difficulty] ?? 'border-border/60',
              )}
            >
              {course.difficulty.charAt(0) +
                course.difficulty.slice(1).toLowerCase()}
            </Badge>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className='flex flex-1 flex-col gap-3 p-3'>
        {/* Title */}
        <div className='min-w-0'>
          <h3 className='truncate text-sm font-bold leading-snug'>
            {course.title}
          </h3>
          <p className='mt-0.5 truncate font-mono text-[10px] text-muted-foreground'>
            {course.slug}
          </p>
        </div>

        {/* Stats */}
        <div className='flex items-center gap-3 text-[11px] text-muted-foreground'>
          <span className='flex items-center gap-1'>
            <Users className='h-3 w-3' />
            {course._count.enrollments} enrolled
          </span>
          <span className='flex items-center gap-1'>
            <Layers className='h-3 w-3' />
            {course._count.sections}s / {course._count.lessons}l
          </span>
        </div>

        {/* State dropdown */}
        <CourseStateDropdown
          courseId={course.id}
          currentState={(course as any).state}
          isPublished={course.isPublished}
        />

        {/* Action buttons */}
        <div className='mt-auto grid grid-cols-4 gap-1 border-t border-border/30 pt-3'>
          {/* Platform Preview */}
          <Button
            variant='ghost'
            size='sm'
            title='Platform Preview'
            className='h-8 w-full p-0 text-muted-foreground hover:text-primary hover:bg-primary/10'
            onClick={() => navigate(ROUTES.COURSE_PLATFORM_PREVIEW(course.id))}
          >
            <MonitorPlay className='h-3.5 w-3.5' />
          </Button>

          {/* Edit Info */}
          <Link to={ROUTES.COURSE_EDIT(course.id)} className='w-full'>
            <Button
              variant='ghost'
              size='sm'
              title='Edit Info'
              className='h-8 w-full p-0 text-muted-foreground hover:text-foreground hover:bg-muted'
            >
              <Pencil className='h-3.5 w-3.5' />
            </Button>
          </Link>

          {/* Edit Curriculum */}
          <Button
            variant='ghost'
            size='sm'
            title='Edit Curriculum'
            className='h-8 w-full p-0 text-muted-foreground hover:text-primary hover:bg-primary/10'
            onClick={() => navigate(`/courses/${course.id}/content`)}
          >
            <LayoutTemplate className='h-3.5 w-3.5' />
          </Button>

          {/* View Detail */}
          <Link to={ROUTES.COURSE_DETAIL(course.id)} className='w-full'>
            <Button
              variant='ghost'
              size='sm'
              title='View Detail & Labs'
              className='h-8 w-full p-0 text-muted-foreground hover:text-foreground hover:bg-muted'
            >
              <Eye className='h-3.5 w-3.5' />
            </Button>
          </Link>
        </div>
      </div>

      {/* Delete button — appears on hover at top-right of thumbnail */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            className={cn(
              'absolute right-2 top-[4.5rem] opacity-0 group-hover:opacity-100 transition-opacity',
              'flex h-6 w-6 items-center justify-center rounded-full',
              'bg-destructive/80 text-white hover:bg-destructive shadow-md',
            )}
            title='Delete'
          >
            <Trash2 className='h-3 w-3' />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{course.title}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
