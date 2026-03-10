// src/features/courses/components/course-admin-card.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminCoursesApi } from '../services/admin-courses.api';
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
  Trash2,
  Users,
  Crown,
  Unlock,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/shared/constants';
import { CourseStateControl } from './course-state-control';
import type { AdminCourse } from '../types/admin-course.types';

interface CourseAdminCardProps {
  course: AdminCourse;
}

const COLOR_MAP: Record<string, { gradient: string; border: string; icon: string }> = {
  emerald: {
    gradient: 'from-emerald-500/25 via-emerald-900/30 to-emerald-950/60',
    border: 'border-emerald-500/25',
    icon: 'text-emerald-400',
  },
  blue: {
    gradient: 'from-blue-500/25 via-blue-900/30 to-blue-950/60',
    border: 'border-blue-500/25',
    icon: 'text-blue-400',
  },
  violet: {
    gradient: 'from-violet-500/25 via-violet-900/30 to-violet-950/60',
    border: 'border-violet-500/25',
    icon: 'text-violet-400',
  },
  orange: {
    gradient: 'from-orange-500/25 via-orange-900/30 to-orange-950/60',
    border: 'border-orange-500/25',
    icon: 'text-orange-400',
  },
  rose: {
    gradient: 'from-rose-500/25 via-rose-900/30 to-rose-950/60',
    border: 'border-rose-500/25',
    icon: 'text-rose-400',
  },
  cyan: {
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

  const colorKey = (course.color ?? 'blue').toLowerCase();
  const colors = COLOR_MAP[colorKey] ?? COLOR_MAP['blue'];

  const deleteMutation = useMutation({
    mutationFn: () => adminCoursesApi.delete(course.id),
    onSuccess: () => {
      toast.success('Course deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
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
          {course.isNew && (
            <span className='rounded-full bg-yellow-500/90 px-2 py-0.5 text-[10px] font-bold text-black'>
              NEW
            </span>
          )}
          {course.isFeatured && (
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
            {course.enrollmentCount ?? 0} enrolled
          </span>
          <span className='text-muted-foreground/50'>·</span>
          <span>{course.totalTopics ?? 0} topics</span>
        </div>

        {/* ✅ State Control — 3 حالات صحيحة (compact badge) */}
        <CourseStateControl
          courseId={course.id}
          currentState={course.state}
          compact
        />

        {/* Action buttons */}
        <div className='mt-auto grid grid-cols-2 gap-1.5 border-t border-border/30 pt-3'>
          <Link to={ROUTES.COURSE_EDIT(course.slug)} className='w-full'>
            <Button
              variant='outline'
              size='sm'
              className='h-8 w-full gap-1.5 text-xs'
            >
              <Pencil className='h-3 w-3' />
              Edit
            </Button>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='h-8 w-full gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30'
                disabled={deleteMutation.isPending}
              >
                <Trash2 className='h-3 w-3' />
                Delete
              </Button>
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
      </div>
    </div>
  );
}
