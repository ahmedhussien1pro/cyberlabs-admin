// src/features/courses/components/platform-curriculum.tsx
// ─── نسخة طبق الأصل من course-curriculum.tsx في المنصة الأساسية ───────────
// فروق مقصودة: لا progress ، لا enrollment gating ، لا mark-complete
// الداتا تيجي من /admin/courses/:id  (sections + lessons مباشر)
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  ChevronDown,
  Clock3,
  Video,
  FileText,
  HelpCircle,
  FlaskConical,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PreviewLesson {
  id?: string;
  title: string;
  ar_title?: string | null;
  type?: string; // VIDEO | ARTICLE | QUIZ | LAB
  duration?: number | null;
  order?: number;
  isPublished?: boolean;
}

export interface PreviewSection {
  id: string;
  title: string;
  ar_title?: string | null;
  description?: string | null;
  order?: number;
  lessons?: PreviewLesson[];
}

interface PlatformCurriculumProps {
  sections: PreviewSection[];
  estimatedHours?: number | null;
}

// ─── Lesson icon map ──────────────────────────────────────────────────────────
const LESSON_ICON: Record<string, React.ElementType> = {
  VIDEO: Video,
  ARTICLE: FileText,
  QUIZ: HelpCircle,
  LAB: FlaskConical,
};

// ─── Skeleton (identical to main platform) ───────────────────────────────────
function CurriculumSkeleton() {
  return (
    <div className='space-y-3'>
      {[1, 2, 3].map((i) => (
        <div key={i} className='flex gap-4'>
          <div className='h-[50px] w-[50px] shrink-0 animate-pulse rounded-full bg-muted' />
          <div className='h-16 flex-1 animate-pulse rounded-xl border border-border/30 bg-muted/20' />
        </div>
      ))}
    </div>
  );
}

