// src/features/courses/components/admin-overlay-controls.tsx
// Slide-up frosted bar with 5 visible buttons:
//   [Edit]  [Preview]  [Duplicate]  [Delete]  [State ▾]
// State is the ONLY dropdown.
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Pencil, Trash2, Globe, EyeOff, Copy, Loader2, Clock,
  ChevronDown, Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { adminCoursesApi } from '../services/admin-courses.api';
import { ROUTES } from '@/shared/constants';
import type { AdminCourse, CourseState } from '../types/admin-course.types';

// Opens the REAL cyberlabs-frontend app, not the admin router.
// Browser always opens a new tab — that is the expected behaviour.
const FRONTEND_BASE =
  (import.meta.env.VITE_FRONTEND_URL as string | undefined)?.replace(/\/$/, '') ??
  'http://localhost:5173';

const STATE_OPTIONS: { value: CourseState; en: string; ar: string; icon: React.ElementType; color: string }[] = [
  { value: 'PUBLISHED',   en: 'Published',   ar: 'منشور',  icon: Globe,  color: 'text-emerald-400' },
  { value: 'COMING_SOON', en: 'Coming Soon', ar: 'قريباً', icon: Clock,  color: 'text-blue-400'    },
  { value: 'DRAFT',       en: 'Draft',       ar: 'مسودة',  icon: EyeOff, color: 'text-zinc-400'    },
];

const STATE_PILL: Record<string, string> = {
  PUBLISHED:   'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25',
  COMING_SOON: 'bg-blue-500/15    text-blue-300    border-blue-500/30    hover:bg-blue-500/25',
  DRAFT:       'bg-zinc-500/15    text-zinc-300    border-zinc-500/30    hover:bg-zinc-500/25',
};

const STATE_KEY_MAP: Record<string, string> = {
  PUBLISHED: 'published', DRAFT: 'draft', COMING_SOON: 'comingSoon',
};

