// src/features/courses/components/course-admin-card.tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  BookOpen, FlaskConical, BookMarked, BarChart3, Clock,
  Unlock, Crown, Gem, Sparkles, Users, Star, PenLine,
  Tag, Award, Globe2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AdminOverlayControls } from './admin-overlay-controls';
import { InlineEditable } from './inline-editable';
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

  // ── Active-language resolution ──────────────────────────────────────
  // Primary: the language currently selected on the platform
  // Secondary (subtitle): the other language — shown smaller & muted
  const primaryTitle = isAr
    ? (course.ar_title || course.title)          // AR preferred, fallback EN
    : course.title;                               // EN always
  const secondaryTitle = isAr
    ? (course.ar_title ? course.title : null)     // show EN only if AR exists
    : (course.ar_title ?? null);                  // show AR if available

  const primaryDesc = isAr
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

  // ── List view ────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className='group relative flex items-center gap-4 rounded-lg border border-border/50 bg-card px-4 py-3 hover:border-border transition-colors overflow-hidden'
      >
        <AdminOverlayControls course={course} />
        <div className={cn('h-2 w-2 shrink-0 rounded-full', stateDot)} />
        <div className='relative w-16 h-10 shrink-0 overflow-hidden rounded bg-muted'>
          <CourseThumbnail course={course} activeTitle={primaryTitle} />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='font-medium text-sm truncate'>{primaryTitle}</p>
          {secondaryTitle && (
            <p className='truncate text-xs text-muted-foreground/60' dir={isAr ? 'ltr' : 'rtl'}>
              {secondaryTitle}
            </p>
          )}
          {primaryDesc && (
            <p className='truncate text-xs text-muted-foreground/50 mt-0.5'>{primaryDesc}</p>
          )}
        </div>
        <div className='hidden sm:flex items-center gap-3 text-xs text-muted-foreground'>
          <span className='flex items-center gap-1'><Users className='h-3 w-3' />{course.enrollmentCount ?? 0}</span>
          <span className='flex items-center gap-1'><BookOpen className='h-3 w-3' />{course.totalTopics ?? 0}</span>
          {(course.labSlugs?.length ?? 0) > 0 && (
            <span className='flex items-center gap-1'><FlaskConical className='h-3 w-3' />{course.labSlugs.length}</span>
          )}
        </div>
        <div className='hidden md:flex items-center gap-2'>
          <Badge variant='outline' className={cn('text-[10px]', ACCESS_BADGE[course.access])}>
            <AccessIcon className='h-3 w-3 me-1' />{t(`access.${course.access}`, course.access)}
          </Badge>
          <Badge variant='outline' className='text-[10px]'>{t(`state.${course.state}`, course.state)}</Badge>
          {diff && <Badge variant='outline' className='text-[10px]'>{diff}</Badge>}
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

      {/* Thumbnail */}
      <div className='relative aspect-video overflow-hidden bg-muted'>
        <CourseThumbnail
          course={course} activeTitle={primaryTitle}
          className='transition-transform duration-500 group-hover:scale-105'
        />
        {comingSoon && (
          <div className='absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none'>
            <span className='flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/80'>
              <Sparkles className='h-3 w-3' /> {t('state.COMING_SOON')}
            </span>
          </div>
        )}
        {/* State badge */}
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
        {/* Featured */}
        {course.isFeatured && (
          <div className='absolute top-2 end-2 z-20 pointer-events-none'>
            <span className='inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-yellow-500/20 border-yellow-500/40 text-yellow-300'>
              <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
            </span>
          </div>
        )}
        {/* NEW */}
        {course.isNew && (
          <div className='absolute bottom-2 end-2 z-20 pointer-events-none'>
            <span className='inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold bg-primary/80 text-white border border-primary/40'>NEW</span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className='flex flex-col flex-1 p-4 gap-2'>

        {/* ── Title ── */}
        <div className='flex items-start justify-between gap-2'>
          <div className='flex-1 min-w-0'>
            {/* Primary title — editable, active language */}
            <InlineEditable
              value={primaryTitle}
              onSave={(val) =>
                void updateMutation.mutateAsync(
                  isAr ? { ar_title: val || undefined } : { title: val }
                )
              }
              className='text-sm font-bold text-foreground leading-snug'
            />
            {/* Secondary title — read-only, other language */}
            {secondaryTitle ? (
              <p
                className='mt-0.5 text-xs text-muted-foreground/55 truncate leading-snug'
                dir={isAr ? 'ltr' : 'rtl'}
              >
                {secondaryTitle}
              </p>
            ) : !isAr ? (
              // Only prompt for AR title when viewing in EN
              <p className='mt-0.5 text-xs text-muted-foreground/30 italic flex items-center gap-1'>
                <PenLine className='h-3 w-3' /> {t('card.noArTitle', 'Add Arabic title…')}
              </p>
            ) : null}
          </div>
          {/* Category */}
          {course.category && (
            <span className='shrink-0 text-end text-[10px] text-muted-foreground max-w-[80px] leading-tight'>
              {course.category.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {/* ── Description — active lang only ── */}
        <InlineEditable
          value={primaryDesc ?? ''}
          onSave={(val) =>
            void updateMutation.mutateAsync(
              isAr ? { ar_description: val || null } : { description: val || null }
            )
          }
          as='textarea'
          className={cn(
            'text-xs leading-relaxed line-clamp-2',
            primaryDesc ? 'text-muted-foreground' : 'text-muted-foreground/30 italic',
          )}
          placeholder={t('card.noDescription', 'Add description…')}
        />

        {/* ── Badges ── */}
        <div className='flex flex-wrap items-center gap-1.5 mt-1'>
          {diff && (
            <Badge variant='outline' className='gap-1 text-[10px] font-semibold border-border/60 bg-muted/40'>
              <BarChart3 className='h-3 w-3' /> {diff}
            </Badge>
          )}
          {course.access && (
            <Badge variant='outline' className={cn('gap-1 text-[10px] font-bold', ACCESS_BADGE[course.access])}>
              <AccessIcon className='h-3 w-3' />{t(`access.${course.access}`, course.access)}
            </Badge>
          )}
          {(course.totalTopics ?? 0) > 0 && (
            <Badge variant='outline' className='gap-1 text-[10px] font-semibold text-primary border-primary/30 bg-primary/5'>
              <BookOpen className='h-3 w-3' />{course.totalTopics} {t('card.topics')}
            </Badge>
          )}
          {ct && (
            <Badge variant='outline' className='gap-1 text-[10px] text-muted-foreground border-border/40'>
              <ct.Icon className='h-3 w-3' />{t(ct.labelKey)}
            </Badge>
          )}
          {(course.labSlugs?.length ?? 0) > 0 && (
            <Badge variant='outline' className='gap-1 text-[10px] text-cyan-400 border-cyan-500/30 bg-cyan-500/5'>
              <FlaskConical className='h-3 w-3' />{course.labSlugs.length} {t('card.labs')}
            </Badge>
          )}
        </div>

        {/* ── Skills (active lang) ── */}
        {(() => {
          const skills = isAr && course.ar_skills?.length ? course.ar_skills : course.skills;
          return skills?.length ? (
            <div className='flex flex-wrap gap-1 mt-0.5'>
              {skills.slice(0, 3).map((s) => (
                <span key={s} className='inline-flex items-center gap-0.5 rounded-full bg-muted/60 border border-border/40 px-2 py-0.5 text-[10px] text-muted-foreground'>
                  <Award className='h-2.5 w-2.5 shrink-0' />{s}
                </span>
              ))}
              {skills.length > 3 && (
                <span className='inline-flex items-center rounded-full bg-muted/60 border border-border/40 px-2 py-0.5 text-[10px] text-muted-foreground'>+{skills.length - 3}</span>
              )}
            </div>
          ) : null;
        })()}

        {/* ── Tags ── */}
        {course.tags?.length ? (
          <div className='flex flex-wrap gap-1'>
            {course.tags.slice(0, 4).map((tag) => (
              <span key={tag} className='inline-flex items-center gap-0.5 rounded-sm bg-primary/5 border border-primary/20 px-1.5 py-0.5 text-[9px] text-primary/70'>
                <Tag className='h-2.5 w-2.5 shrink-0' />{tag}
              </span>
            ))}
            {course.tags.length > 4 && (
              <span className='rounded-sm bg-primary/5 border border-primary/20 px-1.5 py-0.5 text-[9px] text-primary/70'>+{course.tags.length - 4}</span>
            )}
          </div>
        ) : null}

        {/* ── Rating ── */}
        {(course.averageRating ?? 0) > 0 && (
          <div className='flex items-center gap-1 text-[11px] text-amber-400'>
            <Star className='h-3 w-3 fill-amber-400' />
            <span className='font-semibold'>{course.averageRating.toFixed(1)}</span>
            <span className='text-muted-foreground/60'>({course.reviewCount ?? 0})</span>
          </div>
        )}

        {/* ── Footer ── */}
        <div className='mt-auto flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/30'>
          <span className='flex items-center gap-1'>
            <Users className='h-3 w-3' />{course.enrollmentCount ?? 0} {t('card.enrolled')}
          </span>
          {(course.estimatedHours ?? 0) > 0 && (
            <span className='flex items-center gap-1'>
              <Clock className='h-3 w-3' />{course.estimatedHours}{t('card.hours')}
            </span>
          )}
          {course.slug && (
            <span className='flex items-center gap-1 ms-auto text-muted-foreground/40 text-[10px] truncate max-w-[110px]'>
              <Globe2 className='h-2.5 w-2.5 shrink-0' />{course.slug}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
