// src/features/courses/components/admin-overlay-controls.tsx
// Slide-up action bar — docked to bottom, slides over content on hover.
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { adminCoursesApi } from '../services/admin-courses.api';
import { ROUTES } from '@/shared/constants';
import { ENV } from '@/shared/constants/env';
import type { AdminCourse, CourseState } from '../types/admin-course.types';

const STATE_OPTIONS: { value: CourseState; labelKey: string; icon: React.ElementType; color: string }[] = [
  { value: 'PUBLISHED',   labelKey: 'state.PUBLISHED',   icon: Globe,  color: 'text-emerald-400' },
  { value: 'COMING_SOON', labelKey: 'state.COMING_SOON', icon: Clock,  color: 'text-blue-400'    },
  { value: 'DRAFT',       labelKey: 'state.DRAFT',       icon: EyeOff, color: 'text-zinc-400'    },
];

const STATE_PILL: Record<string, string> = {
  PUBLISHED:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30',
  COMING_SOON: 'bg-blue-500/15    text-blue-400    border-blue-500/30    hover:bg-blue-500/30',
  DRAFT:       'bg-zinc-500/15    text-zinc-400    border-zinc-500/30    hover:bg-zinc-500/30',
};

const STATE_KEY_MAP: Record<string, string> = {
  PUBLISHED: 'published', DRAFT: 'draft', COMING_SOON: 'comingSoon',
};

interface AdminOverlayControlsProps {
  course: AdminCourse;
  className?: string;
}

