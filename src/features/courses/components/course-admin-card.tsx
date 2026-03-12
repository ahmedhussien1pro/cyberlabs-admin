import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
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
  Users,
  Star,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AdminOverlayControls } from './admin-overlay-controls';
import { InlineEditable } from './inline-editable';
import { adminCoursesApi } from '../services/admin-courses.api';
import {
  FALLBACK_BG,
  FALLBACK_TEXT,
  HOVER_RING,
  ACCESS_BADGE,
  STATE_DOT,
} from '../constants/course-colors';
import type { AdminCourse } from '../types/admin-course.types';

const ACCESS_ICON: Record<string, React.ElementType> = {
  FREE: Unlock,
  PRO: Crown,
  PREMIUM: Gem,
};
const CONTENT_ICON: Record<
  string,
  { Icon: React.ElementType; labelKey: string }
> = {
  PRACTICAL: { Icon: FlaskConical, labelKey: 'contentType.PRACTICAL' },
  THEORETICAL: { Icon: BookMarked, labelKey: 'contentType.THEORETICAL' },
  MIXED: { Icon: BookOpen, labelKey: 'contentType.MIXED' },
};

function CourseThumbnail({
  course,
  className,
}: {
  course: AdminCourse;
  className?: string;
}) {
  const img = course.image ?? course.thumbnail;
  const color = (course.color ?? 'BLUE').toLowerCase();
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
      )}>
      <p
        className={cn(
          'font-black text-center px-3 leading-tight text-lg',
          FALLBACK_TEXT[color] ?? 'text-zinc-400',
        )}>
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
  const { t, i18n } = useTranslation('courses');
  const queryClient = useQueryClient();
  const lang = i18n.language === 'ar' ? 'ar' : 'en';

  const title =
    lang === 'ar' && course.ar_title ? course.ar_title : course.title;
  const description =
    lang === 'ar' && course.ar_description
      ? course.ar_description
      : course.description;
  const category =
    lang === 'ar' && course.category ? course.category : course.category;

  const color = (course.color ?? 'BLUE').toLowerCase();
  const comingSoon = course.state === 'COMING_SOON';
  const ct = CONTENT_ICON[course.contentType ?? 'MIXED'];
  const AccessIcon = ACCESS_ICON[course.access ?? 'FREE'] ?? Unlock;
  const stateDot = STATE_DOT[course.state] ?? 'bg-zinc-400';

  const diffRaw =
    lang === 'ar'
      ? (course.difficulty ?? course.difficulty)
      : course.difficulty;
  const diff = diffRaw
    ? t(
        `difficulty.${diffRaw}`,
        diffRaw.charAt(0) + diffRaw.slice(1).toLowerCase(),
      )
    : null;

  const updateMutation = useMutation({
    mutationFn: (data: Partial<AdminCourse>) =>
      adminCoursesApi.update(course.id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] }),
    onError: () => toast.error('Failed to save changes'),
  });

  if (view === 'list') {
    return (
      <div className='group relative flex items-center gap-4 rounded-lg border border-border/50 bg-card px-4 py-3 hover:border-border transition-colors'>
        <AdminOverlayControls course={course} />
        <div className={cn('h-2 w-2 shrink-0 rounded-full', stateDot)} />
        <div className='relative w-16 h-10 shrink-0 overflow-hidden rounded bg-muted'>
          <CourseThumbnail course={course} />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='font-medium text-sm truncate'>{title}</p>

          <p className='truncate text-xs text-muted-foreground' dir='rtl'>
            {description}
          </p>
        </div>
        <div className='hidden sm:flex items-center gap-3 text-xs text-muted-foreground'>
          <span className='flex items-center gap-1'>
            <Users className='h-3 w-3' aria-hidden='true' />
            {course.enrollmentCount ?? 0}
          </span>
          <span className='flex items-center gap-1'>
            <BookOpen className='h-3 w-3' aria-hidden='true' />
            {course.totalTopics ?? 0}
          </span>
        </div>
        <div className='hidden md:flex items-center gap-2'>
          <Badge
            variant='outline'
            className={cn('text-[10px]', ACCESS_BADGE[course.access])}>
            <AccessIcon className='h-3 w-3 me-1' aria-hidden='true' />
            {t(`access.${course.access}`, course.access)}
          </Badge>
          <Badge variant='outline' className='text-[10px]'>
            {t(`state.${course.state}`, course.state)}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
      className={cn(
        'group relative flex flex-col rounded-2xl border bg-card overflow-hidden',
        'transition-all duration-300 ring-1 ring-transparent',
        HOVER_RING[color] ?? 'hover:ring-primary/20',
        'hover:shadow-xl hover:-translate-y-0.5',
      )}>
      <AdminOverlayControls course={course} />

      {/* Thumbnail */}
      <div className='relative aspect-video overflow-hidden bg-muted'>
        <CourseThumbnail
          course={course}
          className='transition-transform duration-500 group-hover:scale-105'
        />

        {/* Coming Soon overlay */}
        {comingSoon && (
          <div className='absolute inset-0 z-0 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none'>
            <span className='flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/80'>
              <Sparkles className='h-3 w-3' aria-hidden='true' />{' '}
              {t('state.COMING_SOON')}
            </span>
          </div>
        )}

        {/* State badge */}
        <div className='absolute top-2 start-2 z-20 pointer-events-none'>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border',
              course.state === 'PUBLISHED'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : course.state === 'COMING_SOON'
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                  : 'bg-zinc-500/20 border-zinc-500/40 text-zinc-300',
            )}>
            <span
              className={cn('h-1.5 w-1.5 rounded-full', stateDot)}
              aria-hidden='true'
            />
            {t(`state.${course.state}`, course.state)}
          </span>
        </div>

        {/* Featured badge */}
        {course.isFeatured && (
          <div className='absolute top-2 end-2 z-20 pointer-events-none'>
            <span className='inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-yellow-500/20 border-yellow-500/40 text-yellow-300'>
              <Star
                className='h-3 w-3 fill-yellow-400 text-yellow-400'
                aria-hidden='true'
              />
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className='flex flex-col flex-1 p-4 gap-3'>
        {/* Title + Category */}
        <div className='flex items-start justify-between gap-2'>
          <div className='flex-1 min-w-0'>
            <InlineEditable
              value={course.title}
              onSave={(val) => void updateMutation.mutateAsync({ title: val })}
              className='text-sm font-bold text-foreground leading-snug'
            />
            {course.ar_description && (
              <div className='mt-0.5' dir='rtl'>
                <InlineEditable
                  value={course.ar_description}
                  onSave={(val) =>
                    void updateMutation.mutateAsync({ ar_title: val })
                  }
                  className='text-xs text-muted-foreground/70'
                />
              </div>
            )}
          </div>
          {category && (
            <span className='text-[11px] text-muted-foreground shrink-0 text-end max-w-[90px] leading-tight'>
              {category.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {/* Description */}
        {(description || course.description) && (
          <InlineEditable
            value={description ?? course.description ?? ''}
            onSave={(val) =>
              void updateMutation.mutateAsync({ description: val })
            }
            as='textarea'
            className='text-xs text-muted-foreground leading-relaxed line-clamp-2'
            placeholder={t('card.noDescription')}
          />
        )}

        {/* Badges */}
        <div className='flex flex-wrap items-center gap-1.5'>
          {diff && (
            <Badge
              variant='outline'
              className='gap-1 text-[10px] font-semibold border-border/60 bg-muted/40'>
              <BarChart3 className='h-3 w-3' aria-hidden='true' /> {diff}
            </Badge>
          )}
          {course.access && (
            <Badge
              variant='outline'
              className={cn(
                'gap-1 text-[10px] font-bold',
                ACCESS_BADGE[course.access],
              )}>
              <AccessIcon className='h-3 w-3' aria-hidden='true' />
              {t(`access.${course.access}`, course.access)}
            </Badge>
          )}
          {(course.totalTopics ?? 0) > 0 && (
            <Badge
              variant='outline'
              className='gap-1 text-[10px] font-semibold text-primary border-primary/30 bg-primary/5'>
              <Clock className='h-3 w-3' aria-hidden='true' />
              {course.totalTopics} {t('card.topics')}
            </Badge>
          )}
          {ct && (
            <Badge
              variant='outline'
              className='gap-1 text-[10px] text-muted-foreground border-border/40'>
              <ct.Icon className='h-3 w-3' aria-hidden='true' />
              {t(ct.labelKey)}
            </Badge>
          )}
        </div>

        {/* Footer: enrolled + hours + labs */}
        <div className='mt-auto flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/30'>
          <span className='flex items-center gap-1'>
            <Users className='h-3 w-3' aria-hidden='true' />
            {course.enrollmentCount ?? 0} {t('card.enrolled')}
          </span>
          {(course.estimatedHours ?? 0) > 0 && (
            <span className='flex items-center gap-1'>
              <Clock className='h-3 w-3' aria-hidden='true' />
              {course.estimatedHours}
              {t('card.hours')}
            </span>
          )}
          {(course.labSlugs?.length ?? 0) > 0 && (
            <span className='flex items-center gap-1 ms-auto'>
              <FlaskConical className='h-3 w-3' aria-hidden='true' />
              {course.labSlugs.length} {t('card.labs')}
            </span>
          )}
          {course.isNew && (
            <span className='ms-auto inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold bg-primary/10 text-primary border border-primary/20'>
              NEW
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
