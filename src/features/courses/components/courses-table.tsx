// src/features/courses/components/courses-table.tsx
// ✅ مُصلح: AdminCourse بدل CourseListItem | adminCoursesApi بدل coursesService | CourseStateControl
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminCoursesApi } from '../services/admin-courses.api';
import { CourseStateControl } from './course-state-control';
import { Card } from '@/components/ui/card';
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
import { ROUTES } from '@/shared/constants';
import type { AdminCourse } from '../types/admin-course.types';
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  BookOpen,
  Users,
  BarChart3,
  Crown,
  Unlock,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CoursesTableProps {
  data: AdminCourse[];
  meta?: PaginationMeta;
  page: number;
  onPageChange: (page: number) => void;
  onRefetch: () => void;
}

const DIFFICULTY_BADGE: Record<string, string> = {
  BEGINNER: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  INTERMEDIATE: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
  ADVANCED: 'border-orange-500/40 text-orange-400 bg-orange-500/10',
  EXPERT: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
};

function CourseThumbnail({ course }: { course: AdminCourse }) {
  if (course.thumbnail) {
    return (
      <img
        src={course.thumbnail}
        alt={course.title}
        loading='lazy'
        className='h-full w-full object-cover'
      />
    );
  }
  return (
    <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-950 to-blue-900 border border-blue-800/50'>
      <BookOpen className='h-4 w-4 text-blue-400' />
    </div>
  );
}

function DeleteConfirm({
  courseName,
  onConfirm,
  isLoading,
}: {
  courseName: string;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10'
          title='Delete'
        >
          <Trash2 className='h-3.5 w-3.5' />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Course</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{courseName}</strong>? This
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function CoursesTable({
  data,
  meta,
  page,
  onPageChange,
  onRefetch,
}: CoursesTableProps) {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminCoursesApi.delete(id),
    onSuccess: () => {
      toast.success('Course deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      onRefetch();
      setDeletingId(null);
    },
    onError: () => {
      toast.error('Failed to delete');
      setDeletingId(null);
    },
  });

  if (data.length === 0) {
    return (
      <Card className='flex flex-col items-center justify-center gap-3 p-16 text-center'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
          <BookOpen className='h-5 w-5 text-muted-foreground' />
        </div>
        <p className='font-medium'>No courses found</p>
        <p className='text-sm text-muted-foreground'>
          Try adjusting your filters or create a new course.
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card className='overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b bg-muted/30'>
                <th className='p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                  Course
                </th>
                <th className='hidden p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell'>
                  Difficulty
                </th>
                <th className='p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                  State
                </th>
                <th className='hidden p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell'>
                  Stats
                </th>
                <th className='p-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/50'>
              {data.map((course) => (
                <tr
                  key={course.id}
                  className='group transition-colors hover:bg-muted/30'
                >
                  {/* ── Course info ── */}
                  <td className='p-4'>
                    <div className='flex items-center gap-3'>
                      <div className='relative h-10 w-16 shrink-0 overflow-hidden rounded-md border border-border/50'>
                        <CourseThumbnail course={course} />
                      </div>
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-semibold leading-snug'>
                          {course.title}
                        </p>
                        <p className='mt-0.5 truncate font-mono text-xs text-muted-foreground'>
                          {course.slug}
                        </p>
                        {/* Access badge */}
                        {course.access && (
                          <Badge
                            variant='outline'
                            className={cn(
                              'mt-1 h-4 gap-1 px-1 text-[10px] font-bold',
                              course.access === 'FREE'
                                ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                                : course.access === 'PRO'
                                ? 'border-violet-500/40 text-violet-400 bg-violet-500/10'
                                : 'border-amber-500/40 text-amber-400 bg-amber-500/10',
                            )}
                          >
                            {course.access === 'FREE' ? (
                              <Unlock className='h-2.5 w-2.5' />
                            ) : course.access === 'PRO' ? (
                              <Zap className='h-2.5 w-2.5' />
                            ) : (
                              <Crown className='h-2.5 w-2.5' />
                            )}
                            {course.access}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* ── Difficulty ── */}
                  <td className='hidden p-4 md:table-cell'>
                    {course.difficulty ? (
                      <Badge
                        variant='outline'
                        className={cn(
                          'gap-1 text-[11px] font-semibold',
                          DIFFICULTY_BADGE[course.difficulty] ?? 'border-border/60',
                        )}
                      >
                        <BarChart3 className='h-3 w-3' />
                        {course.difficulty.charAt(0) +
                          course.difficulty.slice(1).toLowerCase()}
                      </Badge>
                    ) : (
                      <span className='text-xs text-muted-foreground'>—</span>
                    )}
                  </td>

                  {/* ── State — 3 حالات صحيحة ── */}
                  <td className='p-4'>
                    <CourseStateControl
                      courseId={course.id}
                      currentState={course.state}
                      compact
                    />
                  </td>

                  {/* ── Stats ── */}
                  <td className='hidden p-4 lg:table-cell'>
                    <div className='flex flex-col gap-1'>
                      <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                        <Users className='h-3 w-3' />
                        {course.enrollmentCount ?? 0} enrolled
                      </span>
                      <span className='text-xs text-muted-foreground'>
                        {course.totalTopics ?? 0} topics
                      </span>
                    </div>
                  </td>

                  {/* ── Actions ── */}
                  <td className='p-4 text-right'>
                    <div className='flex items-center justify-end gap-1'>
                      <Link to={ROUTES.COURSE_EDIT(course.slug)}>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground'
                          title='Edit'
                        >
                          <Pencil className='h-3.5 w-3.5' />
                        </Button>
                      </Link>

                      <DeleteConfirm
                        courseName={course.title}
                        isLoading={
                          deleteMutation.isPending && deletingId === course.id
                        }
                        onConfirm={() => {
                          setDeletingId(course.id);
                          deleteMutation.mutate(course.id);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {meta && meta.totalPages > 1 && (
          <div className='flex items-center justify-between border-t px-4 py-3'>
            <p className='text-xs text-muted-foreground'>
              Showing{' '}
              <span className='font-semibold text-foreground'>
                {(page - 1) * meta.limit + 1}–
                {Math.min(page * meta.limit, meta.total)}
              </span>{' '}
              of{' '}
              <span className='font-semibold text-foreground'>{meta.total}</span>
            </p>
            <div className='flex items-center gap-1'>
              <Button
                variant='outline'
                size='sm'
                className='h-8 gap-1 px-3 text-xs'
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className='h-3.5 w-3.5' /> Prev
              </Button>
              <div className='flex h-8 min-w-[2rem] items-center justify-center rounded-md border border-primary/30 bg-primary/10 px-2 text-xs font-semibold text-primary'>
                {page}
              </div>
              <Button
                variant='outline'
                size='sm'
                className='h-8 gap-1 px-3 text-xs'
                onClick={() => onPageChange(page + 1)}
                disabled={page === meta.totalPages}
              >
                Next <ChevronRight className='h-3.5 w-3.5' />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
