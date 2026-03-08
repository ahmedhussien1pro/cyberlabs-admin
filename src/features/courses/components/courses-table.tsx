// src/features/courses/components/courses-table.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { coursesService } from '@/core/api/services';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import type { CourseListItem, PaginationMeta } from '@/core/types';
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Eye,
  Trash2,
  Globe,
  EyeOff,
  BookOpen,
  Users,
  Layers,
  BarChart3,
  Crown,
  Unlock,
  MonitorPlay,
  Clock,
  BarChart2,
  Zap,
  Star,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoursesTableProps {
  data: CourseListItem[];
  meta?: PaginationMeta;
  page: number;
  onPageChange: (page: number) => void;
  onRefetch: () => void;
}

// ── Lookup tables ─────────────────────────────────────────────────
const DIFFICULTY_BADGE: Record<string, string> = {
  BEGINNER: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  INTERMEDIATE: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
  ADVANCED: 'border-orange-500/40 text-orange-400 bg-orange-500/10',
  EXPERT: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
};

const COLOR_MAP: Record<
  string,
  { bg: string; border: string; badge: string; text: string }
> = {
  EMERALD: {
    bg: 'from-emerald-500/20 to-emerald-900/30',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-300',
    text: 'text-emerald-400',
  },
  BLUE: {
    bg: 'from-blue-500/20 to-blue-900/30',
    border: 'border-blue-500/30',
    badge: 'bg-blue-500/20 text-blue-300',
    text: 'text-blue-400',
  },
  VIOLET: {
    bg: 'from-violet-500/20 to-violet-900/30',
    border: 'border-violet-500/30',
    badge: 'bg-violet-500/20 text-violet-300',
    text: 'text-violet-400',
  },
  ORANGE: {
    bg: 'from-orange-500/20 to-orange-900/30',
    border: 'border-orange-500/30',
    badge: 'bg-orange-500/20 text-orange-300',
    text: 'text-orange-400',
  },
  ROSE: {
    bg: 'from-rose-500/20 to-rose-900/30',
    border: 'border-rose-500/30',
    badge: 'bg-rose-500/20 text-rose-300',
    text: 'text-rose-400',
  },
  CYAN: {
    bg: 'from-cyan-500/20 to-cyan-900/30',
    border: 'border-cyan-500/30',
    badge: 'bg-cyan-500/20 text-cyan-300',
    text: 'text-cyan-400',
  },
};

const ACCESS_LABEL: Record<string, { label: string; icon: React.ElementType }> =
  {
    FREE: { label: 'Free', icon: Globe },
    PRO: { label: 'Pro', icon: Zap },
    PREMIUM: { label: 'Premium', icon: Star },
  };

const DIFF_LABEL: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

// ── Course Card Preview ───────────────────────────────────────────
function CourseCardPreview({ course }: { course: CourseListItem }) {
  const navigate = useNavigate();
  const colors =
    COLOR_MAP[(course as any).color ?? 'BLUE'] ?? COLOR_MAP['BLUE'];
  const access = (course as any).access ?? 'FREE';

  return (
    <div className='space-y-4'>
      {/* Platform Card */}
      <div
        className={cn(
          'rounded-xl border overflow-hidden',
          `bg-gradient-to-br ${colors.bg}`,
          colors.border,
        )}>
        {/* Thumbnail */}
        <div className='relative h-36 bg-black/30 flex items-center justify-center overflow-hidden'>
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt=''
              className='w-full h-full object-cover opacity-60'
            />
          ) : (
            <BookOpen className={cn('h-12 w-12 opacity-20', colors.text)} />
          )}
          {(course as any).isNew && (
            <span className='absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-500/80 text-black'>
              NEW
            </span>
          )}
          {(course as any).isFeatured && (
            <span className='absolute top-2 left-2 mt-6 text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/80 text-white'>
              ⭐ Featured
            </span>
          )}
          <span
            className={cn(
              'absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full',
              colors.badge,
            )}>
            {ACCESS_LABEL[access]?.label ?? access}
          </span>
        </div>

        {/* Body */}
        <div className='p-4 space-y-2'>
          <h3 className='text-base font-bold leading-snug'>{course.title}</h3>
          <div className='flex flex-wrap gap-3 text-xs text-muted-foreground'>
            <span className='flex items-center gap-1'>
              <Clock className='h-3 w-3' />
              {(course as any).estimatedHours ?? '—'}h
            </span>
            <span className='flex items-center gap-1'>
              <Layers className='h-3 w-3' />
              {course._count.sections} sections
            </span>
            <span className='flex items-center gap-1'>
              <BarChart2 className='h-3 w-3' />
              {DIFF_LABEL[course.difficulty ?? ''] ?? course.difficulty ?? '—'}
            </span>
            <span className='flex items-center gap-1'>
              <Users className='h-3 w-3' />
              {course._count.enrollments} enrolled
            </span>
          </div>
        </div>
      </div>

      {/* Open Full Platform Preview */}
      <Button
        className='w-full gap-2'
        onClick={() => navigate(ROUTES.COURSE_PLATFORM_PREVIEW(course.id))}>
        <MonitorPlay className='h-4 w-4' />
        Open Full Platform Preview
        <ExternalLink className='h-3.5 w-3.5 opacity-70' />
      </Button>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────
