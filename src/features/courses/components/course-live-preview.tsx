import {
  BookOpen,
  Clock,
  Users,
  Star,
  Crown,
  Unlock,
  Shield,
  FlaskConical,
  Zap,
  Heart,
  Rocket,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import CourseElementRenderer, {
  type CourseElement,
} from './CourseElementRenderer';
import { useState } from 'react';

interface PreviewTopic {
  id: string;
  title: { en: string; ar: string };
  elements: CourseElement[];
}

interface PreviewCourse {
  title?: string;
  ar_title?: string;
  description?: string;
  ar_description?: string;
  image?: string;
  thumbnail?: string;
  color?: string;
  access?: string;
  difficulty?: string;
  category?: string;
  estimatedHours?: number;
  totalTopics?: number;
  enrollmentCount?: number;
  averageRating?: number;
  state?: string;
  isNew?: boolean;
}

const COLOR_HEX: Record<string, string> = {
  EMERALD: '#10b981',
  emerald: '#10b981',
  BLUE: '#3b82f6',
  blue: '#3b82f6',
  VIOLET: '#8b5cf6',
  violet: '#8b5cf6',
  ROSE: '#f43f5e',
  rose: '#f43f5e',
  ORANGE: '#f97316',
  orange: '#f97316',
  CYAN: '#06b6d4',
  cyan: '#06b6d4',
};
const COLOR_TEXT: Record<string, string> = {
  EMERALD: 'text-emerald-400',
  emerald: 'text-emerald-400',
  BLUE: 'text-blue-400',
  blue: 'text-blue-400',
  VIOLET: 'text-violet-400',
  violet: 'text-violet-400',
  ROSE: 'text-rose-400',
  rose: 'text-rose-400',
  ORANGE: 'text-orange-400',
  orange: 'text-orange-400',
  CYAN: 'text-cyan-400',
  cyan: 'text-cyan-400',
};
const COLOR_BG: Record<string, string> = {
  EMERALD: 'from-emerald-950 to-emerald-900',
  emerald: 'from-emerald-950 to-emerald-900',
  BLUE: 'from-blue-950 to-blue-900',
  blue: 'from-blue-950 to-blue-900',
  VIOLET: 'from-violet-950 to-violet-900',
  violet: 'from-violet-950 to-violet-900',
  ROSE: 'from-rose-950 to-rose-900',
  rose: 'from-rose-950 to-rose-900',
  ORANGE: 'from-orange-950 to-orange-900',
  orange: 'from-orange-950 to-orange-900',
  CYAN: 'from-cyan-950 to-cyan-900',
  cyan: 'from-cyan-950 to-cyan-900',
};
const ACCESS_BADGE: Record<string, string> = {
  FREE: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  PRO: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
  PREMIUM: 'border-violet-500/40 text-violet-400 bg-violet-500/10',
};

interface Props {
  course: PreviewCourse;
  topics?: PreviewTopic[];
  lang?: 'en' | 'ar';
}

export function CourseLivePreview({ course, topics = [], lang = 'en' }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const col = course.color ?? 'BLUE';
  const title = lang === 'ar' ? course.ar_title || course.title : course.title;
  const desc =
    lang === 'ar'
      ? course.ar_description || course.description
      : course.description;
  const imgSrc = course.image ?? course.thumbnail;
  const matrixColor = COLOR_HEX[col] ?? '#3b82f6';
  const textColor = COLOR_TEXT[col] ?? 'text-blue-400';
  const bgGrad = COLOR_BG[col] ?? 'from-blue-950 to-blue-900';
  const accessBadge =
    ACCESS_BADGE[course.access ?? 'FREE'] ?? ACCESS_BADGE.FREE;
  const comingSoon = course.state === 'COMING_SOON';

  return (
    <div className='rounded-2xl overflow-hidden border border-border/50 bg-background text-sm'>
      {/* ── Hero ── */}
      <div
        className={cn(
          'relative bg-gradient-to-br px-6 py-8 overflow-hidden',
          bgGrad,
        )}>
        {/* Matrix rain effect (simplified) */}
        <div
          className='pointer-events-none absolute inset-0 overflow-hidden opacity-10'
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${matrixColor}22 2px, ${matrixColor}22 4px)`,
          }}
        />

        {/* Breadcrumb */}
        <p className='text-xs text-white/40 mb-4'>
          Courses /{' '}
          <span className='text-white/60'>{title || 'Course Title'}</span>
        </p>

        {/* Icon + badges row */}
        <div className='flex items-start gap-4'>
          <div className='h-14 w-14 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10 bg-gradient-to-br from-black/30 to-black/10 flex items-center justify-center'>
            {imgSrc ? (
              <img src={imgSrc} alt='' className='h-full w-full object-cover' />
            ) : (
              <BookOpen className={cn('h-6 w-6', textColor)} />
            )}
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex flex-wrap gap-1.5 mb-2'>
              <Badge
                variant='outline'
                className={cn(
                  'rounded-full text-[11px] font-bold gap-1',
                  accessBadge,
                )}>
                {(course.access ?? 'FREE') === 'FREE' ? (
                  <Unlock className='h-2.5 w-2.5' />
                ) : (
                  <Crown className='h-2.5 w-2.5' />
                )}
                {course.access ?? 'FREE'}
              </Badge>
              {course.difficulty && (
                <Badge
                  variant='outline'
                  className='rounded-full border-white/20 text-[11px] text-white/65 gap-1'>
                  <Shield className='h-2.5 w-2.5' /> {course.difficulty}
                </Badge>
              )}
              {course.category && (
                <Badge
                  variant='outline'
                  className='rounded-full border-white/15 text-[11px] text-white/50'>
                  {course.category.replace(/_/g, ' ')}
                </Badge>
              )}
              {course.isNew && (
                <span className='inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white'>
                  New
                </span>
              )}
              {comingSoon && (
                <span className='inline-flex items-center gap-1 rounded-full border border-white/10 bg-zinc-600/80 px-2 py-0.5 text-[10px] font-bold text-white'>
                  <Clock className='h-2.5 w-2.5' /> Coming Soon
                </span>
              )}
            </div>
            <h1 className='text-xl font-black text-white leading-tight'>
              {title || <span className='opacity-30 italic'>Course Title</span>}
            </h1>
            {desc && (
              <p className='mt-1.5 text-sm text-white/60 leading-relaxed max-w-2xl'>
                {desc}
              </p>
            )}
          </div>
        </div>

        {/* Stats + CTA row */}
        <div className='mt-6 flex flex-wrap items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-x-5 gap-y-1.5'>
            {(course.totalTopics ?? 0) > 0 && (
              <div className='flex items-center gap-1.5 text-xs'>
                <BookOpen className={cn('h-3.5 w-3.5', textColor)} />
                <span className='font-bold text-white'>
                  {course.totalTopics}
                </span>
                <span className='text-white/45'>Topics</span>
              </div>
            )}
            {(course.estimatedHours ?? 0) > 0 && (
              <div className='flex items-center gap-1.5 text-xs'>
                <Clock className={cn('h-3.5 w-3.5', textColor)} />
                <span className='font-bold text-white'>
                  {course.estimatedHours}h
                </span>
                <span className='text-white/45'>est.</span>
              </div>
            )}
            <div className='flex items-center gap-1.5 text-xs'>
              <FlaskConical className={cn('h-3.5 w-3.5', textColor)} />
              <span className='font-bold text-white'>Labs</span>
            </div>
            {(course.enrollmentCount ?? 0) > 0 && (
              <div className='flex items-center gap-1.5 text-xs'>
                <Users className={cn('h-3.5 w-3.5', textColor)} />
                <span className='font-bold text-white'>
                  {course.enrollmentCount?.toLocaleString()}
                </span>
                <span className='text-white/45'>enrolled</span>
              </div>
            )}
            {(course.averageRating ?? 0) > 0 && (
              <div className='flex items-center gap-1.5 text-xs'>
                <Star className='h-3.5 w-3.5 fill-yellow-500 text-yellow-500' />
                <span className='font-bold text-white'>
                  {course.averageRating}
                </span>
              </div>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <button className='flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white/50'>
              <Heart className='h-3.5 w-3.5' /> Save
            </button>
            <button
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold text-white',
                comingSoon
                  ? 'border border-white/15 bg-white/5 text-white/50 cursor-default'
                  : 'bg-primary hover:bg-primary/90',
              )}>
              {comingSoon ? (
                <>
                  <Clock className='h-3.5 w-3.5' /> Coming Soon
                </>
              ) : (
                <>
                  <Rocket className='h-3.5 w-3.5' /> Start Free
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Curriculum preview ── */}
      {topics.length > 0 && (
        <div className='p-6 space-y-4 border-t border-border/40'>
          <h2 className='text-base font-bold'>Course Curriculum</h2>
          <div className='relative'>
            <div
              aria-hidden
              className='absolute top-5 bottom-5 start-[25px] w-px bg-border/40'
            />
            <ol className='space-y-2'>
              {topics.map((topic, idx) => (
                <li key={topic.id} className='relative flex gap-4'>
                  {/* Timeline dot */}
                  <div className='relative flex shrink-0 flex-col items-center'>
                    <div className='relative z-10 flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/15 text-primary text-sm font-bold'>
                      <span className='font-black'>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    {idx < topics.length - 1 && (
                      <div className='flex-1 w-px min-h-[16px] mt-1 bg-border/30' />
                    )}
                  </div>
                  {/* Card */}
                  <div className='mb-2 flex-1 min-w-0 rounded-xl border border-border/50 hover:border-border bg-card cursor-pointer'>
                    <button
                      type='button'
                      className='flex w-full items-center gap-3 px-4 py-3.5 text-start'
                      onClick={() =>
                        setOpenId((p) => (p === topic.id ? null : topic.id))
                      }>
                      <span className='flex shrink-0 items-center justify-center h-8 w-8 rounded-lg border border-primary/30 bg-primary/10 text-primary'>
                        <BookOpen className='h-4 w-4' />
                      </span>
                      <div className='min-w-0 flex-1'>
                        <span className='inline-flex rounded-full border border-primary/25 bg-primary/10 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-primary mb-0.5 block'>
                          TOPIC {String(idx + 1).padStart(2, '0')}
                        </span>
                        <p className='text-sm font-semibold'>
                          {topic.title.en || 'Untitled'}
                        </p>
                      </div>
                      <Zap className='h-4 w-4 text-muted-foreground' />
                    </button>
                    {openId === topic.id && (
                      <div className='border-t border-border/40 px-5 pb-5 pt-4'>
                        {topic.elements.length === 0 ? (
                          <p className='text-sm text-muted-foreground italic'>
                            No content yet.
                          </p>
                        ) : (
                          <CourseElementRenderer
                            elements={topic.elements}
                            lang={lang}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {topics.length === 0 && (
        <div className='p-6 border-t border-border/40'>
          <p className='text-sm text-muted-foreground italic text-center'>
            Curriculum will appear here once topics are added.
          </p>
        </div>
      )}
    </div>
  );
}
