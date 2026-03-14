// LiveCardPreview.tsx — mirrors CourseAdminCard grid-view exactly
import React from 'react';
import {
  BookOpen, FlaskConical, BookMarked,
  BarChart3, Unlock, Crown, Gem, Sparkles, Star,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FALLBACK_BG, FALLBACK_TEXT, ACCESS_BADGE } from '../../../constants/course-colors';
import type { AdminCourse } from '../../../types/admin-course.types';

export interface CardFormState {
  title:          string;
  ar_title:       string;
  description:    string;
  ar_description: string;
  color:          string;
  access:         string;
  difficulty:     string;
  category:       string;
  contentType:    string;
  estimatedHours: string;
  isFeatured:     boolean;
  isNew:          boolean;
}

const ACCESS_ICON: Record<string, React.ElementType> = {
  FREE: Unlock, PRO: Crown, PREMIUM: Gem,
};
const CONTENT_ICON: Record<string, { Icon: React.ElementType; en: string; ar: string }> = {
  PRACTICAL:   { Icon: FlaskConical, en: 'Practical', ar: 'تطبيقي' },
  THEORETICAL: { Icon: BookMarked,   en: 'Theory',    ar: 'نظري' },
  MIXED:       { Icon: BookOpen,     en: 'Mixed',     ar: 'مختلط' },
};
const DIFF_AR: Record<string, string> = {
  BEGINNER: 'مبتدئ', INTERMEDIATE: 'متوسط', ADVANCED: 'متقدم', EXPERT: 'خبير',
};
const ACCESS_AR: Record<string, string> = {
  FREE: 'مجاني', PRO: 'برو', PREMIUM: 'مميز',
};
const STATE_LABEL: Record<string, { en: string; ar: string; dot: string; badge: string }> = {
  PUBLISHED:   { en: 'Published', ar: 'منشور',  dot: 'bg-emerald-400', badge: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' },
  DRAFT:       { en: 'Draft',     ar: 'مسودة',  dot: 'bg-zinc-400',    badge: 'bg-zinc-500/20 border-zinc-500/40 text-zinc-300' },
  COMING_SOON: { en: 'Coming Soon', ar: 'قريباً', dot: 'bg-blue-400',  badge: 'bg-blue-500/20 border-blue-500/40 text-blue-300' },
};

export function LiveCardPreview({
  form, course, isAr,
}: {
  form: CardFormState; course: AdminCourse; isAr: boolean;
}) {
  const color      = (form.color ?? 'BLUE').toLowerCase();
  const comingSoon = course.state === 'COMING_SOON';
  const ct         = CONTENT_ICON[form.contentType ?? 'MIXED'];
  const AccessIcon = ACCESS_ICON[form.access ?? 'FREE'] ?? Unlock;
  const img        = course.image ?? course.thumbnail;
  const state      = STATE_LABEL[course.state ?? 'DRAFT'] ?? STATE_LABEL.DRAFT;

  const activeTitle = isAr ? form.ar_title || form.title : form.title;
  const activeDesc  = isAr ? form.ar_description || form.description : form.description;

  const diffLabel = form.difficulty
    ? isAr
      ? DIFF_AR[form.difficulty] ?? form.difficulty
      : form.difficulty.charAt(0) + form.difficulty.slice(1).toLowerCase()
    : null;
  const accessLabel = form.access
    ? isAr
      ? ACCESS_AR[form.access] ?? form.access
      : form.access.charAt(0) + form.access.slice(1).toLowerCase()
    : null;
  const ctLabel     = ct ? (isAr ? ct.ar : ct.en) : null;
  const topicsLabel = isAr ? 'موضوعات' : 'Topics';

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className='group relative flex flex-col rounded-2xl border bg-card overflow-hidden w-64 mx-auto shadow-lg'
    >
      {/* Thumbnail */}
      <div className='relative aspect-video overflow-hidden bg-muted'>
        {img ? (
          <img src={img} alt={activeTitle} className='w-full h-full object-cover' />
        ) : (
          <div className={cn(
            'w-full h-full flex items-center justify-center bg-gradient-to-br border',
            FALLBACK_BG[color] ?? 'from-zinc-900 to-zinc-800 border-zinc-700',
          )}>
            <p className={cn('font-black text-center px-3 leading-tight text-lg',
              FALLBACK_TEXT[color] ?? 'text-zinc-400')}>
              {activeTitle || 'Course'}
            </p>
          </div>
        )}

        {comingSoon && (
          <div className='absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm'>
            <span className='flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/80'>
              <Sparkles className='h-3 w-3' /> {isAr ? 'قريباً' : 'Coming Soon'}
            </span>
          </div>
        )}

        {/* State badge */}
        <div className='absolute top-2 start-2 z-20'>
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border', state.badge)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', state.dot)} />
            {isAr ? state.ar : state.en}
          </span>
        </div>

        {form.isFeatured && (
          <div className='absolute top-2 end-2 z-20'>
            <span className='inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-yellow-500/20 border-yellow-500/40 text-yellow-300'>
              <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
            </span>
          </div>
        )}

        {form.isNew && (
          <div className='absolute bottom-2 end-2 z-20'>
            <span className='inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold bg-primary/80 text-white border border-primary/40'>
              NEW
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className='flex flex-col flex-1 p-4 gap-2'>
        <h3 className='text-sm font-bold text-foreground leading-snug line-clamp-2'>
          {activeTitle || <span className='italic text-muted-foreground/40'>{isAr ? 'عنوان…' : 'Title…'}</span>}
        </h3>
        {activeDesc
          ? <p className='text-xs text-muted-foreground leading-relaxed line-clamp-2'>{activeDesc}</p>
          : <p className='text-xs text-muted-foreground/30 italic'>{isAr ? 'لا يوجد وصف…' : 'No description…'}</p>
        }
        <div className='flex flex-wrap items-center gap-1.5 mt-auto pt-3 border-t border-border/30'>
          {diffLabel && (
            <Badge variant='outline' className='gap-1 text-[10px] font-semibold border-border/60 bg-muted/40'>
              <BarChart3 className='h-3 w-3' /> {diffLabel}
            </Badge>
          )}
          {accessLabel && (
            <Badge variant='outline' className={cn('gap-1 text-[10px] font-bold', ACCESS_BADGE[form.access] ?? '')}>
              <AccessIcon className='h-3 w-3' /> {accessLabel}
            </Badge>
          )}
          {(course.totalTopics ?? 0) > 0 && (
            <Badge variant='outline' className='gap-1 text-[10px] font-semibold text-primary border-primary/30 bg-primary/5'>
              <BookOpen className='h-3 w-3' /> {course.totalTopics} {topicsLabel}
            </Badge>
          )}
          {ct && (
            <Badge variant='outline' className='gap-1 text-[10px] text-muted-foreground border-border/40'>
              <ct.Icon className='h-3 w-3' /> {ctLabel}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
