// src/features/courses/components/admin-course-card.tsx
// Platform-identical card + EN/AR toggle + Edit / Preview / Publish / Duplicate / Delete
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  BookOpen, FlaskConical, BookMarked, BarChart3,
  Clock, Unlock, Crown, Gem, Sparkles,
  Pencil, Eye, Globe, EyeOff, Loader2, Copy, Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminCoursesApi } from '../services/admin-courses.api';
import type { AdminCourse } from '../types/admin-course.types';

const FALLBACK_BG: Record<string, string> = {
  EMERALD: 'from-emerald-950 to-emerald-900 border-emerald-800/50',
  BLUE:    'from-blue-950    to-blue-900    border-blue-800/50',
  VIOLET:  'from-violet-950  to-violet-900  border-violet-800/50',
  ORANGE:  'from-orange-950  to-orange-900  border-orange-800/50',
  ROSE:    'from-rose-950    to-rose-900    border-rose-800/50',
  CYAN:    'from-cyan-950    to-cyan-900    border-cyan-800/50',
};
const FALLBACK_TEXT: Record<string, string> = {
  EMERALD: 'text-emerald-400', BLUE: 'text-blue-400',
  VIOLET:  'text-violet-400',  ORANGE: 'text-orange-400',
  ROSE:    'text-rose-400',    CYAN: 'text-cyan-400',
};
const HOVER_RING: Record<string, string> = {
  EMERALD: 'hover:ring-emerald-500/30', BLUE: 'hover:ring-blue-500/30',
  VIOLET:  'hover:ring-violet-500/30',  ORANGE: 'hover:ring-orange-500/30',
  ROSE:    'hover:ring-rose-500/30',    CYAN: 'hover:ring-cyan-500/30',
};
const ACCESS_BADGE: Record<string, string> = {
  FREE:    'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  PRO:     'border-blue-500/40    text-blue-400    bg-blue-500/10',
  PREMIUM: 'border-violet-500/40  text-violet-400  bg-violet-500/10',
};
const ACCESS_ICON: Record<string, React.ElementType> = { FREE: Unlock, PRO: Crown, PREMIUM: Gem };
const CONTENT_ICON: Record<string, { Icon: React.ElementType; label: string }> = {
  PRACTICAL:   { Icon: FlaskConical, label: 'Practical' },
  THEORETICAL: { Icon: BookMarked,   label: 'Theory'    },
  MIXED:       { Icon: BookOpen,     label: 'Mixed'     },
};

