// src/features/courses/components/admin-overlay-controls.tsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Pencil, Trash2, Globe, EyeOff, Copy, Eye, Loader2, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { adminCoursesApi } from '../services/admin-courses.api';
import { ROUTES } from '@/shared/constants';
import type { AdminCourse, CourseState } from '../types/admin-course.types';

interface AdminOverlayControlsProps {
  course: AdminCourse;
  className?: string;
}

const STATE_OPTIONS: {
  value: CourseState;
  labelKey: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { value: 'PUBLISHED',   labelKey: 'state.PUBLISHED',   icon: Globe,  color: 'text-emerald-400' },
  { value: 'COMING_SOON', labelKey: 'state.COMING_SOON', icon: Clock,  color: 'text-blue-400'    },
  { value: 'DRAFT',       labelKey: 'state.DRAFT',       icon: EyeOff, color: 'text-zinc-400'    },
];

const STATE_PILL: Record<string, string> = {
  PUBLISHED:   'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40',
  COMING_SOON: 'bg-blue-500/20    text-blue-300    hover:bg-blue-500/40',
  DRAFT:       'bg-zinc-800/80    text-zinc-300    hover:bg-zinc-700',
};

export function AdminOverlayControls({ course, className }: AdminOverlayControlsProps) {
  const { t } = useTranslation('courses');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Invalidate BOTH list and stats so stat cards update immediately
  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'courses', 'list']  });
    queryClient.invalidateQueries({ queryKey: ['admin', 'courses', 'stats'] });
  }, [queryClient]);

  const stateMutation = useMutation({
    mutationFn: (newState: CourseState) =>
      adminCoursesApi.setState(course.id, newState),

    onMutate: async (newState) => {
      // Cancel any outgoing list AND stats refetches
      await queryClient.cancelQueries({ queryKey: ['admin', 'courses', 'list']  });
      await queryClient.cancelQueries({ queryKey: ['admin', 'courses', 'stats'] });

      // Snapshot for rollback
      const listSnapshot  = queryClient.getQueriesData({ queryKey: ['admin', 'courses', 'list']  });
      const statsSnapshot = queryClient.getQueriesData({ queryKey: ['admin', 'courses', 'stats'] });

      // Optimistic list update
      queryClient.setQueriesData(
        { queryKey: ['admin', 'courses', 'list'] },
        (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((c: AdminCourse) =>
              c.id === course.id ? { ...c, state: newState } : c,
            ),
          };
        },
      );

      // Optimistic stats update
      queryClient.setQueriesData(
        { queryKey: ['admin', 'courses', 'stats'] },
        (old: any) => {
          if (!old) return old;
          const prev = course.state;
          const next = newState;
          if (prev === next) return old;

          const keyMap: Record<string, string> = {
            PUBLISHED:   'published',
            DRAFT:       'draft',
            COMING_SOON: 'comingSoon',
          };

          return {
            ...old,
            [keyMap[prev]]: Math.max(0, (old[keyMap[prev]] ?? 0) - 1),
            [keyMap[next]]: (old[keyMap[next]] ?? 0) + 1,
          };
        },
      );

      return { listSnapshot, statsSnapshot };
    },

    onSuccess: (updated) => {
      const toastKey =
        updated.state === 'PUBLISHED'   ? 'toast.published'
        : updated.state === 'COMING_SOON' ? 'toast.comingSoon'
        : 'toast.unpublished';
      toast.success(t(toastKey, { title: course.title }));
      // Refetch from server to confirm real values
      invalidateAll();
    },

    onError: (_e: any, _v: any, ctx: any) => {
      // Rollback both
      ctx?.listSnapshot?.forEach(([key, val]: [any, any]) =>
        queryClient.setQueryData(key, val),
      );
      ctx?.statsSnapshot?.forEach(([key, val]: [any, any]) =>
        queryClient.setQueryData(key, val),
      );
      toast.error(t('errors.publishFailed'));
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: () => adminCoursesApi.duplicate(course.id),
    onSuccess: (newCourse) => {
      toast.success(t('toast.duplicated', { title: course.title }));
      invalidateAll();
      navigate(ROUTES.COURSE_EDIT(newCourse.slug ?? newCourse.id));
    },
    onError: () => toast.error(t('errors.duplicateFailed')),
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminCoursesApi.delete(course.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'courses', 'list']  });
      await queryClient.cancelQueries({ queryKey: ['admin', 'courses', 'stats'] });
      const listSnapshot  = queryClient.getQueriesData({ queryKey: ['admin', 'courses', 'list']  });
      const statsSnapshot = queryClient.getQueriesData({ queryKey: ['admin', 'courses', 'stats'] });

      queryClient.setQueriesData(
        { queryKey: ['admin', 'courses', 'list'] },
        (old: any) => {
          if (!old?.data) return old;
          return { ...old, data: old.data.filter((c: AdminCourse) => c.id !== course.id) };
        },
      );
      // Optimistic stats: remove 1 from the course's current state bucket + total
      queryClient.setQueriesData(
        { queryKey: ['admin', 'courses', 'stats'] },
        (old: any) => {
          if (!old) return old;
          const keyMap: Record<string, string> = {
            PUBLISHED: 'published', DRAFT: 'draft', COMING_SOON: 'comingSoon',
          };
          return {
            ...old,
            total: Math.max(0, (old.total ?? 0) - 1),
            [keyMap[course.state]]: Math.max(0, (old[keyMap[course.state]] ?? 0) - 1),
          };
        },
      );
      return { listSnapshot, statsSnapshot };
    },
    onSuccess: () => {
      toast.success(t('toast.deleted', { title: course.title }));
      invalidateAll();
      setDeleteOpen(false);
    },
    onError: (err: any, _v: any, ctx: any) => {
      ctx?.listSnapshot?.forEach(([key, val]: [any, any]) => queryClient.setQueryData(key, val));
      ctx?.statsSnapshot?.forEach(([key, val]: [any, any]) => queryClient.setQueryData(key, val));
      const msg = err?.response?.data?.message ?? err?.message ?? 'Unknown error';
      toast.error(t('errors.deleteFailed', { message: msg }));
    },
  });

  const currentStateOption = STATE_OPTIONS.find((o) => o.value === course.state) ?? STATE_OPTIONS[2];
  const CurrentIcon = currentStateOption.icon;

  return (
    <>
      {/* Overlay bar — visible on hover */}
      <div className={cn(
        'absolute inset-0 z-10 flex flex-col justify-between p-2',
        'bg-gradient-to-b from-black/70 via-transparent to-black/70',
        'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
        className,
      )}>
        {/* Top row: State dropdown + Preview */}
        <div className='flex items-center justify-between gap-1'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size='sm'
                variant='ghost'
                aria-label={t('overlay.setState')}
                className={cn(
                  'h-7 gap-1.5 text-[11px] font-semibold rounded-full px-2.5',
                  STATE_PILL[course.state] ?? STATE_PILL.DRAFT,
                )}
                disabled={stateMutation.isPending}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              >
                {stateMutation.isPending ? (
                  <Loader2 className='h-3 w-3 animate-spin' />
                ) : (
                  <><CurrentIcon className='h-3 w-3' /> {t(currentStateOption.labelKey)}</>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='min-w-[160px]'>
              {STATE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isCurrent = course.state === opt.value;
                return (
                  <DropdownMenuItem
                    key={opt.value}
                    disabled={isCurrent}
                    className={cn('gap-2 text-xs', isCurrent && 'opacity-50 cursor-default')}
                    onSelect={(e) => {
                      e.preventDefault();
                      if (!isCurrent) stateMutation.mutate(opt.value);
                    }}
                  >
                    <Icon className={cn('h-3.5 w-3.5', opt.color)} />
                    {t(opt.labelKey)}
                    {isCurrent && <span className='ms-auto text-[10px] text-muted-foreground'>✓</span>}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size='sm' variant='ghost'
            aria-label={t('overlay.preview')}
            className='h-7 w-7 p-0 rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-colors'
            onClick={(e) => {
              e.preventDefault(); e.stopPropagation();
              navigate(`${ROUTES.COURSE_EDIT(course.slug)}?tab=preview`);
            }}
          >
            <Eye className='h-3.5 w-3.5' />
          </Button>
        </div>

        {/* Bottom row: Edit + Duplicate + Delete */}
        <div className='flex items-center gap-1.5'>
          <Button
            size='sm'
            aria-label={t('overlay.edit')}
            className='flex-1 h-8 text-[11px] gap-1.5 bg-primary/80 hover:bg-primary text-white rounded-lg'
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(ROUTES.COURSE_EDIT(course.slug)); }}
          >
            <Pencil className='h-3 w-3' /> {t('overlay.edit')}
          </Button>

          <Button
            size='sm' variant='ghost'
            aria-label={t('overlay.duplicate')}
            className='h-8 w-8 p-0 bg-white/10 text-white hover:bg-white/20 rounded-lg'
            disabled={duplicateMutation.isPending}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); duplicateMutation.mutate(); }}
          >
            {duplicateMutation.isPending
              ? <Loader2 className='h-3.5 w-3.5 animate-spin' />
              : <Copy className='h-3.5 w-3.5' />}
          </Button>

          <Button
            size='sm' variant='ghost'
            aria-label={t('overlay.delete')}
            className='h-8 w-8 p-0 bg-red-500/20 text-red-300 hover:bg-red-500/40 rounded-lg'
            disabled={deleteMutation.isPending}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteOpen(true); }}
          >
            {deleteMutation.isPending
              ? <Loader2 className='h-3.5 w-3.5 animate-spin' />
              : <Trash2 className='h-3.5 w-3.5' />}
          </Button>
        </div>
      </div>

      {/* Delete confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialogs.deleteTitle', { title: course.title })}</AlertDialogTitle>
            <AlertDialogDescription>{t('dialogs.deleteDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>{t('dialogs.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); deleteMutation.mutate(); }}
              disabled={deleteMutation.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteMutation.isPending
                ? <><Loader2 className='mr-2 h-4 w-4 animate-spin' /> {t('dialogs.deleting')}</>
                : t('dialogs.deleteConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
