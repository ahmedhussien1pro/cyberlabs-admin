// src/features/courses/components/course-admin-card.tsx
// CMS Phase 1: Frontend-identical card + Admin Overlay + Inline Editing
import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  BookOpen,
  FlaskConical,
  BookMarked,
  BarChart3,
  Clock,
  Unlock,
  Crown,
  Gem,
  Sparkles,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AdminOverlayControls } from './admin-overlay-controls';
import { InlineEditable } from './inline-editable';
import { adminCoursesApi } from '../services/admin-courses.api';
import type { AdminCourse } from '../types/admin-course.types';

// ── Color maps (مطابقة للـ frontend) ─────────────────────────────────
const FALLBACK_BG: Record<string, string> = {
  emerald: 'from-emerald-950 to-emerald-900 border-emerald-800/50',
  blue:    'from-blue-950    to-blue-900    border-blue-800/50',
  violet:  'from-violet-950  to-violet-900  border-violet-800/50',
  orange:  'from-orange-950  to-orange-900  border-orange-800/50',
  rose:    'from-rose-950    to-rose-900    border-rose-800/50',
  cyan:    'from-cyan-950    to-cyan-900    border-cyan-800/50',
};
const FALLBACK_TEXT: Record<string, string> = {
  emerald: 'text-emerald-400',
  blue:    'text-blue-400',
  violet:  'text-violet-400',
  orange:  'text-orange-400',
  rose:    'text-rose-400',
  cyan:    'text-cyan-400',
};
const HOVER_RING: Record<string, string> = {
  emerald: 'hover:ring-emerald-500/30',
  blue:    'hover:ring-blue-500/30',
  violet:  'hover:ring-violet-500/30',
  orange:  'hover:ring-orange-500/30',
  rose:    'hover:ring-rose-500/30',
  cyan:    'hover:ring-cyan-500/30',
};
const ACCESS_BADGE: Record<string, string> = {
  FREE:    'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  PRO:     'border-blue-500/40    text-blue-400    bg-blue-500/10',
  PREMIUM: 'border-violet-500/40  text-violet-400  bg-violet-500/10',
};
const ACCESS_ICON: Record<string, React.ElementType> = {
  FREE:    Unlock,
  PRO:     Crown,
  PREMIUM: Gem,
};
const CONTENT_ICON: Record<string, { Icon: React.ElementType; label: string }> = {
  PRACTICAL:   { Icon: FlaskConical, label: 'Practical' },
  THEORETICAL: { Icon: BookMarked,   label: 'Theory'    },
  MIXED:       { Icon: BookOpen,     label: 'Mixed'     },
};
const STATE_DOT: Record<string, string> = {
  PUBLISHED:   'bg-emerald-400',
  DRAFT:       'bg-zinc-400',
  COMING_SOON: 'bg-yellow-400',
};