// ─── TopicRow  ────────────────────────────────────────────────────────────────
function TopicRow({
  section,
  topicIndex,
  total,
  isOpen,
  onToggle,
  lang,
}: {
  section: PreviewSection;
  topicIndex: number;
  total: number;
  isOpen: boolean;
  onToggle: () => void;
  lang: 'en' | 'ar';
}) {
  const topicNum = String(topicIndex + 1).padStart(2, '0');
  const isLast = topicIndex === total - 1;
  const title =
    lang === 'ar' && section.ar_title ? section.ar_title : section.title;
  const subtitle =
    lang === 'ar' ? section.title : (section.ar_title ?? null);
  const lessons = section.lessons ?? [];

  return (
    <motion.li
      id={`topic-row-${topicIndex}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: topicIndex * 0.04 }}
      className='relative'>
      <div className='flex gap-4'>
        {/* ── Timeline dot (same radius / colours as main platform) ── */}
        <div className='relative flex shrink-0 flex-col items-center'>
          <div
            className={cn(
              'relative z-10 flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300',
              isOpen
                ? 'border-primary bg-primary/15 text-primary shadow-lg shadow-primary/20'
                : 'border-border/60 bg-muted/50 text-muted-foreground',
            )}>
            <span className='font-black'>{topicNum}</span>
          </div>
          {!isLast && (
            <div className='mt-1 min-h-[16px] w-px flex-1 bg-border/30 transition-colors duration-300' />
          )}
        </div>

        {/* ── Card ── */}
        <div
          className={cn(
            'mb-2 min-w-0 flex-1 rounded-xl border bg-card transition-all duration-300',
            isOpen
              ? 'border-primary/30 shadow-sm'
              : 'cursor-pointer border-border/50 hover:border-border',
          )}>
          {/* Toggle button */}
          <button
            type='button'
            onClick={onToggle}
            aria-expanded={isOpen}
            className='flex w-full items-center gap-3 px-4 py-3.5 text-start'>
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors',
                isOpen
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border bg-muted text-muted-foreground',
              )}>
              <BookOpen className='h-4 w-4' />
            </span>

            <div className='min-w-0 flex-1'>
              {/* TOPIC badge */}
              <div className='mb-0.5 flex flex-wrap items-center gap-1.5'>
                <span
                  className={cn(
                    'inline-flex rounded-full border px-1.5 py-px text-[9px] font-bold uppercase tracking-wide',
                    isOpen
                      ? 'border-primary/25 bg-primary/10 text-primary'
                      : 'border-border bg-muted text-muted-foreground',
                  )}>
                  TOPIC {topicNum}
                </span>
              </div>

              {/* Primary title */}
              <p className='text-sm font-semibold leading-snug text-foreground'>
                {title}
              </p>

              {/* Secondary language subtitle */}
              {subtitle && (
                <p
                  className='mt-0.5 truncate text-xs text-muted-foreground/60'
                  dir={lang === 'en' ? 'rtl' : 'ltr'}>
                  {subtitle}
                </p>
              )}

              {/* Lesson count */}
              <p className='mt-0.5 text-xs text-muted-foreground'>
                {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
              </p>
            </div>

            <ChevronDown
              className={cn(
                'ms-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                isOpen && 'rotate-180',
              )}
            />
          </button>

          {/* ── Animated lessons body (AnimatePresence = same as main platform) ── */}
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                key='body'
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='overflow-hidden'>
                <div className='border-t border-border/40 px-5 pb-5 pt-4'>
                  {lessons.length === 0 ? (
                    <p className='text-sm italic text-muted-foreground'>
                      Content coming soon...
                    </p>
                  ) : (
                    <div className='space-y-0.5'>
                      {lessons.map((lesson, lIdx) => {
                        const LessonIcon =
                          LESSON_ICON[lesson.type?.toUpperCase() ?? ''] ??
                          FileText;
                        const lessonTitle =
                          lang === 'ar' && lesson.ar_title
                            ? lesson.ar_title
                            : lesson.title;

                        return (
                          <div
                            key={lesson.id ?? lIdx}
                            className='flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/30'>
                            {/* Type icon */}
                            <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/50 bg-muted text-muted-foreground'>
                              <LessonIcon className='h-3.5 w-3.5' />
                            </span>

                            {/* Title + type label */}
                            <div className='min-w-0 flex-1'>
                              <p className='truncate text-sm text-foreground/80'>
                                {lessonTitle}
                              </p>
                              <span className='text-[10px] font-medium uppercase text-muted-foreground/60'>
                                {lesson.type ?? 'ARTICLE'}
                              </span>
                            </div>

                            {/* Duration */}
                            {lesson.duration != null && lesson.duration > 0 && (
                              <span className='flex shrink-0 items-center gap-1 text-xs text-muted-foreground/60'>
                                <Clock3 className='h-3 w-3' />
                                {lesson.duration}m
                              </span>
                            )}

                            {/* Published indicator */}
                            <span
                              className={cn(
                                'h-1.5 w-1.5 shrink-0 rounded-full',
                                lesson.isPublished
                                  ? 'bg-emerald-500'
                                  : 'bg-border',
                              )}
                              title={
                                lesson.isPublished ? 'Published' : 'Unpublished'
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.li>
  );
}

// ─── Main export  ─────────────────────────────────────────────────────────────
export function PlatformCurriculum({
  sections,
  estimatedHours,
}: PlatformCurriculumProps) {
  const { i18n } = useTranslation();
  const lang = (i18n.language === 'ar' ? 'ar' : 'en') as 'en' | 'ar';

  // Open first section by default (same UX as main platform)
  const [openId, setOpenId] = useState<string | null>(
    sections[0]?.id ?? null,
  );

  const toggle = (id: string) => setOpenId((p) => (p === id ? null : id));

  const total = sections.length;
  const totalLessons = sections.reduce(
    (sum, s) => sum + (s.lessons?.length ?? 0),
    0,
  );

  return (
    <section id='course-curriculum' className='space-y-6'>
      {/* ── Header ── */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h2 className='text-xl font-bold tracking-tight sm:text-2xl'>
            Course Curriculum
          </h2>
          <p className='mt-1 text-sm text-muted-foreground'>
            {total} Topics · {totalLessons} Lessons
            {estimatedHours ? ` · ~${estimatedHours}h` : ''}
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      {total === 0 ? (
        <p className='py-4 text-sm italic text-muted-foreground'>
          Curriculum not available yet.
        </p>
      ) : (
        <div className='relative'>
          {/* Vertical timeline line (same absolute positioning as main platform) */}
          <div
            aria-hidden='true'
            className='absolute bottom-5 start-[25px] top-5 w-px bg-border/40'
          />
          <ol className='space-y-2'>
            {sections.map((section, idx) => (
              <TopicRow
                key={section.id}
                section={section}
                topicIndex={idx}
                total={total}
                isOpen={openId === section.id}
                onToggle={() => toggle(section.id)}
                lang={lang}
              />
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
