// Mirrors SharedCourseCard from cyberlabs-frontend/src/shared/components/shared-course-card.tsx
// Differences: no framer-motion, no i18n, no router Links — read-only admin preview
import {
  BookOpen,
  FlaskConical,
  BookMarked,
  BarChart3,
  Clock,
  ArrowRight,
  Unlock,
  Crown,
  Gem,
  Heart,
  Info,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PlatformCourseData {
  id?: string;
  slug?: string;
  title: string;
  ar_title?: string | null;
  description?: string | null;
  ar_description?: string | null;
  thumbnail?: string | null;
  image?: string | null;
  color?: string;
  difficulty?: string | null;
  ar_difficulty?: string | null;
  access?: string;
  contentType?: string;
  category?: string | null;
  ar_category?: string | null;
  totalTopics?: number;
  estimatedHours?: number;
  state?: string;
  averageRating?: number;
  isFeatured?: boolean;
  isNew?: boolean;
}

// ── Style maps (identical to SharedCourseCard) ──────────────────────
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
  PRACTICAL: { Icon: FlaskConical, label: 'Practical' },
  THEORETICAL: { Icon: BookMarked, label: 'Theory' },
  MIXED: { Icon: BookOpen, label: 'Mixed' },
};

function normalizeDiff(d?: string | null) {
  if (!d) return null;
  const s = d.toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Shared Thumbnail ──────────────────────────────────────
function CourseThumbnail({
  course,
  textSize = 'text-base',
}: {
  course: PlatformCourseData;
  textSize?: string;
}) {
  const img = course.image ?? course.thumbnail;
  const color = course.color ?? 'blue';
  if (img) {
    return (
      <img
        src={img}
        alt={course.title}
        className='h-full w-full object-cover'
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center bg-gradient-to-br border',
        FALLBACK_BG[color] ?? 'from-zinc-900 to-zinc-800 border-zinc-700',
      )}
    >
      <p
        className={cn(
          'px-3 text-center font-black leading-tight',
          textSize,
          FALLBACK_TEXT[color] ?? 'text-zinc-400',
        )}
      >
        {course.title}
      </p>
    </div>
  );
}

