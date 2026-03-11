// CourseCard — نفس SharedCourseCard من الـ frontend + AdminOverlay فوقه
import {
  BookOpen,
  FlaskConical,
  BookMarked,
  BarChart3,
  Clock,
  Unlock,
  Crown,
  Gem,
  Globe,
  EyeOff,
  Sparkles,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AdminOverlay } from './admin-overlay';
import type { AdminCourse } from '../types/admin-course.types';

const COLOR = (c: string) => c.toLowerCase();

const FALLBACK_BG: Record<string, string> = {
  emerald: 'from-emerald-950 to-emerald-900 border-emerald-800/50',
  blue: 'from-blue-950    to-blue-900    border-blue-800/50',
  violet: 'from-violet-950  to-violet-900  border-violet-800/50',
  orange: 'from-orange-950  to-orange-900  border-orange-800/50',
  rose: 'from-rose-950    to-rose-900    border-rose-800/50',
  cyan: 'from-cyan-950    to-cyan-900    border-cyan-800/50',
};
const FALLBACK_TEXT: Record<string, string> = {
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  violet: 'text-violet-400',
  orange: 'text-orange-400',
  rose: 'text-rose-400',
  cyan: 'text-cyan-400',
};
const HOVER_RING: Record<string, string> = {
  emerald: 'hover:ring-emerald-500/30',
  blue: 'hover:ring-blue-500/30',
  violet: 'hover:ring-violet-500/30',
  orange: 'hover:ring-orange-500/30',
  rose: 'hover:ring-rose-500/30',
  cyan: 'hover:ring-cyan-500/30',
};
const ACCESS_BADGE: Record<string, string> = {
  FREE: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  PRO: 'border-blue-500/40    text-blue-400    bg-blue-500/10',
  PREMIUM: 'border-violet-500/40  text-violet-400  bg-violet-500/10',
};
const ACCESS_ICON: Record<string, React.ElementType> = {
  FREE: Unlock,
  PRO: Crown,
  PREMIUM: Gem,
};
const CONTENT_ICON: Record<string, { Icon: React.ElementType; label: string }> = {
  PRACTICAL:   { Icon: FlaskConical, label: 'Practical' },
  THEORETICAL: { Icon: BookMarked,   label: 'Theory'    },
  MIXED:       { Icon: BookOpen,     label: 'Mixed'     },
};

function StateBadge({ state }: { state: AdminCourse['state'] }) {
  if (state === 'PUBLISHED')
    return (
      <span className='flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold text-white'>
        <Globe className='h-2.5 w-2.5' /> Published
      </span>
    );
  if (state === 'COMING_SOON')
    return (
      <span className='flex items-center gap-1 rounded-full bg-blue-500/90 px-2 py-0.5 text-[10px] font-bold text-white'>
        <Sparkles className='h-2.5 w-2.5' /> Coming Soon
      </span>
    );
  return (
    <span className='flex items-center gap-1 rounded-full bg-zinc-600/90 px-2 py-0.5 text-[10px] font-bold text-white'>
      <EyeOff className='h-2.5 w-2.5' /> Draft
    </span>
  );
}

function Thumbnail({ course }: { course: AdminCourse }) {
  const img = course.image ?? course.thumbnail;
  const color = COLOR(course.color ?? 'blue');
  if (img)
    return (
      <img
        src={img}
        alt={course.title}
        loading='lazy'
        className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
      />
    );
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
}

export function CourseCard({ course, index = 0 }: Props) {
  const color = COLOR(course.color ?? 'blue');
  const ct = CONTENT_ICON[course.contentType ?? 'MIXED'];
  const AccessIcon = ACCESS_ICON[course.access ?? 'FREE'] ?? Unlock;

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
      <AdminOverlay course={course} />

      <div className='relative aspect-video overflow-hidden bg-muted'>
        <Thumbnail course={course} />
        <div className='absolute top-2 start-2'>
          <StateBadge state={course.state} />
        </div>
      </div>

      <div className='flex flex-col flex-1 p-4 gap-2.5'>
        <div className='flex items-start justify-between gap-2'>
          <h3 className='text-sm font-bold text-foreground leading-snug line-clamp-2 flex-1'>
            {course.title}
          </h3>
          {course.category && (
            <span className='text-[11px] text-muted-foreground shrink-0'>
              {course.category.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {course.description && (
          <p className='text-xs text-muted-foreground leading-relaxed line-clamp-2'>
            {course.description}
          </p>
        )}

        <div className='flex flex-wrap items-center gap-1.5'>
          {course.difficulty && (
            <Badge variant='outline' className='gap-1 text-[10px] font-semibold border-border/60 bg-muted/40'>
              <BarChart3 className='h-3 w-3' />
              {course.difficulty.charAt(0) + course.difficulty.slice(1).toLowerCase()}
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

        <div className='mt-auto flex items-center gap-1 text-[11px] text-muted-foreground border-t border-border/40 pt-2.5'>
          <Zap className='h-3 w-3' />
          <span>{course.enrollmentCount ?? 0} enrolled</span>
          {course.isFeatured && (
            <span className='ms-auto rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary'>
              Featured
            </span>
          )}
          {course.isNew && (
            <span className='ms-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400'>
              New
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
