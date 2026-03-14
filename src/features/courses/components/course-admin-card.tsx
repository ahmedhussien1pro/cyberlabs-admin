// src/features/courses/components/course-admin-card.tsx
// Card design mirrors the main cyberlabs-frontend course card:
// thumbnail → title (active lang) → description (active lang) → 4 info badges
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  BookOpen, FlaskConical, BookMarked, BarChart3,
  Unlock, Crown, Gem, Sparkles, Star,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AdminOverlayControls } from './admin-overlay-controls';
import { adminCoursesApi } from '../services/admin-courses.api';
import { FALLBACK_BG, FALLBACK_TEXT, HOVER_RING, ACCESS_BADGE, STATE_DOT } from '../constants/course-colors';
import type { AdminCourse } from '../types/admin-course.types';

const ACCESS_ICON: Record<string, React.ElementType> = { FREE: Unlock, PRO: Crown, PREMIUM: Gem };
const CONTENT_ICON: Record<string, { Icon: React.ElementType; labelKey: string }> = {
  PRACTICAL:   { Icon: FlaskConical, labelKey: 'contentType.PRACTICAL'   },
  THEORETICAL: { Icon: BookMarked,   labelKey: 'contentType.THEORETICAL' },
  MIXED:       { Icon: BookOpen,     labelKey: 'contentType.MIXED'       },
};

function CourseThumbnail({ course, activeTitle, className }: {
  course: AdminCourse; activeTitle: string; className?: string;
}) {
  const img   = course.image ?? course.thumbnail;
  const color = (course.color ?? 'blue').toLowerCase();
  if (img) return (
    <img src={img} alt={activeTitle} loading='lazy'
      className={cn('w-full h-full object-cover', className)} />
  );
  return (
    <div className={cn(
      'w-full h-full flex items-center justify-center bg-gradient-to-br border',
      FALLBACK_BG[color] ?? 'from-zinc-900 to-zinc-800 border-zinc-700',
    )}>
      <p className={cn('font-black text-center px-3 leading-tight text-lg',
        FALLBACK_TEXT[color] ?? 'text-zinc-400')}>
        {activeTitle}
      </p>
    </div>
  );
}

interface Props { course: AdminCourse; index?: number; view?: 'grid' | 'list'; }

