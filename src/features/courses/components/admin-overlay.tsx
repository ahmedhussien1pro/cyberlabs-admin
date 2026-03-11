// AdminOverlay — يظهر عند hover على الكارد
import { useNavigate }   from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast }          from 'sonner';
import { Edit2, Eye, Globe, EyeOff, Copy, Trash2 } from 'lucide-react';
import { cn }             from '@/lib/utils';
import { adminCoursesApi } from '../services/admin-courses.api';
import { ROUTES }         from '@/shared/constants';
import type { AdminCourse } from '../types/admin-course.types';

interface Props {
  course: AdminCourse;
}

export function AdminOverlay({ course }: Props) {
  const navigate      = useNavigate();
  const queryClient   = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });

  const publishMut = useMutation({
    mutationFn: () =>
      course.state === 'PUBLISHED'
        ? adminCoursesApi.unpublish(course.id)
        : adminCoursesApi.publish(course.id),
    onSuccess: () => {
      toast.success(
        course.state === 'PUBLISHED' ? 'Course unpublished' : 'Course published',
      );
      invalidate();
    },
    onError: () => toast.error('Failed to update state'),
  });

  const dupMut = useMutation({
    mutationFn: () => adminCoursesApi.duplicate(course.id),
    onSuccess: (newCourse) => {
      toast.success('Course duplicated');
      invalidate();
      navigate(ROUTES.COURSE_EDIT(newCourse.slug));
    },
    onError: () => toast.error('Failed to duplicate'),
  });

  const deleteMut = useMutation({
    mutationFn: () => adminCoursesApi.delete(course.id),
    onSuccess: () => {
      toast.success('Course deleted');
      invalidate();
    },
    onError: () => toast.error('Failed to delete'),
  });

  const btns = [
    {
      label: 'Edit',
      icon: Edit2,
      className: 'bg-primary text-primary-foreground hover:bg-primary/90',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        navigate(ROUTES.COURSE_EDIT(course.slug));
      },
    },
    {
      label: 'Preview',
      icon: Eye,
      className: 'bg-background/90 text-foreground hover:bg-muted',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        navigate(ROUTES.COURSE_EDIT(course.slug) + '?tab=preview');
      },
    },
    {
      label: course.state === 'PUBLISHED' ? 'Unpublish' : 'Publish',
      icon: course.state === 'PUBLISHED' ? EyeOff : Globe,
      className:
        course.state === 'PUBLISHED'
          ? 'bg-amber-500/90 text-white hover:bg-amber-500'
          : 'bg-emerald-500/90 text-white hover:bg-emerald-500',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        publishMut.mutate();
      },
      loading: publishMut.isPending,
    },
    {
      label: 'Duplicate',
      icon: Copy,
      className: 'bg-background/90 text-foreground hover:bg-muted',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        dupMut.mutate();
      },
      loading: dupMut.isPending,
    },
    {
      label: 'Delete',
      icon: Trash2,
      className: 'bg-destructive/90 text-white hover:bg-destructive',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        deleteMut.mutate();
      },
      loading: deleteMut.isPending,
    },
  ];

  return (
    <div
      className={
        cn(
          'absolute inset-0 z-10 flex flex-col items-center justify-center gap-1.5 rounded-2xl',
          'bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100',
          'transition-opacity duration-200 p-3',
        )
      }
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      {btns.map(({ label, icon: Icon, className, onClick, loading }) => (
        <button
          key={label}
          onClick={onClick}
          disabled={loading}
          className={cn(
            'w-full max-w-[160px] flex items-center justify-center gap-2 rounded-lg px-3 py-1.5',
            'text-xs font-semibold transition-colors disabled:opacity-60',
            className,
          )}
        >
          <Icon className='h-3.5 w-3.5' />
          {loading ? '...' : label}
        </button>
      ))}
    </div>
  );
}
