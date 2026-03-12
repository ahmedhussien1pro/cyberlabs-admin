// src/features/courses/components/admin-overlay-controls.tsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Pencil, Trash2, Globe, EyeOff, Copy, ExternalLink, Loader2,
} from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { adminCoursesApi } from '../services/admin-courses.api';
import { getPlatformCourseUrl } from '../utils/course-utils';
import { ROUTES } from '@/shared/constants';
import type { AdminCourse } from '../types/admin-course.types';

interface AdminOverlayControlsProps {
  course: AdminCourse;
  className?: string;
}

export function AdminOverlayControls({ course, className }: AdminOverlayControlsProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] }),
    [queryClient],
  );

  const isPublished = course.state === 'PUBLISHED';

  // ── Publish toggle with optimistic update ────────────────────────────
  const publishMutation = useMutation({
    mutationFn: () =>
      adminCoursesApi.setState(
        course.id,
        isPublished ? 'DRAFT' : 'PUBLISHED',
      ),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'courses'] });
      const snapshot = queryClient.getQueriesData({ queryKey: ['admin', 'courses', 'list'] });
      queryClient.setQueriesData(
        { queryKey: ['admin', 'courses', 'list'] },
        (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((c: AdminCourse) =>
              c.id === course.id
                ? { ...c, state: isPublished ? 'DRAFT' : 'PUBLISHED' }
                : c,
            ),
          };
        },
      );
      return { snapshot };
    },
    onSuccess: (updated) => {
      toast.success(
        updated.state === 'PUBLISHED'
          ? `“${course.title}” published`
          : `“${course.title}” unpublished`,
      );
      invalidate();
    },
    onError: (_e, _v, ctx: any) => {
      if (ctx?.snapshot) {
        ctx.snapshot.forEach(([key, val]: [any, any]) => {
          queryClient.setQueryData(key, val);
        });
      }
      toast.error('Failed to update publish state');
    },
  });

  // ── Duplicate ─────────────────────────────────────────────────────────
  const duplicateMutation = useMutation({
    mutationFn: () => adminCoursesApi.duplicate(course.id),
    onSuccess: (newCourse) => {
      toast.success(`“${course.title}” duplicated`);
      invalidate();
      navigate(ROUTES.COURSE_EDIT(newCourse.slug ?? newCourse.id));
    },
    onError: () => toast.error('Failed to duplicate course'),
  });

  // ── Delete ────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: () => adminCoursesApi.delete(course.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'courses', 'list'] });
      const snapshot = queryClient.getQueriesData({ queryKey: ['admin', 'courses', 'list'] });
      queryClient.setQueriesData(
        { queryKey: ['admin', 'courses', 'list'] },
        (old: any) => {
          if (!old?.data) return old;
          return { ...old, data: old.data.filter((c: AdminCourse) => c.id !== course.id) };
        },
      );
      return { snapshot };
    },
    onSuccess: () => {
      toast.success(`“${course.title}” deleted`);
      invalidate();
      setDeleteOpen(false);
    },
    onError: (err: any, _v, ctx: any) => {
      if (ctx?.snapshot) {
        ctx.snapshot.forEach(([key, val]: [any, any]) => {
          queryClient.setQueryData(key, val);
        });
      }
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to delete';
      toast.error(`Cannot delete: ${msg}`);
    },
  });

  const platformUrl = getPlatformCourseUrl(course.slug);

  return (
    <>
      {/* Overlay bar — visible on hover */}
      <div
        className={cn(
          'absolute inset-0 z-10 flex flex-col justify-between p-2',
          'bg-gradient-to-b from-black/70 via-transparent to-black/70',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
          className,
        )}
      >
        {/* Top row */}
        <div className='flex items-center justify-between'>
          {/* Publish / Unpublish */}
          <Button
            size='sm'
            variant='ghost'
            aria-label={isPublished ? 'Unpublish course' : 'Publish course'}
            className={cn(
              'h-7 gap-1.5 text-[11px] font-semibold rounded-full px-2.5',
              isPublished
                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40'
                : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700',
            )}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); publishMutation.mutate(); }}
            disabled={publishMutation.isPending}
          >
            {publishMutation.isPending ? (
              <Loader2 className='h-3 w-3 animate-spin' />
            ) : isPublished ? (
              <><EyeOff className='h-3 w-3' /> Unpublish</>
            ) : (
              <><Globe className='h-3 w-3' /> Publish</>
            )}
          </Button>

          {/* View on platform */}
          <a
            href={platformUrl}
            target='_blank'
            rel='noopener noreferrer'
            onClick={(e) => e.stopPropagation()}
            aria-label='View on platform'
            className='flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-colors'
          >
            <ExternalLink className='h-3.5 w-3.5' />
          </a>
        </div>

        {/* Bottom row */}
        <div className='flex items-center gap-1.5'>
          {/* Edit */}
          <Button
            size='sm'
            aria-label='Edit course'
            className='flex-1 h-8 text-[11px] gap-1.5 bg-primary/80 hover:bg-primary text-white rounded-lg'
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(ROUTES.COURSE_EDIT(course.slug)); }}
          >
            <Pencil className='h-3 w-3' /> Edit
          </Button>

          {/* Duplicate */}
          <Button
            size='sm'
            variant='ghost'
            aria-label='Duplicate course'
            className='h-8 w-8 p-0 bg-white/10 text-white hover:bg-white/20 rounded-lg'
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); duplicateMutation.mutate(); }}
            disabled={duplicateMutation.isPending}
          >
            {duplicateMutation.isPending
              ? <Loader2 className='h-3.5 w-3.5 animate-spin' />
              : <Copy className='h-3.5 w-3.5' />}
          </Button>

          {/* Delete */}
          <Button
            size='sm'
            variant='ghost'
            aria-label='Delete course'
            className='h-8 w-8 p-0 bg-red-500/20 text-red-300 hover:bg-red-500/40 rounded-lg'
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteOpen(true); }}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending
              ? <Loader2 className='h-3.5 w-3.5 animate-spin' />
              : <Trash2 className='h-3.5 w-3.5' />}
          </Button>
        </div>
      </div>

      {/* Delete confirm dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{course.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the course and all its curriculum data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); deleteMutation.mutate(); }}
              disabled={deleteMutation.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteMutation.isPending
                ? <><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Deleting...</>
                : 'Delete Course'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