function CourseThumbnail({ course }: { course: CourseListItem }) {
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

function StateIndicator({
  state,
  isPublished,
}: {
  state?: string;
  isPublished: boolean;
}) {
  if (state === 'COMING_SOON')
    return (
      <span className='inline-flex items-center gap-1.5 text-xs font-medium text-blue-400'>
        <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
        Coming Soon
      </span>
    );
  if (isPublished || state === 'PUBLISHED')
    return (
      <span className='inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400'>
        <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
        Published
      </span>
    );
  return (
    <span className='inline-flex items-center gap-1.5 text-xs font-medium text-amber-400'>
      <span className='h-1.5 w-1.5 rounded-full bg-amber-500' />
      Draft
    </span>
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
          title='Delete'>
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
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Main Table ─────────────────────────────────────────────────────
export function CoursesTable({
  data,
  meta,
  page,
  onPageChange,
  onRefetch,
}: CoursesTableProps) {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewCourse, setPreviewCourse] = useState<CourseListItem | null>(
    null,
  );

  const publishMutation = useMutation({
    mutationFn: (id: string) => coursesService.publish(id),
    onSuccess: () => {
      toast.success('Course published');
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: () => toast.error('Failed to publish'),
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => coursesService.unpublish(id),
    onSuccess: () => {
      toast.success('Course moved to Draft');
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: () => toast.error('Failed to unpublish'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => coursesService.delete(id),
    onSuccess: () => {
      toast.success('Course deleted');
      queryClient.invalidateQueries({ queryKey: ['courses'] });
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
      {/* ── Card Preview Dialog ── */}
      <Dialog
        open={!!previewCourse}
        onOpenChange={(o) => !o && setPreviewCourse(null)}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-sm'>
              <MonitorPlay className='h-4 w-4 text-primary' />
              Platform Card Preview
            </DialogTitle>
          </DialogHeader>
          {previewCourse && <CourseCardPreview course={previewCourse} />}
        </DialogContent>
      </Dialog>

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
                  Status
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
              {data.map((course) => {
                const isPublished =
                  course.isPublished || course.state === 'PUBLISHED';
                const isComingSoon = course.state === 'COMING_SOON';
                const isToggling =
                  publishMutation.isPending || unpublishMutation.isPending;

                return (
                  <tr
                    key={course.id}
                    className='group transition-colors hover:bg-muted/30'>
                    {/* Course info */}
                    <td className='p-4'>
                      <div className='flex items-center gap-3'>
                        <div className='relative h-10 w-16 shrink-0 overflow-hidden rounded-md border border-border/50'>
                          <CourseThumbnail course={course} />
                        </div>
                        <div className='min-w-0'>
                          <p className='truncate text-sm font-semibold leading-snug'>
                            {course.title}
                          </p>
                          <p className='mt-0.5 truncate text-xs text-muted-foreground'>
                            {course.slug}
                          </p>
                          {course.access && (
                            <Badge
                              variant='outline'
                              className={cn(
                                'mt-1 h-4 gap-1 px-1 text-[10px] font-bold',
                                course.access === 'FREE'
                                  ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                                  : 'border-violet-500/40 text-violet-400 bg-violet-500/10',
                              )}>
                              {course.access === 'FREE' ? (
                                <Unlock className='h-2.5 w-2.5' />
                              ) : (
                                <Crown className='h-2.5 w-2.5' />
                              )}
                              {course.access}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Difficulty */}
                    <td className='hidden p-4 md:table-cell'>
                      {course.difficulty ? (
                        <Badge
                          variant='outline'
                          className={cn(
                            'gap-1 text-[11px] font-semibold',
                            DIFFICULTY_BADGE[course.difficulty] ??
                              'border-border/60',
                          )}>
                          <BarChart3 className='h-3 w-3' />
                          {course.difficulty.charAt(0) +
                            course.difficulty.slice(1).toLowerCase()}
                        </Badge>
                      ) : (
                        <span className='text-xs text-muted-foreground'>—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className='p-4'>
                      <StateIndicator
                        state={course.state}
                        isPublished={course.isPublished}
                      />
                    </td>

                    {/* Stats */}
                    <td className='hidden p-4 lg:table-cell'>
                      <div className='flex flex-col gap-1'>
                        <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                          <Users className='h-3 w-3' />
                          {course._count.enrollments} enrolled
                        </span>
                        <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                          <Layers className='h-3 w-3' />
                          {course._count.sections} sections
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className='p-4 text-right'>
                      <div className='flex items-center justify-end gap-1'>
                        {/* Publish toggle */}
                        {!isComingSoon && (
                          <Button
                            variant='ghost'
                            size='sm'
                            className={cn(
                              'h-8 w-8 p-0',
                              isPublished
                                ? 'text-amber-400 hover:text-amber-500 hover:bg-amber-500/10'
                                : 'text-emerald-400 hover:text-emerald-500 hover:bg-emerald-500/10',
                            )}
                            disabled={isToggling}
                            onClick={() =>
                              isPublished
                                ? unpublishMutation.mutate(course.id)
                                : publishMutation.mutate(course.id)
                            }
                            title={isPublished ? 'Move to Draft' : 'Publish'}>
                            {isPublished ? (
                              <EyeOff className='h-3.5 w-3.5' />
                            ) : (
                              <Globe className='h-3.5 w-3.5' />
                            )}
                          </Button>
                        )}

                        {/* Platform Preview (card → full page) */}
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0 text-primary/70 hover:text-primary hover:bg-primary/10'
                          title='Platform Preview'
                          onClick={() => setPreviewCourse(course)}>
                          <MonitorPlay className='h-3.5 w-3.5' />
                        </Button>

                        {/* Admin Edit */}
                        <Link to={ROUTES.COURSE_EDIT(course.id)}>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground'
                            title='Edit'>
                            <Pencil className='h-3.5 w-3.5' />
                          </Button>
                        </Link>

                        {/* Admin Detail */}
                        <Link to={ROUTES.COURSE_DETAIL(course.id)}>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground'
                            title='Admin Detail'>
                            <Eye className='h-3.5 w-3.5' />
                          </Button>
                        </Link>

                        {/* Delete */}
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
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className='flex items-center justify-between border-t px-4 py-3'>
            <p className='text-xs text-muted-foreground'>
              Showing{' '}
              <span className='font-semibold text-foreground'>
                {(page - 1) * meta.limit + 1}–
                {Math.min(page * meta.limit, meta.total)}
              </span>{' '}
              of{' '}
              <span className='font-semibold text-foreground'>
                {meta.total}
              </span>
            </p>
            <div className='flex items-center gap-1'>
              <Button
                variant='outline'
                size='sm'
                className='h-8 gap-1 px-3 text-xs'
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}>
                <ChevronLeft className='h-3.5 w-3.5' />
                Prev
              </Button>
              <div className='flex h-8 min-w-[2rem] items-center justify-center rounded-md border border-primary/30 bg-primary/10 px-2 text-xs font-semibold text-primary'>
                {page}
              </div>
              <Button
                variant='outline'
                size='sm'
                className='h-8 gap-1 px-3 text-xs'
                onClick={() => onPageChange(page + 1)}
                disabled={page === meta.totalPages}>
                Next
                <ChevronRight className='h-3.5 w-3.5' />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
