// src/features/courses/components/course-admin-card.tsx
// ✅ Fixed: improved delete error handling with backend message display
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCoursesApi } from '../services/admin-courses.api';
import { ROUTES } from '@/shared/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  BookOpen, Clock, Users, MoreVertical,
  Pencil, Trash2, Eye, ExternalLink,
  FlaskConical, Globe, Lock, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminCourse } from '../types/admin-course.types';

const STATE_STYLES = {
  PUBLISHED:    { label: 'Published',    class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  DRAFT:        { label: 'Draft',        class: 'bg-zinc-500/15   text-zinc-400   border-zinc-500/30' },
  COMING_SOON:  { label: 'Coming Soon',  class: 'bg-yellow-500/15  text-yellow-400  border-yellow-500/30' },
} as const;

const ACCESS_ICON = {
  FREE:    <Globe    className='h-3 w-3' />,
  PRO:     <Zap      className='h-3 w-3' />,
  PREMIUM: <Lock     className='h-3 w-3' />,
} as const;

const COLOR_BAR: Record<string, string> = {
  emerald: 'bg-emerald-500',
  blue:    'bg-blue-500',
  violet:  'bg-violet-500',
  orange:  'bg-orange-500',
  rose:    'bg-rose-500',
  cyan:    'bg-cyan-500',
};

interface Props {
  course: AdminCourse;
  view?: 'grid' | 'list';
}

export function CourseAdminCard({ course, view = 'grid' }: Props) {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const stateStyle = STATE_STYLES[course.state] ?? STATE_STYLES.DRAFT;
  const colorBar   = COLOR_BAR[course.color?.toLowerCase()] ?? 'bg-blue-500';

  const deleteMutation = useMutation({
    mutationFn: () => adminCoursesApi.delete(course.id),
    onSuccess: () => {
      toast.success(`"${course.title}" deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to delete course';
      toast.error(`Cannot delete: ${msg}`);
    },
  });

  if (view === 'list') {
    return (
      <div className='flex items-center gap-4 rounded-lg border border-border/50 bg-card px-4 py-3 hover:border-border transition-colors'>
        {/* Color dot */}
        <div className={cn('h-2 w-2 shrink-0 rounded-full', colorBar)} />

        {/* Title */}
        <div className='min-w-0 flex-1'>
          <p className='truncate font-medium text-sm'>{course.title}</p>
          {course.ar_title && (
            <p className='truncate text-xs text-muted-foreground' dir='rtl'>{course.ar_title}</p>
          )}
        </div>

        {/* Meta */}
        <div className='hidden sm:flex items-center gap-3 text-xs text-muted-foreground'>
          <span className='flex items-center gap-1'>
            <Users className='h-3 w-3' />{course.enrollmentCount ?? 0}
          </span>
          <span className='flex items-center gap-1'>
            <BookOpen className='h-3 w-3' />{course.totalTopics ?? 0}
          </span>
          {(course.labSlugs?.length ?? 0) > 0 && (
            <span className='flex items-center gap-1'>
              <FlaskConical className='h-3 w-3' />{course.labSlugs.length}
            </span>
          )}
        </div>

        {/* Badges */}
        <div className='hidden md:flex items-center gap-2'>
          <Badge variant='outline' className='text-[10px] gap-1'>
            {ACCESS_ICON[course.access as keyof typeof ACCESS_ICON]} {course.access}
          </Badge>
          <Badge variant='outline' className={cn('text-[10px]', stateStyle.class)}>
            {stateStyle.label}
          </Badge>
        </div>

        {/* Actions */}
        <div className='flex items-center gap-1'>
          <Button variant='ghost' size='icon' className='h-8 w-8'
            onClick={() => navigate(ROUTES.COURSE_EDIT(course.slug))}>
            <Pencil className='h-3.5 w-3.5' />
          </Button>
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <Button variant='ghost' size='icon' className='h-8 w-8 text-destructive hover:text-destructive'>
                <Trash2 className='h-3.5 w-3.5' />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{course.title}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The course and all its content will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate()}
                  className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    );
  }

  // ── Grid view ──
  return (
    <div className='group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-200 hover:border-border hover:shadow-md'>
      {/* Color bar */}
      <div className={cn('h-1 w-full shrink-0', colorBar)} />

      {/* Body */}
      <div className='flex flex-1 flex-col gap-3 p-4'>
        {/* Header row */}
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0 flex-1'>
            <p className='font-semibold text-sm leading-snug line-clamp-2'>{course.title}</p>
            {course.ar_title && (
              <p className='mt-0.5 text-xs text-muted-foreground/70 line-clamp-1' dir='rtl'>
                {course.ar_title}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity'>
                <MoreVertical className='h-3.5 w-3.5' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => navigate(ROUTES.COURSE_EDIT(course.slug))}>
                <Pencil className='h-3.5 w-3.5 mr-2' /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`${ROUTES.COURSE_EDIT(course.slug)}?tab=preview`)}>
                <Eye className='h-3.5 w-3.5 mr-2' /> Preview
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={`${import.meta.env.VITE_PLATFORM_URL ?? 'https://cyber-labs.tech'}/courses/${course.slug}`}
                  target='_blank' rel='noopener noreferrer'>
                  <ExternalLink className='h-3.5 w-3.5 mr-2' /> View on Platform
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='text-destructive focus:text-destructive'
                onClick={() => setDeleteOpen(true)}>
                <Trash2 className='h-3.5 w-3.5 mr-2' /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {course.description && (
          <p className='text-xs text-muted-foreground line-clamp-2 leading-relaxed'>
            {course.description}
          </p>
        )}

        {/* Badges */}
        <div className='flex flex-wrap gap-1.5'>
          <Badge variant='outline' className='text-[10px] gap-1'>
            {ACCESS_ICON[course.access as keyof typeof ACCESS_ICON]} {course.access}
          </Badge>
          <Badge variant='outline' className='text-[10px]'>{course.difficulty}</Badge>
          <Badge variant='outline' className={cn('text-[10px]', stateStyle.class)}>
            {stateStyle.label}
          </Badge>
        </div>

        {/* Stats */}
        <div className='mt-auto flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/30'>
          <span className='flex items-center gap-1'>
            <Users className='h-3 w-3' />{course.enrollmentCount ?? 0}
          </span>
          <span className='flex items-center gap-1'>
            <BookOpen className='h-3 w-3' />{course.totalTopics ?? 0} topics
          </span>
          {course.estimatedHours != null && (
            <span className='flex items-center gap-1 ml-auto'>
              <Clock className='h-3 w-3' />{course.estimatedHours}h
            </span>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className='flex border-t border-border/30'>
        <Button
          variant='ghost'
          className='flex-1 h-9 rounded-none rounded-bl-xl text-xs gap-1.5'
          onClick={() => navigate(ROUTES.COURSE_EDIT(course.slug))}>
          <Pencil className='h-3.5 w-3.5' /> Edit
        </Button>
        <div className='w-px bg-border/30' />
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant='ghost'
              className='flex-1 h-9 rounded-none rounded-br-xl text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10'>
              <Trash2 className='h-3.5 w-3.5' /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete "{course.title}"?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the course and all its curriculum data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Course'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
