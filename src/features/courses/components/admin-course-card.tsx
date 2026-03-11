// src/features/courses/components/admin-course-card.tsx
// ✅ Identical to frontend SharedCourseCard (FullCard) + admin overlay: Edit / Preview / PublishToggle
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  BookOpen, FlaskConical, BookMarked, BarChart3,
  Clock, ArrowRight, Unlock, Crown, Gem,
  Sparkles, CheckCircle2, Pencil, Eye,
  Globe, EyeOff, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminCoursesApi } from '../services/admin-courses.api';
import type { AdminCourse } from '../types/admin-course.types';

// ── Constants (mirror of frontend) ────────────────────────────────
const FALLBACK_BG: Record<string, string> = {
  emerald: 'from-emerald-950 to-emerald-900 border-emerald-800/50',
  blue:    'from-blue-950    to-blue-900    border-blue-800/50',
  violet:  'from-violet-950  to-violet-900  border-violet-800/50',
  orange:  'from-orange-950  to-orange-900  border-orange-800/50',
  rose:    'from-rose-950    to-rose-900    border-rose-800/50',
  cyan:    'from-cyan-950    to-cyan-900    border-cyan-800/50',
};
const FALLBACK_TEXT: Record<string, string> = {
  emerald: 'text-emerald-400', blue: 'text-blue-400',
  violet:  'text-violet-400',  orange: 'text-orange-400',
  rose:    'text-rose-400',    cyan: 'text-cyan-400',
};
const HOVER_RING: Record<string, string> = {
  emerald: 'hover:ring-emerald-500/30', blue:   'hover:ring-blue-500/30',
  violet:  'hover:ring-violet-500/30',  orange: 'hover:ring-orange-500/30',
  rose:    'hover:ring-rose-500/30',    cyan:   'hover:ring-cyan-500/30',
};
const ACCESS_BADGE: Record<string, string> = {
  FREE:    'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  PRO:     'border-blue-500/40    text-blue-400    bg-blue-500/10',
  PREMIUM: 'border-violet-500/40  text-violet-400  bg-violet-500/10',
};
const ACCESS_ICON: Record<string, React.ElementType> = {
  FREE: Unlock, PRO: Crown, PREMIUM: Gem,
};
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

// ── Thumbnail ────────────────────────────────────────────────────────
function CourseThumbnail({ course }: { course: AdminCourse }) {
  const img = (course as any).image ?? course.thumbnail;
  const color = (course as any).color ?? 'blue';
  if (img) {
    return (
      <img
        src={img} alt={course.title} loading='lazy'
        className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
      />
    );
  }
  return (
    <div className={cn(
      'w-full h-full flex items-center justify-center bg-gradient-to-br border',
      FALLBACK_BG[color] ?? 'from-zinc-900 to-zinc-800 border-zinc-700',
    )}>
      <p className={cn('font-black text-center px-3 leading-tight text-lg', FALLBACK_TEXT[color] ?? 'text-zinc-400')}>
        {course.title}
      </p>
    </div>
  );
}

// ── Main Card ─────────────────────────────────────────────────────────
export interface AdminCourseCardProps {
  course: AdminCourse;
  index?: number;
}