// ═══ FULL VARIANT ════════════════════════════════════
function FullCard({ course }: { course: PlatformCourseData }) {
  const color = course.color ?? 'blue';
  const comingSoon = course.state === 'COMING_SOON';
  const diff = normalizeDiff(course.difficulty);
  const cat = course.category;
  const ct = CONTENT_ICON[course.contentType ?? 'MIXED'];
  const AccessIcon = ACCESS_ICON[course.access ?? 'FREE'] ?? Unlock;

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border bg-card',
        'ring-1 ring-transparent transition-all duration-300',
        HOVER_RING[color],
        comingSoon ? 'opacity-80' : 'hover:-translate-y-0.5 hover:shadow-xl',
      )}
    >
      {/* Thumbnail */}
      <div className='relative aspect-video overflow-hidden bg-muted'>
        <CourseThumbnail course={course} textSize='text-lg' />

        {comingSoon && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm'>
            <span className='flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/80'>
              <Sparkles className='h-3 w-3' /> Coming Soon
            </span>
          </div>
        )}

        {!comingSoon && (
          <div className='absolute start-3 top-3'>
            <span className='inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md'>
              <span className='h-1.5 w-1.5 rounded-full bg-white' /> Available
            </span>
          </div>
        )}

        {/* Favorite button — visual only */}
        <button
          disabled
          className='absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100'
        >
          <Heart className='h-4 w-4' />
        </button>
      </div>

      {/* Body */}
      <div className='flex flex-1 flex-col gap-3 p-4'>
        <div className='flex items-start justify-between gap-2'>
          <h3 className='line-clamp-2 flex-1 text-sm font-bold leading-snug text-foreground'>
            {course.ar_title || course.title}
          </h3>
          {cat && (
            <span className='shrink-0 text-[11px] text-muted-foreground'>
              {cat}
            </span>
          )}
        </div>

        {course.description && (
          <p className='line-clamp-2 text-xs leading-relaxed text-muted-foreground'>
            {course.description}
          </p>
        )}

        <div className='flex flex-wrap items-center gap-1.5'>
          {diff && (
            <Badge
              variant='outline'
              className='gap-1 border-border/60 bg-muted/40 text-[10px] font-semibold'
            >
              <BarChart3 className='h-3 w-3' /> {diff}
            </Badge>
          )}
          {course.access && (
            <Badge
              variant='outline'
              className={cn(
                'gap-1 text-[10px] font-bold',
                ACCESS_BADGE[course.access],
              )}
            >
              <AccessIcon className='h-3 w-3' /> {course.access}
            </Badge>
          )}
          {(course.totalTopics ?? 0) > 0 && (
            <Badge
              variant='outline'
              className='gap-1 border-primary/30 bg-primary/5 text-[10px] font-semibold text-primary'
            >
              <Clock className='h-3 w-3' /> {course.totalTopics} Topics
            </Badge>
          )}
          {ct && (
            <Badge
              variant='outline'
              className='gap-1 border-border/40 text-[10px] text-muted-foreground'
            >
              <ct.Icon className='h-3 w-3' /> {ct.label}
            </Badge>
          )}
        </div>

        <div className='mt-auto flex gap-2 pt-1'>
          <Button
            variant='outline'
            size='sm'
            className='h-9 flex-1 border-border/60 text-xs'
            disabled
          >
            <Info className='me-1.5 h-3.5 w-3.5' /> More Info
          </Button>
          <Button
            size='sm'
            className='h-9 flex-1 text-xs'
            disabled={comingSoon}
          >
            {comingSoon ? (
              'Coming Soon'
            ) : (
              <>
                Start Learning{' '}
                <ArrowRight className='ms-1.5 h-3.5 w-3.5' />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ═══ MINI VARIANT ════════════════════════════════════
function MiniCard({ course }: { course: PlatformCourseData }) {
  const color = course.color ?? 'blue';
  const comingSoon = course.state === 'COMING_SOON';
  const diff = normalizeDiff(course.difficulty);
  const AccessIcon = ACCESS_ICON[course.access ?? 'FREE'] ?? Unlock;

  return (
    <div
      className={cn(
        'group flex gap-3 overflow-hidden rounded-xl border bg-card transition-all duration-200',
        comingSoon
          ? 'border-border/30 opacity-60'
          : cn(
              'border-border/50 hover:border-primary/30 hover:bg-muted/40 hover:shadow-sm',
              HOVER_RING[color],
            ),
      )}
    >
      {/* Thumbnail */}
      <div className='relative h-24 w-36 shrink-0 overflow-hidden bg-muted'>
        <CourseThumbnail course={course} textSize='text-xs' />
        {comingSoon && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/60'>
            <Sparkles className='h-4 w-4 text-white/70' />
          </div>
        )}
      </div>

      {/* Text */}
      <div className='flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-3 pe-3'>
        <h4 className='line-clamp-1 text-sm font-bold text-foreground transition-colors group-hover:text-primary'>
          {course.ar_title || course.title}
        </h4>
        {course.description && (
          <p className='line-clamp-2 text-xs leading-relaxed text-muted-foreground'>
            {course.description}
          </p>
        )}
        <div className='flex flex-wrap items-center gap-1.5'>
          {diff && (
            <Badge
              variant='outline'
              className='gap-1 border-border/60 bg-muted/40 text-[10px] font-semibold'
            >
              <BarChart3 className='h-3 w-3' /> {diff}
            </Badge>
          )}
          {course.access && (
            <Badge
              variant='outline'
              className={cn(
                'gap-1 text-[10px] font-bold',
                ACCESS_BADGE[course.access],
              )}
            >
              <AccessIcon className='h-3 w-3' /> {course.access}
            </Badge>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className='flex shrink-0 items-center pe-3'>
        <div className='flex h-8 w-8 items-center justify-center rounded-full border border-border/50 bg-muted/50 text-muted-foreground transition-all group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary'>
          <ArrowRight className='h-3.5 w-3.5' />
        </div>
      </div>
    </div>
  );
}

// ═══ EXPORT ══════════════════════════════════════════
export function PlatformCourseCard({
  course,
  variant = 'full',
}: {
  course: PlatformCourseData;
  variant?: 'full' | 'mini';
}) {
  return variant === 'mini' ? (
    <MiniCard course={course} />
  ) : (
    <FullCard course={course} />
  );
}