function normalizeDiff(d?: string | null) {
  if (!d) return null;
  const s = d.toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function CourseThumbnail({ course, className }: { course: AdminCourse; className?: string }) {
  const img = course.image ?? course.thumbnail;
  const color = (course.color ?? 'blue').toLowerCase();
  if (img) {
    return (
      <img
        src={img}
        alt={course.title}
        loading='lazy'
        className={cn('w-full h-full object-cover', className)}
      />
    );
  }
  return (
    <div
      className={cn(
        'w-full h-full flex items-center justify-center bg-gradient-to-br border',
        FALLBACK_BG[color] ?? 'from-zinc-900 to-zinc-800 border-zinc-700',
      )}
    >
      <p className={cn('font-black text-center px-3 leading-tight text-lg', FALLBACK_TEXT[color] ?? 'text-zinc-400')}>
        {course.title}
      </p>
    </div>
  );
}

interface Props {
  course: AdminCourse;
  index?: number;
  view?: 'grid' | 'list';
}

export function CourseAdminCard({ course, index = 0, view = 'grid' }: Props) {
  const queryClient = useQueryClient();
  const color = (course.color ?? 'blue').toLowerCase();
  const comingSoon = course.state === 'COMING_SOON';
  const ct = CONTENT_ICON[course.contentType ?? 'MIXED'];
  const AccessIcon = ACCESS_ICON[course.access ?? 'FREE'] ?? Unlock;
  const diff = normalizeDiff(course.difficulty);
  const stateDot = STATE_DOT[course.state] ?? 'bg-zinc-400';

  const updateMutation = useMutation({
    mutationFn: (data: { title?: string; description?: string }) =>
      adminCoursesApi.update(course.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
    },
    onError: () => toast.error('Failed to save changes'),
  });

  // ── List view ──────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className='group relative flex items-center gap-4 rounded-lg border border-border/50 bg-card px-4 py-3 hover:border-border transition-colors'>
        <AdminOverlayControls course={course} />
        <div className={cn('h-2 w-2 shrink-0 rounded-full', stateDot)} />
        <div className='relative w-16 h-10 shrink-0 overflow-hidden rounded bg-muted'>
          <CourseThumbnail course={course} />
        </div>
        <div className='min-w-0 flex-1'>
          <InlineEditable
            value={course.title}
            onSave={(val) => updateMutation.mutateAsync({ title: val })}
            className='font-medium text-sm'
          />
          {course.ar_title && (
            <p className='truncate text-xs text-muted-foreground' dir='rtl'>{course.ar_title}</p>
          )}
        </div>
        <div className='hidden sm:flex items-center gap-3 text-xs text-muted-foreground'>
          <span className='flex items-center gap-1'><Users className='h-3 w-3' />{course.enrollmentCount ?? 0}</span>
          <span className='flex items-center gap-1'><BookOpen className='h-3 w-3' />{course.totalTopics ?? 0}</span>
        </div>
        <div className='hidden md:flex items-center gap-2'>
          <Badge variant='outline' className={cn('text-[10px]', ACCESS_BADGE[course.access])}>
            <AccessIcon className='h-3 w-3 mr-1' />{course.access}
          </Badge>
          <Badge variant='outline' className='text-[10px]'>{course.state}</Badge>
        </div>
      </div>
    );
  }

  // ── Grid view (مطابق للـ frontend FullCard + admin overlay) ───────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        'group relative flex flex-col rounded-2xl border bg-card overflow-hidden',
        'transition-all duration-300 ring-1 ring-transparent',
        HOVER_RING[color],
        'hover:shadow-xl hover:-translate-y-0.5',
      )}
    >
      {/* Admin Overlay — يظهر عند hover */}
      <AdminOverlayControls course={course} />

      {/* ── Thumbnail (مطابق للـ frontend) ── */}
      <div className='relative aspect-video overflow-hidden bg-muted'>
        <CourseThumbnail
          course={course}
          className='transition-transform duration-500 group-hover:scale-105'
        />

        {comingSoon && (
          <div className='absolute inset-0 z-0 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none'>
            <span className='flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/80'>
              <Sparkles className='h-3 w-3' /> Coming Soon
            </span>
          </div>
        )}

        {/* State badge — top left */}
        <div className='absolute top-2 start-2 z-20 pointer-events-none'>
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border',
            course.state === 'PUBLISHED' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' :
            course.state === 'COMING_SOON' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' :
            'bg-zinc-500/20 border-zinc-500/40 text-zinc-300'
          )}>
            <span className={cn('h-1.5 w-1.5 rounded-full', stateDot)} />
            {course.state === 'PUBLISHED' ? 'Published' : course.state === 'COMING_SOON' ? 'Coming Soon' : 'Draft'}
          </span>
        </div>
      </div>

      {/* ── Body (مطابق للـ frontend) ── */}
      <div className='flex flex-col flex-1 p-4 gap-3'>
        {/* Title — inline editable */}
        <div className='flex items-start justify-between gap-2'>
          <div className='flex-1 min-w-0'>
            <InlineEditable
              value={course.title}
              onSave={(val) => updateMutation.mutateAsync({ title: val })}
              className='text-sm font-bold text-foreground leading-snug'
            />
            {course.ar_title && (
              <div className='mt-0.5' dir='rtl'>
                <InlineEditable
                  value={course.ar_title}
                  onSave={(val) => updateMutation.mutateAsync({ ar_title: val } as any)}
                  className='text-xs text-muted-foreground/70'
                />
              </div>
            )}
          </div>
          {course.category && (
            <span className='text-[11px] text-muted-foreground shrink-0'>
              {course.category.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {/* Description — inline editable */}
        {course.description !== undefined && (
          <InlineEditable
            value={course.description ?? ''}
            onSave={(val) => updateMutation.mutateAsync({ description: val })}
            as='textarea'
            className='text-xs text-muted-foreground leading-relaxed'
            placeholder='Add description...'
          />
        )}

        {/* Badges (مطابق للـ frontend) */}
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

        {/* Stats row */}
        <div className='mt-auto flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/30'>
          <span className='flex items-center gap-1'><Users className='h-3 w-3' />{course.enrollmentCount ?? 0} enrolled</span>
          {course.estimatedHours != null && (
            <span className='flex items-center gap-1 ml-auto'><Clock className='h-3 w-3' />{course.estimatedHours}h</span>
          )}
          {(course.labSlugs?.length ?? 0) > 0 && (
            <span className='flex items-center gap-1'><FlaskConical className='h-3 w-3' />{course.labSlugs.length} labs</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