function normalizeDiff(d?: string | null) {
  if (!d) return null;
  const s = d.toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export interface AdminCourseCardProps {
  course: AdminCourse;
  index?: number;
}

export function AdminCourseCard({ course, index = 0 }: AdminCourseCardProps) {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  const colorKey   = (course.color ?? 'BLUE').toUpperCase();
  const comingSoon = course.state === 'COMING_SOON';
  const isPublished = (course as any).isPublished ?? false;

  const title = lang === 'ar' && course.ar_title ? course.ar_title : course.title;
  const desc  = lang === 'ar' && course.ar_description ? course.ar_description : course.description;
  const diff  = normalizeDiff(course.difficulty);
  const ct    = CONTENT_ICON[course.contentType ?? 'MIXED'];
  const AccessIcon = ACCESS_ICON[course.access ?? 'FREE'] ?? Unlock;

  // ── mutations ─────────────────────────────────────────────
  const { mutate: togglePublish, isPending: toggling } = useMutation({
    mutationFn: (action: 'publish' | 'unpublish') =>
      action === 'publish' ? adminCoursesApi.publish(course.id) : adminCoursesApi.unpublish(course.id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast.success(updated.isPublished ? 'Published ✅' : 'Unpublished');
    },
    onError: () => toast.error('Failed to update publish state'),
  });

  const { mutate: duplicate, isPending: duplicating } = useMutation({
    mutationFn: () => adminCoursesApi.duplicate(course.id),
    onSuccess: (newCourse) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast.success('Duplicated — opening new course');
      navigate(`/courses/${newCourse.id}`);
    },
    onError: () => toast.error('Failed to duplicate'),
  });

  const { mutate: deleteCourse, isPending: deleting } = useMutation({
    mutationFn: () => adminCoursesApi.delete(course.id),
    // Optimistic: remove immediately
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'courses', 'list'] });
      const prev = queryClient.getQueryData(['admin', 'courses', 'list']);
      queryClient.setQueryData(['admin', 'courses', 'list'], (old: any) => {
        if (!old?.data) return old;
        return { ...old, data: old.data.filter((c: AdminCourse) => c.id !== course.id) };
      });
      return { prev };
    },
    onError: (_e, _v, ctx: any) => {
      if (ctx?.prev) queryClient.setQueryData(['admin', 'courses', 'list'], ctx.prev);
      toast.error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast.success('Course deleted');
    },
  });

  const img = (course as any).image ?? course.thumbnail;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={cn(
        'group relative flex flex-col rounded-2xl border bg-card overflow-hidden',
        'transition-all duration-300 ring-1 ring-transparent',
        HOVER_RING[colorKey] ?? 'hover:ring-primary/20',
        'hover:shadow-xl hover:-translate-y-0.5',
      )}>

      {/* ── Thumbnail ── */}
      <div className='relative aspect-video overflow-hidden bg-muted'>
        {img ? (
          <img src={img} alt={course.title} loading='lazy'
            className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105' />
        ) : (
          <div className={cn(
            'w-full h-full flex items-center justify-center bg-gradient-to-br border',
            FALLBACK_BG[colorKey] ?? 'from-zinc-900 to-zinc-800 border-zinc-700',
          )}>
            <p className={cn('font-black text-center px-3 leading-tight text-lg',
              FALLBACK_TEXT[colorKey] ?? 'text-zinc-400')}>
              {title}
            </p>
          </div>
        )}

        {/* Coming Soon overlay */}
        {comingSoon && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm'>
            <span className='flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/80'>
              <Sparkles className='h-3 w-3' /> Coming Soon
            </span>
          </div>
        )}

        {/* Published / Draft badge */}
        {!comingSoon && (
          <div className='absolute top-3 start-3'>
            {isPublished ? (
              <span className='inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md'>
                <span className='h-1.5 w-1.5 rounded-full bg-white animate-pulse' /> Published
              </span>
            ) : (
              <span className='inline-flex items-center gap-1 rounded-full bg-zinc-700 px-2.5 py-1 text-[11px] font-bold text-zinc-300 shadow-md'>
                <span className='h-1.5 w-1.5 rounded-full bg-zinc-400' /> Draft
              </span>
            )}
          </div>
        )}

        {/* Admin overlay — shows on hover */}
        <div className='absolute inset-0 bg-black/70 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3'>
          {/* Row 1: Edit + Preview */}
          <div className='flex gap-2'>
            <Button size='sm' variant='secondary'
              className='h-8 gap-1.5 text-xs'
              onClick={(e) => { e.stopPropagation(); navigate(`/courses/${course.id}`); }}>
              <Pencil className='h-3.5 w-3.5' /> Edit
            </Button>
            <Button size='sm' variant='secondary'
              className='h-8 gap-1.5 text-xs'
              onClick={(e) => {
                e.stopPropagation();
                const base = import.meta.env.VITE_FRONTEND_URL ?? 'http://localhost:5173';
                window.open(`${base}/courses/${course.slug}`, '_blank');
              }}>
              <Eye className='h-3.5 w-3.5' /> Preview
            </Button>
          </div>
          {/* Row 2: Publish + Duplicate + Delete */}
          <div className='flex gap-2'>
            <Button size='sm' variant='outline'
              className={cn(
                'h-8 gap-1.5 text-xs',
                isPublished
                  ? 'border-zinc-500/50 text-zinc-300 hover:bg-zinc-800'
                  : 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-950',
              )}
              disabled={toggling}
              onClick={(e) => { e.stopPropagation(); togglePublish(isPublished ? 'unpublish' : 'publish'); }}>
              {toggling
                ? <Loader2 className='h-3.5 w-3.5 animate-spin' />
                : isPublished
                  ? <><EyeOff className='h-3.5 w-3.5' /> Unpublish</>
                  : <><Globe className='h-3.5 w-3.5' /> Publish</>}
            </Button>
            <Button size='sm' variant='outline'
              className='h-8 w-8 p-0 border-blue-500/40 text-blue-400 hover:bg-blue-950'
              disabled={duplicating}
              title='Duplicate'
              onClick={(e) => { e.stopPropagation(); duplicate(); }}>
              {duplicating ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Copy className='h-3.5 w-3.5' />}
            </Button>
            <Button size='sm' variant='outline'
              className='h-8 w-8 p-0 border-red-500/40 text-red-400 hover:bg-red-950'
              disabled={deleting}
              title='Delete'
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete "${course.title}"?`)) deleteCourse();
              }}>
              {deleting ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Trash2 className='h-3.5 w-3.5' />}
            </Button>
          </div>
          {/* Lang toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); setLang((l) => l === 'en' ? 'ar' : 'en'); }}
            className='mt-1 h-6 px-2 rounded-full bg-background/20 border border-white/20 text-[10px] font-bold text-white/70 hover:bg-background/40 transition-colors'>
            {lang === 'en' ? 'عربي' : 'English'}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className='flex flex-col flex-1 p-4 gap-3'>
        <div className='flex items-start justify-between gap-2'>
          <h3
            className={cn('text-sm font-bold text-foreground leading-snug line-clamp-2 flex-1', lang === 'ar' && 'text-right')}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {title}
          </h3>
          {(course as any).category && (
            <span className='text-[11px] text-muted-foreground shrink-0'>
              {(course as any).category?.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {desc && (
          <p className={cn('text-xs text-muted-foreground leading-relaxed line-clamp-2', lang === 'ar' && 'text-right')}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {desc}
          </p>
        )}

        <div className='flex flex-wrap items-center gap-1.5'>
          {diff && (
            <Badge variant='outline' className='gap-1 text-[10px] font-semibold border-border/60 bg-muted/40'>
              <BarChart3 className='h-3 w-3' /> {diff}
            </Badge>
          )}
          {course.access && (
            <Badge variant='outline' className={cn('gap-1 text-[10px] font-bold', ACCESS_BADGE[course.access])}>
              <AccessIcon className='h-3 w-3' /> {course.access}
            </Badge>
          )}
          {(course.totalTopics ?? 0) > 0 && (
            <Badge variant='outline' className='gap-1 text-[10px] font-semibold text-primary border-primary/30 bg-primary/5'>
              <Clock className='h-3 w-3' /> {course.totalTopics} Topics
            </Badge>
          )}
          {ct && (
            <Badge variant='outline' className='gap-1 text-[10px] text-muted-foreground border-border/40'>
              <ct.Icon className='h-3 w-3' /> {ct.label}
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
}
