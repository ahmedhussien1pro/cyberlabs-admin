// src/features/courses/components/platform-curriculum.tsx
import { useState } from 'react';
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

type LocalizedText = string | { en: string; ar?: string } | null | undefined;
function getText(val: LocalizedText): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val.en ?? '';
}

export interface PreviewLesson {
  id?: string;
  title: LocalizedText;
  type?: string;
  duration?: number;
}

export interface PreviewSection {
  id?: string;
  title: LocalizedText;
  lessons?: PreviewLesson[];
  elements?: PreviewLesson[];
}

interface PlatformCurriculumProps {
  sections: PreviewSection[];
  estimatedHours?: number;
}

const LESSON_ICON: Record<string, React.ElementType> = {
  VIDEO: Video,
  ARTICLE: FileText,
  QUIZ: HelpCircle,
  LAB: FlaskConical,
};

export function PlatformCurriculum({
  sections,
  estimatedHours,
}: PlatformCurriculumProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const total = sections.length;
  const totalLessons = sections.reduce(
    (sum, s) => sum + (s.lessons ?? s.elements ?? []).length,
    0,
  );

  return (
    <section className='space-y-6'>
      {/* Header */}
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

      {total === 0 ? (
        <p className='py-4 text-sm italic text-muted-foreground'>
          Curriculum not available yet.
        </p>
      ) : (
        <div className='relative'>
          {/* Vertical timeline line */}
          <div
            aria-hidden='true'
            className='absolute bottom-5 start-[25px] top-5 w-px bg-border/40'
          />

          <ol className='space-y-2'>
            {sections.map((section, idx) => {
              const isOpen = openIdx === idx;
              const isLast = idx === total - 1;
              const lessons = section.lessons ?? section.elements ?? [];
              const topicNum = String(idx + 1).padStart(2, '0');

              return (
                <li key={section.id ?? idx} className='relative flex gap-4'>
                  {/* ── Timeline dot ── */}
                  <div className='relative flex shrink-0 flex-col items-center'>
                    <div
                      className={cn(
                        'relative z-10 flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300',
                        isOpen
                          ? 'border-primary bg-primary/15 text-primary shadow-lg shadow-primary/20'
                          : 'border-border/50 bg-muted/50 text-muted-foreground',
                      )}>
                      <span className='font-black'>{topicNum}</span>
                    </div>
                    {!isLast && (
                      <div className='mt-1 min-h-[16px] w-px flex-1 bg-border/30' />
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
                    {/* Header button */}
                    <button
                      type='button'
                      onClick={() => setOpenIdx(isOpen ? null : idx)}
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
                        <p className='text-sm font-semibold leading-snug text-foreground'>
                          {getText(section.title)}
                        </p>
                        <p className='mt-0.5 text-xs text-muted-foreground'>
                          {lessons.length} lesson
                          {lessons.length !== 1 ? 's' : ''}
                        </p>
                      </div>

                      <ChevronDown
                        className={cn(
                          'ms-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                          isOpen && 'rotate-180',
                        )}
                      />
                    </button>

                    {/* Lessons list */}
                    {isOpen && (
                      <div className='border-t border-border/40 px-5 pb-4 pt-3'>
                        {lessons.length === 0 ? (
                          <p className='text-sm italic text-muted-foreground'>
                            Content coming soon...
                          </p>
                        ) : (
                          <div className='space-y-1'>
                            {lessons.map((lesson, lIdx) => {
                              const LessonIcon =
                                LESSON_ICON[
                                  lesson.type?.toUpperCase() ?? 'ARTICLE'
                                ] ?? FileText;
                              return (
                                <div
                                  key={lesson.id ?? lIdx}
                                  className='flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/40'>
                                  <LessonIcon className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
                                  <span className='flex-1 truncate text-sm text-muted-foreground'>
                                    {getText(lesson.title)}
                                  </span>
                                  {lesson.duration && (
                                    <span className='flex shrink-0 items-center gap-1 text-xs text-muted-foreground/60'>
                                      <Clock3 className='h-3 w-3' />
                                      {lesson.duration}m
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}