export function AdminOverlayControls({ course, className }: AdminOverlayControlsProps) {
  const { t } = useTranslation('courses');
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const refetchStatsLater = useCallback(() => {
    setTimeout(() => queryClient.refetchQueries({ queryKey: ['admin', 'courses', 'stats'], type: 'active' }), 800);
  }, [queryClient]);

  const invalidateList = useCallback(() =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'courses', 'list'] }), [queryClient]);

  // ── setState (optimistic) ──────────────────────────────────────────────
  const stateMutation = useMutation({
    mutationFn: (newState: CourseState) => adminCoursesApi.setState(course.id, newState),
    onMutate: async (newState) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'courses', 'list']  });
      await queryClient.cancelQueries({ queryKey: ['admin', 'courses', 'stats'] });
      const listSnapshot  = queryClient.getQueriesData({ queryKey: ['admin', 'courses', 'list']  });
      const statsSnapshot = queryClient.getQueriesData({ queryKey: ['admin', 'courses', 'stats'] });
      queryClient.setQueriesData({ queryKey: ['admin', 'courses', 'list'] }, (old: any) => {
        if (!old?.data) return old;
        return { ...old, data: old.data.map((c: AdminCourse) => c.id === course.id ? { ...c, state: newState } : c) };
      });
      queryClient.setQueriesData({ queryKey: ['admin', 'courses', 'stats'] }, (old: any) => {
        if (!old) return old;
        const prev = course.state; const next = newState;
        if (prev === next) return old;
        return {
          ...old,
          [STATE_KEY_MAP[prev]]: Math.max(0, (old[STATE_KEY_MAP[prev]] ?? 0) - 1),
          [STATE_KEY_MAP[next]]: (old[STATE_KEY_MAP[next]] ?? 0) + 1,
        };
      });
      return { listSnapshot, statsSnapshot };
    },
    onSuccess: (updated) => {
      const key = updated.state === 'PUBLISHED' ? 'toast.published' : updated.state === 'COMING_SOON' ? 'toast.comingSoon' : 'toast.unpublished';
      toast.success(t(key, { title: course.title }));
      invalidateList(); refetchStatsLater();
    },
    onError: (_e: any, _v: any, ctx: any) => {
      ctx?.listSnapshot?.forEach(([k, v]: [any, any])  => queryClient.setQueryData(k, v));
      ctx?.statsSnapshot?.forEach(([k, v]: [any, any]) => queryClient.setQueryData(k, v));
      toast.error(t('errors.publishFailed'));
    },
  });

  // ── duplicate ──────────────────────────────────────────────────────────
  const duplicateMutation = useMutation({
    mutationFn: () => adminCoursesApi.duplicate(course.id),
    onSuccess: (newCourse) => {
      toast.success(t('toast.duplicated', { title: course.title }));
      invalidateList(); refetchStatsLater();
      navigate(ROUTES.COURSE_EDIT(newCourse.slug ?? newCourse.id));
    },
    onError: () => toast.error(t('errors.duplicateFailed')),
  });

  // ── delete ─────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: () => adminCoursesApi.delete(course.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'courses', 'list']  });
      await queryClient.cancelQueries({ queryKey: ['admin', 'courses', 'stats'] });
      const listSnapshot  = queryClient.getQueriesData({ queryKey: ['admin', 'courses', 'list']  });
      const statsSnapshot = queryClient.getQueriesData({ queryKey: ['admin', 'courses', 'stats'] });
      queryClient.setQueriesData({ queryKey: ['admin', 'courses', 'list'] }, (old: any) => {
        if (!old?.data) return old;
        return { ...old, data: old.data.filter((c: AdminCourse) => c.id !== course.id) };
      });
      queryClient.setQueriesData({ queryKey: ['admin', 'courses', 'stats'] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          total: Math.max(0, (old.total ?? 0) - 1),
          [STATE_KEY_MAP[course.state]]: Math.max(0, (old[STATE_KEY_MAP[course.state]] ?? 0) - 1),
        };
      });
      return { listSnapshot, statsSnapshot };
    },
    onSuccess: () => {
      toast.success(t('toast.deleted', { title: course.title }));
      invalidateList(); refetchStatsLater();
      setDeleteOpen(false);
    },
    onError: (err: any, _v: any, ctx: any) => {
      ctx?.listSnapshot?.forEach(([k, v]: [any, any])  => queryClient.setQueryData(k, v));
      ctx?.statsSnapshot?.forEach(([k, v]: [any, any]) => queryClient.setQueryData(k, v));
      toast.error(t('errors.deleteFailed', { message: err?.response?.data?.message ?? err?.message ?? '' }));
    },
  });

  const currentState = STATE_OPTIONS.find((o) => o.value === course.state) ?? STATE_OPTIONS[2];
  const CurrentIcon  = currentState.icon;

  // Preview → opens on the main frontend app
  const openPreview = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const base = (ENV.FRONTEND_URL ?? '').replace(/\/$/, '');
    window.open(`${base}/courses/${course.slug}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/*
       * SLIDE-UP BAR
       * Positioned absolute at bottom-0, starts translate-y-full (hidden below),
       * slides to translate-y-0 on group-hover.
       * Semi-transparent bg with blur so card content shows through slightly.
       */}
      <div
        className={cn(
          'absolute bottom-0 inset-x-0 z-20',
          'translate-y-full group-hover:translate-y-0',
          'transition-transform duration-200 ease-out',
          // Frosted-glass background — matches dark card theme
          'bg-zinc-900/85 backdrop-blur-md border-t border-white/10',
          'flex items-center gap-1.5 px-3 py-2.5',
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Edit (primary) */}
        <Button
          size='sm'
          className='flex-1 h-8 text-xs gap-1.5 bg-primary/90 hover:bg-primary'
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(ROUTES.COURSE_EDIT(course.slug)); }}
        >
          <Pencil className='h-3.5 w-3.5' /> {t('overlay.edit')}
        </Button>

        {/* Preview → main frontend */}
        <Button
          size='sm' variant='outline'
          className='h-8 w-8 p-0 border-white/20 bg-white/5 text-white/70 hover:bg-white/15 hover:text-white'
          title={t('overlay.preview')}
          onClick={openPreview}
        >
          <Eye className='h-3.5 w-3.5' />
        </Button>

        {/* State + more actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size='sm' variant='outline'
              className={cn(
                'h-8 gap-1.5 px-2.5 text-[11px] font-semibold border',
                STATE_PILL[course.state] ?? STATE_PILL.DRAFT,
              )}
              disabled={stateMutation.isPending}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              {stateMutation.isPending
                ? <Loader2 className='h-3 w-3 animate-spin' />
                : <><CurrentIcon className='h-3 w-3' /><span className='hidden sm:inline ms-1'>{t(currentState.labelKey)}</span></>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='min-w-[170px]'>
            {STATE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isCurrent = course.state === opt.value;
              return (
                <DropdownMenuItem
                  key={opt.value}
                  disabled={isCurrent}
                  className={cn('gap-2 text-xs', isCurrent && 'opacity-50 cursor-default')}
                  onSelect={(e) => { e.preventDefault(); if (!isCurrent) stateMutation.mutate(opt.value); }}
                >
                  <Icon className={cn('h-3.5 w-3.5', opt.color)} />
                  {t(opt.labelKey)}
                  {isCurrent && <span className='ms-auto text-[10px] text-muted-foreground'>✓</span>}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='gap-2 text-xs'
              disabled={duplicateMutation.isPending}
              onSelect={(e) => { e.preventDefault(); duplicateMutation.mutate(); }}
            >
              {duplicateMutation.isPending
                ? <Loader2 className='h-3.5 w-3.5 animate-spin' />
                : <Copy className='h-3.5 w-3.5' />}
              {t('overlay.duplicate')}
            </DropdownMenuItem>
            <DropdownMenuItem
              className='gap-2 text-xs text-destructive focus:text-destructive'
              disabled={deleteMutation.isPending}
              onSelect={(e) => { e.preventDefault(); setDeleteOpen(true); }}
            >
              <Trash2 className='h-3.5 w-3.5' />
              {t('overlay.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialogs.deleteTitle', { title: course.title })}</AlertDialogTitle>
            <AlertDialogDescription>{t('dialogs.deleteDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>{t('dialogs.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); deleteMutation.mutate(undefined); }}
              disabled={deleteMutation.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteMutation.isPending
                ? <><Loader2 className='mr-2 h-4 w-4 animate-spin' />{t('dialogs.deleting')}</>
                : t('dialogs.deleteConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