export function CourseAdminCard({ course, index = 0, view = 'grid' }: Props) {
  const { t, i18n } = useTranslation('courses');
  const queryClient  = useQueryClient();
  const isAr = i18n.language === 'ar';

  // Active-language resolution — exactly like frontend
  const activeTitle = isAr
    ? (course.ar_title  || course.title)
    : course.title;
  const activeDesc  = isAr
    ? (course.ar_description || course.description || null)
    : (course.description || null);

  const color      = (course.color ?? 'blue').toLowerCase();
  const comingSoon = course.state === 'COMING_SOON';
  const ct         = CONTENT_ICON[course.contentType ?? 'MIXED'];
  const AccessIcon = ACCESS_ICON[course.access ?? 'FREE'] ?? Unlock;
  const stateDot   = STATE_DOT[course.state] ?? 'bg-zinc-400';
  const diff = course.difficulty
    ? t(`difficulty.${course.difficulty}`,
        course.difficulty.charAt(0) + course.difficulty.slice(1).toLowerCase())
    : null;

  const updateMutation = useMutation({
    mutationFn: (data: Partial<AdminCourse>) => adminCoursesApi.update(course.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] }),
    onError:   () => toast.error('Failed to save changes'),
  });
  void updateMutation; // suppress unused warning — keep for future inline edits

  // ── List view (compact) ────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className='group relative flex items-center gap-4 rounded-lg border border-border/50 bg-card px-4 py-3 hover:border-border transition-colors overflow-hidden'
      >
        <AdminOverlayControls course={course} />
        <div className={cn('h-2 w-2 shrink-0 rounded-full', stateDot)} />
        <div className='relative w-16 h-10 shrink-0 overflow-hidden rounded bg-muted'>
          <CourseThumbnail course={course} activeTitle={activeTitle} />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='font-semibold text-sm truncate'>{activeTitle}</p>
          {activeDesc && (
            <p className='truncate text-xs text-muted-foreground/60 mt-0.5'>{activeDesc}</p>
          )}
        </div>
        <div className='hidden sm:flex items-center gap-2'>
          {diff && <Badge variant='outline' className='text-[10px] gap-1'><BarChart3 className='h-3 w-3'/>{diff}</Badge>}
          <Badge variant='outline' className={cn('text-[10px]', ACCESS_BADGE[course.access])}>
            <AccessIcon className='h-3 w-3 me-1' />{t(`access.${course.access}`, course.access)}
          </Badge>
          {(course.totalTopics ?? 0) > 0 && (
            <Badge variant='outline' className='text-[10px] gap-1 text-primary border-primary/30'>
              <BookOpen className='h-3 w-3'/>{course.totalTopics}
            </Badge>
          )}
          {ct && <Badge variant='outline' className='text-[10px] gap-1'><ct.Icon className='h-3 w-3'/>{t(ct.labelKey)}</Badge>}
        </div>
      </div>
    );
  }

  // ── Grid view ────────────────────────────────────────────────────────
  return (
    <motion.div
      dir={isAr ? 'rtl' : 'ltr'}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
      className={cn(
        'group relative flex flex-col rounded-2xl border bg-card overflow-hidden',
        'transition-all duration-300 ring-1 ring-transparent',
        HOVER_RING[color] ?? 'hover:ring-primary/20',
        'hover:shadow-xl hover:-translate-y-0.5',
      )}
    >
      <AdminOverlayControls course={course} />

      {/* ── Thumbnail ── */}
      <div className='relative aspect-video overflow-hidden bg-muted'>
        <CourseThumbnail
          course={course} activeTitle={activeTitle}
          className='transition-transform duration-500 group-hover:scale-105'
        />
        {comingSoon && (
          <div className='absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none'>
            <span className='flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/80'>
              <Sparkles className='h-3 w-3' /> {t('state.COMING_SOON')}
            </span>
          </div>
        )}
        {/* State badge — top-left */}
        <div className='absolute top-2 start-2 z-20 pointer-events-none'>
          <span className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border',
            course.state === 'PUBLISHED'   ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
            : course.state === 'COMING_SOON' ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
            : 'bg-zinc-500/20 border-zinc-500/40 text-zinc-300',
          )}>
            <span className={cn('h-1.5 w-1.5 rounded-full', stateDot)} />
            {t(`state.${course.state}`, course.state)}
          </span>
        </div>
        {/* Featured — top-right */}
        {course.isFeatured && (
          <div className='absolute top-2 end-2 z-20 pointer-events-none'>
            <span className='inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-yellow-500/20 border-yellow-500/40 text-yellow-300'>
              <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
            </span>
          </div>
        )}
        {/* NEW — bottom-right */}
        {course.isNew && (
          <div className='absolute bottom-2 end-2 z-20 pointer-events-none'>
            <span className='inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold bg-primary/80 text-white border border-primary/40'>NEW</span>
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div className='flex flex-col flex-1 p-4 gap-2'>

        {/* Title — active language */}
        <h3 className='text-sm font-bold text-foreground leading-snug line-clamp-2'>
          {activeTitle}
        </h3>

        {/* Description — active language, max 2 lines */}
        {activeDesc ? (
          <p className='text-xs text-muted-foreground leading-relaxed line-clamp-2'>
            {activeDesc}
          </p>
        ) : (
          <p className='text-xs text-muted-foreground/30 italic'>
            {t('card.noDescription', 'No description…')}
          </p>
        )}

        {/* ── 4 info badges — mirrors frontend exactly ── */}
        <div className='flex flex-wrap items-center gap-1.5 mt-auto pt-3 border-t border-border/30'>
          {/* Content type */}
          {ct && (
            <Badge variant='outline' className='gap-1 text-[10px] text-muted-foreground border-border/40'>
              <ct.Icon className='h-3 w-3' />{t(ct.labelKey)}
            </Badge>
          )}
          {/* Topics */}
          {(course.totalTopics ?? 0) > 0 && (
            <Badge variant='outline' className='gap-1 text-[10px] font-semibold text-primary border-primary/30 bg-primary/5'>
              <BookOpen className='h-3 w-3' />
              {t('card.topicsCount', { count: course.totalTopics }, `Topics ${course.totalTopics}`)}
            </Badge>
          )}
          {/* Access */}
          {course.access && (
            <Badge variant='outline' className={cn('gap-1 text-[10px] font-bold', ACCESS_BADGE[course.access])}>
              <AccessIcon className='h-3 w-3' />{t(`access.${course.access}`, course.access)}
            </Badge>
          )}
          {/* Difficulty */}
          {diff && (
            <Badge variant='outline' className='gap-1 text-[10px] font-semibold border-border/60 bg-muted/40'>
              <BarChart3 className='h-3 w-3' /> {diff}
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
}