export function AdminOverlayControls({ course }: { course: AdminCourse }) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const refetchStats = useCallback(() => {
    setTimeout(() => queryClient.refetchQueries({ queryKey: ['admin', 'courses', 'stats'], type: 'active' }), 600);
  }, [queryClient]);
  const invalidateList = useCallback(() =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'courses', 'list'] }), [queryClient]);

  // ── setState (optimistic) ────────────────────────────────────────────────
  const stateMutation = useMutation({
    mutationFn: (s: CourseState) => adminCoursesApi.setState(course.id, s),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'courses', 'list']  });
      await queryClient.cancelQueries({ queryKey: ['admin', 'courses', 'stats'] });
      const listSnap  = queryClient.getQueriesData({ queryKey: ['admin', 'courses', 'list']  });
      const statsSnap = queryClient.getQueriesData({ queryKey: ['admin', 'courses', 'stats'] });
      queryClient.setQueriesData({ queryKey: ['admin', 'courses', 'list'] }, (old: any) =>
        old?.data ? { ...old, data: old.data.map((c: AdminCourse) => c.id === course.id ? { ...c, state: next } : c) } : old);
      queryClient.setQueriesData({ queryKey: ['admin', 'courses', 'stats'] }, (old: any) => {
        if (!old) return old;
        const prev = course.state;
        return {
          ...old,
          [STATE_KEY_MAP[prev]]: Math.max(0, (old[STATE_KEY_MAP[prev]] ?? 0) - 1),
          [STATE_KEY_MAP[next]]: (old[STATE_KEY_MAP[next]] ?? 0) + 1,
        };
      });
      return { listSnap, statsSnap };
    },
    onSuccess: () => { invalidateList(); refetchStats(); },
    onError: (_e: any, _v: any, ctx: any) => {
      ctx?.listSnap?.forEach(([k, v]: any)  => queryClient.setQueryData(k, v));
      ctx?.statsSnap?.forEach(([k, v]: any) => queryClient.setQueryData(k, v));
      toast.error(isAr ? 'فشل تحديث الحالة' : 'Failed to update state');
    },
  });

  // ── duplicate ────────────────────────────────────────────────────────────
  const duplicateMutation = useMutation({
    mutationFn: () => adminCoursesApi.duplicate(course.id),
    onSuccess: (c) => {
      toast.success(isAr ? `تم تكرار "${course.title}"` : `"${course.title}" duplicated`);
      invalidateList(); refetchStats();
      navigate(ROUTES.COURSE_EDIT(c.slug ?? c.id));
    },
    onError: () => toast.error(isAr ? 'فشل تكرار الكورس' : 'Failed to duplicate course'),
  });

  // ── delete ───────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: () => adminCoursesApi.delete(course.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'courses', 'list']  });
      await queryClient.cancelQueries({ queryKey: ['admin', 'courses', 'stats'] });
      const listSnap  = queryClient.getQueriesData({ queryKey: ['admin', 'courses', 'list']  });
      const statsSnap = queryClient.getQueriesData({ queryKey: ['admin', 'courses', 'stats'] });
      queryClient.setQueriesData({ queryKey: ['admin', 'courses', 'list'] }, (old: any) =>
        old?.data ? { ...old, data: old.data.filter((c: AdminCourse) => c.id !== course.id) } : old);
      queryClient.setQueriesData({ queryKey: ['admin', 'courses', 'stats'] }, (old: any) =>
        old ? { ...old, total: Math.max(0, (old.total ?? 0) - 1), [STATE_KEY_MAP[course.state]]: Math.max(0, (old[STATE_KEY_MAP[course.state]] ?? 0) - 1) } : old);
      return { listSnap, statsSnap };
    },
    onSuccess: () => {
      toast.success(isAr ? `تم حذف "${course.title}"` : `"${course.title}" deleted`);
      invalidateList(); refetchStats();
      setDeleteOpen(false);
    },
    onError: (_e: any, _v: any, ctx: any) => {
      ctx?.listSnap?.forEach(([k, v]: any)  => queryClient.setQueryData(k, v));
      ctx?.statsSnap?.forEach(([k, v]: any) => queryClient.setQueryData(k, v));
      toast.error(isAr ? 'فشل حذف الكورس' : 'Failed to delete course');
    },
  });

  const currentOpt   = STATE_OPTIONS.find((o) => o.value === course.state) ?? STATE_OPTIONS[2];
  const CurrentIcon  = currentOpt.icon;
  const currentLabel = isAr ? currentOpt.ar : currentOpt.en;

  const openPreview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`${FRONTEND_BASE}/courses/${course.slug}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/*
       * SLIDE-UP BAR
       * ─ 5 controls: [Edit▶]  [👁 Preview]  [⧉ Duplicate]  [🗑 Delete]  [State ▾]
       * ─ frosted glass, slides up from bottom on group-hover
       */}
      <div
        className={cn(
          'absolute bottom-0 inset-x-0 z-20',
          'translate-y-full group-hover:translate-y-0',
          'transition-transform duration-200 ease-out',
          'bg-zinc-900/88 backdrop-blur-md border-t border-white/10',
          'flex items-center gap-1 px-2.5 py-2',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Edit — primary CTA */}
        <Button
          size='sm'
          className='flex-1 h-8 text-xs gap-1.5 bg-primary/90 hover:bg-primary'
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(ROUTES.COURSE_EDIT(course.slug)); }}
        >
          <Pencil className='h-3.5 w-3.5' />
          {isAr ? 'تعديل' : 'Edit'}
        </Button>

        {/* Preview — opens FRONTEND_BASE/courses/:slug in new tab */}
        <Button
          size='sm' variant='outline'
          className='h-8 w-8 p-0 border-white/20 bg-white/5 text-white/70 hover:bg-white/15 hover:text-white'
          title={isAr ? 'معاينة' : 'Preview'}
          onClick={openPreview}
        >
          <Eye className='h-3.5 w-3.5' />
        </Button>

        {/* Duplicate */}
        <Button
          size='sm' variant='outline'
          className='h-8 w-8 p-0 border-white/20 bg-white/5 text-white/70 hover:bg-white/15 hover:text-white'
          title={isAr ? 'تكرار' : 'Duplicate'}
          disabled={duplicateMutation.isPending}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); duplicateMutation.mutate(); }}
        >
          {duplicateMutation.isPending
            ? <Loader2 className='h-3.5 w-3.5 animate-spin' />
            : <Copy className='h-3.5 w-3.5' />}
        </Button>

        {/* Delete */}
        <Button
          size='sm' variant='outline'
          className='h-8 w-8 p-0 border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500/20 hover:text-red-300'
          title={isAr ? 'حذف' : 'Delete'}
          disabled={deleteMutation.isPending}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteOpen(true); }}
        >
          {deleteMutation.isPending
            ? <Loader2 className='h-3.5 w-3.5 animate-spin' />
            : <Trash2 className='h-3.5 w-3.5' />}
        </Button>

        {/* State — ONLY dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size='sm' variant='outline'
              className={cn(
                'h-8 gap-1 px-2 text-[11px] font-semibold border',
                STATE_PILL[course.state] ?? STATE_PILL.DRAFT,
              )}
              disabled={stateMutation.isPending}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              {stateMutation.isPending
                ? <Loader2 className='h-3 w-3 animate-spin' />
                : (
                  <>
                    <CurrentIcon className='h-3 w-3' />
                    <span className='hidden sm:inline max-w-[48px] truncate'>{currentLabel}</span>
                    <ChevronDown className='h-2.5 w-2.5 opacity-60' />
                  </>
                )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='min-w-[150px]'>
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
                  {isAr ? opt.ar : opt.en}
                  {isCurrent && <span className='ms-auto text-[10px] text-muted-foreground'>✓</span>}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isAr ? `حذف "${course.title}"؟` : `Delete "${course.title}"?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isAr
                ? 'سيؤدي هذا إلى حذف الكورس وجميع بياناته نهائياً. لا يمكن التراجع.'
                : 'This will permanently delete the course and all its data. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); deleteMutation.mutate(); }}
              disabled={deleteMutation.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteMutation.isPending
                ? <><Loader2 className='mr-2 h-4 w-4 animate-spin' />{isAr ? 'جارٍ الحذف…' : 'Deleting…'}</>
                : (isAr ? 'حذف الكورس' : 'Delete Course')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
