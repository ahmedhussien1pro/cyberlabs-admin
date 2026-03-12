// src/features/courses/components/courses-table.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Edit2, Globe, EyeOff, Trash2, Copy,
  ChevronLeft, ChevronRight, BarChart3, BookOpen, Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { adminCoursesApi } from '../services/admin-courses.api';
import { ROUTES } from '@/shared/constants';
import type { AdminCourse } from '../types/admin-course.types';

interface Props {
  data: AdminCourse[];
  meta?: { total: number; page: number; limit: number; totalPages: number };
  page: number;
  onPageChange: (p: number) => void;
  onRefetch: () => void;
}

const STATE_BADGE: Record<string, string> = {
  PUBLISHED:   'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  DRAFT:       'bg-zinc-500/10    border-zinc-500/30    text-zinc-400',
  COMING_SOON: 'bg-blue-500/10    border-blue-500/30    text-blue-400',
};

export function CoursesTable({ data, meta, page, onPageChange, onRefetch }: Props) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<AdminCourse | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'courses'] });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminCoursesApi.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['admin', 'courses', 'list'] });
      const snapshot = qc.getQueriesData({ queryKey: ['admin', 'courses', 'list'] });
      qc.setQueriesData(
        { queryKey: ['admin', 'courses', 'list'] },
        (old: any) => {
          if (!old?.data) return old;
          return { ...old, data: old.data.filter((c: AdminCourse) => c.id !== id) };
        },
      );
      return { snapshot };
    },
    onSuccess: () => {
      toast.success('Course deleted');
      invalidate();
      onRefetch();
      setDeleteTarget(null);
    },
    onError: (err: any, _v, ctx: any) => {
      if (ctx?.snapshot) {
        ctx.snapshot.forEach(([key, val]: [any, any]) => qc.setQueryData(key, val));
      }
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to delete';
      toast.error(`Cannot delete: ${msg}`);
    },
  });

  const pubMut = useMutation({
    mutationFn: ({ id, state }: { id: string; state: AdminCourse['state'] }) =>
      adminCoursesApi.setState(id, state === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'),
    onMutate: async ({ id, state }) => {
      await qc.cancelQueries({ queryKey: ['admin', 'courses', 'list'] });
      const snapshot = qc.getQueriesData({ queryKey: ['admin', 'courses', 'list'] });
      qc.setQueriesData(
        { queryKey: ['admin', 'courses', 'list'] },
        (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((c: AdminCourse) =>
              c.id === id ? { ...c, state: state === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' } : c,
            ),
          };
        },
      );
      return { snapshot };
    },
    onSuccess: () => { toast.success('State updated'); invalidate(); onRefetch(); },
    onError: (err: any, _v, ctx: any) => {
      if (ctx?.snapshot) {
        ctx.snapshot.forEach(([key, val]: [any, any]) => qc.setQueryData(key, val));
      }
      toast.error('Failed to update state');
    },
  });

  const dupMut = useMutation({
    mutationFn: (id: string) => adminCoursesApi.duplicate(id),
    onSuccess: (c) => { toast.success('Duplicated'); invalidate(); navigate(ROUTES.COURSE_EDIT(c.slug)); },
    onError: () => toast.error('Failed to duplicate'),
  });

  return (
    <>
      <Card className='overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm' role='table'>
            <thead>
              <tr className='border-b bg-muted/30'>
                <th className='px-4 py-3 text-start font-semibold text-muted-foreground' scope='col'>Course</th>
                <th className='px-4 py-3 text-start font-semibold text-muted-foreground' scope='col'>State</th>
                <th className='px-4 py-3 text-start font-semibold text-muted-foreground' scope='col'>Difficulty</th>
                <th className='px-4 py-3 text-start font-semibold text-muted-foreground' scope='col'>Access</th>
                <th className='px-4 py-3 text-start font-semibold text-muted-foreground' scope='col'>Enrolled</th>
                <th className='px-4 py-3 text-end font-semibold text-muted-foreground' scope='col'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className='py-16 text-center'>
                    <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                      <BookOpen className='h-8 w-8 opacity-40' aria-hidden='true' />
                      <p className='text-sm font-medium'>No courses found</p>
                      <p className='text-xs'>Adjust filters or create a new course.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((course) => (
                  <tr key={course.id} className='border-b border-border/50 hover:bg-muted/20 transition-colors'>
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-3'>
                        <div className='h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-muted'>
                          {(course.image ?? course.thumbnail) ? (
                            <img
                              src={course.image ?? course.thumbnail ?? ''}
                              alt={course.title}
                              className='h-full w-full object-cover'
                            />
                          ) : (
                            <div className='h-full w-full bg-primary/10 flex items-center justify-center'>
                              <span className='text-[8px] font-bold text-primary px-1 text-center leading-tight'>
                                {course.title.slice(0, 10)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className='font-semibold text-foreground line-clamp-1'>{course.title}</p>
                          <p className='text-xs text-muted-foreground'>{course.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <Badge variant='outline' className={cn('text-[10px] font-semibold', STATE_BADGE[course.state])}>
                        {course.state.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className='px-4 py-3'>
                      <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                        <BarChart3 className='h-3 w-3' aria-hidden='true' />
                        {course.difficulty.charAt(0) + course.difficulty.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <span className='text-xs text-muted-foreground'>{course.access}</span>
                    </td>
                    <td className='px-4 py-3'>
                      <span className='text-xs font-semibold'>{course.enrollmentCount ?? 0}</span>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center justify-end gap-1'>
                        <Button
                          variant='ghost' size='sm'
                          aria-label={`Edit ${course.title}`}
                          className='h-8 w-8 p-0'
                          onClick={() => navigate(ROUTES.COURSE_EDIT(course.slug))}
                        >
                          <Edit2 className='h-3.5 w-3.5' aria-hidden='true' />
                        </Button>
                        <Button
                          variant='ghost' size='sm'
                          aria-label={course.state === 'PUBLISHED' ? `Unpublish ${course.title}` : `Publish ${course.title}`}
                          className='h-8 w-8 p-0'
                          disabled={pubMut.isPending}
                          onClick={() => pubMut.mutate({ id: course.id, state: course.state })}
                        >
                          {pubMut.isPending
                            ? <Loader2 className='h-3.5 w-3.5 animate-spin' />
                            : course.state === 'PUBLISHED'
                              ? <EyeOff className='h-3.5 w-3.5 text-amber-400' aria-hidden='true' />
                              : <Globe className='h-3.5 w-3.5 text-emerald-400' aria-hidden='true' />}
                        </Button>
                        <Button
                          variant='ghost' size='sm'
                          aria-label={`Duplicate ${course.title}`}
                          className='h-8 w-8 p-0'
                          disabled={dupMut.isPending}
                          onClick={() => dupMut.mutate(course.id)}
                        >
                          {dupMut.isPending
                            ? <Loader2 className='h-3.5 w-3.5 animate-spin' />
                            : <Copy className='h-3.5 w-3.5' aria-hidden='true' />}
                        </Button>
                        <Button
                          variant='ghost' size='sm'
                          aria-label={`Delete ${course.title}`}
                          className='h-8 w-8 p-0 text-destructive hover:text-destructive'
                          disabled={deleteMut.isPending && deleteTarget?.id === course.id}
                          onClick={() => setDeleteTarget(course)}
                        >
                          <Trash2 className='h-3.5 w-3.5' aria-hidden='true' />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className='flex items-center justify-between border-t px-4 py-3'>
            <p className='text-xs text-muted-foreground'>
              Page <span className='font-semibold text-foreground'>{page}</span> of{' '}
              <span className='font-semibold text-foreground'>{meta.totalPages}</span>
              {' — '}<span className='font-semibold text-foreground'>{meta.total}</span> total
            </p>
            <div className='flex items-center gap-1'>
              <Button
                variant='outline' size='sm'
                aria-label='Previous page'
                className='h-8 w-8 p-0'
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className='h-3.5 w-3.5' aria-hidden='true' />
              </Button>
              <Button
                variant='outline' size='sm'
                aria-label='Next page'
                className='h-8 w-8 p-0'
                onClick={() => onPageChange(page + 1)}
                disabled={page === meta.totalPages}
              >
                <ChevronRight className='h-3.5 w-3.5' aria-hidden='true' />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleteTarget?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the course and all its curriculum data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMut.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); if (deleteTarget) deleteMut.mutate(deleteTarget.id); }}
              disabled={deleteMut.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteMut.isPending
                ? <><Loader2 className='mr-2 h-4 w-4 animate-spin' aria-hidden='true' /> Deleting...</>
                : 'Delete Course'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