export function AdminCourseCard({ course, index = 0 }: AdminCourseCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  const color       = (course as any).color ?? 'blue';
  const comingSoon  = (course as any).state === 'COMING_SOON';
  const isPublished = course.isPublished ?? false;

  // ─ i18n display values ─
  const title = lang === 'ar' && (course as any).ar_title ? (course as any).ar_title : course.title;
  const desc  = lang === 'ar' && (course as any).ar_description
    ? (course as any).ar_description
    : course.description;
  const diff  = normalizeDiff(
    lang === 'ar' && (course as any).ar_difficulty
      ? (course as any).ar_difficulty
      : course.difficulty,
  );
  const cat   = lang === 'ar' ? (course as any).ar_category : (course as any).category;
  const ct    = CONTENT_ICON[(course as any).contentType ?? 'MIXED'];
  const AccessIcon = ACCESS_ICON[course.access ?? 'FREE'] ?? Unlock;

  // ─ Publish toggle mutation ─
  const { mutate: togglePublish, isPending: toggling } = useMutation({
    mutationFn: (action: 'publish' | 'unpublish') =>
      action === 'publish' ? adminCoursesApi.publish(course.id) : adminCoursesApi.unpublish(course.id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast.success(updated.isPublished ? 'Course published ✅' : 'Course unpublished');
    },
    onError: () => toast.error('Failed to update publish state'),
  });

  // ─ Preview: open frontend URL in new tab ─
  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    const frontendBase = import.meta.env.VITE_FRONTEND_URL ?? 'http://localhost:5173';
    window.open(`${frontendBase}/courses/${course.slug}`, '_blank');
  };

  // ─ Edit: go to detail page ─
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/courses/${course.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={cn(
        'group relative flex flex-col rounded-2xl border bg-card overflow-hidden',
        'transition-all duration-300 ring-1 ring-transparent',
        HOVER_RING[color] ?? 'hover:ring-primary/20',
        'hover:shadow-xl hover:-translate-y-0.5',
      )}>

      {/* ── Thumbnail ── */}
      <div className='relative aspect-video overflow-hidden bg-muted'>
        <CourseThumbnail course={course} />

        {/* Coming Soon overlay */}
        {comingSoon && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm'>
            <span className='flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/80'>
              <Sparkles className='h-3 w-3' /> Coming Soon
            </span>
          </div>
        )}

        {/* Published indicator */}
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

        {/* ── Admin action overlay (top-right) ── */}
        <div className='absolute top-2 end-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
          {/* Lang toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); setLang((l) => l === 'en' ? 'ar' : 'en'); }}
            className='h-7 px-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 text-[10px] font-bold text-foreground hover:bg-background transition-colors'>
            {lang === 'en' ? 'AR' : 'EN'}
          </button>
        </div>
      </div>

      {/* ── Body (identical to frontend FullCard) ── */}
      <div className='flex flex-col flex-1 p-4 gap-3'>
        <div className='flex items-start justify-between gap-2'>
          <h3 className={cn('text-sm font-bold text-foreground leading-snug line-clamp-2 flex-1', lang === 'ar' && 'text-right')} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {title}
          </h3>
          {cat && (
            <span className='text-[11px] text-muted-foreground shrink-0'>{cat}</span>
          )}
        </div>

        {desc && (
          <p className={cn('text-xs text-muted-foreground leading-relaxed line-clamp-2', lang === 'ar' && 'text-right')} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
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
          {((course as any).totalTopics ?? 0) > 0 && (
            <Badge variant='outline' className='gap-1 text-[10px] font-semibold text-primary border-primary/30 bg-primary/5'>
              <Clock className='h-3 w-3' /> {(course as any).totalTopics} Topics
            </Badge>
          )}
          {ct && (
            <Badge variant='outline' className='gap-1 text-[10px] text-muted-foreground border-border/40'>
              <ct.Icon className='h-3 w-3' /> {ct.label}
            </Badge>
          )}
          {(course as any).estimatedHours && (
            <Badge variant='outline' className='gap-1 text-[10px] text-muted-foreground border-border/40'>
              <Clock className='h-3 w-3' /> {(course as any).estimatedHours}h
            </Badge>
          )}
        </div>

        {/* ── Admin CTA Row ── */}
        <div className='flex gap-2 mt-auto pt-1'>
          {/* Edit button */}
          <Button
            variant='outline'
            size='sm'
            className='flex-1 h-9 text-xs border-border/60 hover:bg-muted gap-1.5'
            onClick={handleEdit}>
            <Pencil className='h-3.5 w-3.5' /> Edit
          </Button>

          {/* Preview button */}
          <Button
            variant='outline'
            size='sm'
            className='h-9 w-9 p-0 border-border/60 hover:bg-muted shrink-0'
            onClick={handlePreview}
            title='Preview on platform (new tab)'>
            <Eye className='h-3.5 w-3.5' />
          </Button>

          {/* Publish toggle */}
          <Button
            size='sm'
            variant='outline'
            className={cn(
              'h-9 w-9 p-0 shrink-0 transition-colors',
              isPublished
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                : 'border-zinc-500/40 bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20',
            )}
            disabled={toggling}
            onClick={(e) => { e.stopPropagation(); togglePublish(isPublished ? 'unpublish' : 'publish'); }}
            title={isPublished ? 'Unpublish' : 'Publish'}>
            {toggling
              ? <Loader2 className='h-3.5 w-3.5 animate-spin' />
              : isPublished
                ? <Globe className='h-3.5 w-3.5' />
                : <EyeOff className='h-3.5 w-3.5' />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
