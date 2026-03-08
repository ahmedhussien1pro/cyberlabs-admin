// src/features/courses/components/course-import-preview.tsx
// مكوّن يعرض شكل الكورس كأنك بتشوفه على المنصة الأساسية

import {
  Clock,
  BookOpen,
  BarChart2,
  Layers,
  Video,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Lock,
  Star,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────
type LocalizedText = string | { en: string; ar?: string } | null | undefined;

interface PreviewElement {
  title: LocalizedText;
  type?: string;
  duration?: number;
}

interface PreviewTopic {
  title: LocalizedText;
  elements?: PreviewElement[];
}

interface PreviewMetadata {
  slug: string;
  color: string;
  difficulty: string;
  access: string;
  category: string;
  contentType: string;
  estimatedHours: number;
  isNew?: boolean;
  isFeatured?: boolean;
  thumbnail?: string;
  tags?: string[];
  skills?: string[];
}

interface CourseImportPreviewProps {
  landingData: {
    title: LocalizedText;
    description?: LocalizedText | { en?: string; ar?: string };
  };
  topics: PreviewTopic[];
  metadata: PreviewMetadata;
}

// ── Helper: extract readable text regardless of shape ──────────────
function getText(val: LocalizedText): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val.en ?? '';
}

function getArText(val: LocalizedText): string | undefined {
  if (!val || typeof val === 'string') return undefined;
  return val.ar || undefined;
}

function getDescEn(
  val: LocalizedText | { en?: string; ar?: string } | null | undefined,
): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return (val as any).en ?? '';
}

// ── Color palettes (matches the main platform) ─────────────────────
const COLOR_MAP: Record<
  string,
  { bg: string; border: string; badge: string; text: string }
> = {
  EMERALD: {
    bg: 'from-emerald-500/20 to-emerald-900/30',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-300',
    text: 'text-emerald-400',
  },
  BLUE: {
    bg: 'from-blue-500/20 to-blue-900/30',
    border: 'border-blue-500/30',
    badge: 'bg-blue-500/20 text-blue-300',
    text: 'text-blue-400',
  },
  VIOLET: {
    bg: 'from-violet-500/20 to-violet-900/30',
    border: 'border-violet-500/30',
    badge: 'bg-violet-500/20 text-violet-300',
    text: 'text-violet-400',
  },
  ORANGE: {
    bg: 'from-orange-500/20 to-orange-900/30',
    border: 'border-orange-500/30',
    badge: 'bg-orange-500/20 text-orange-300',
    text: 'text-orange-400',
  },
  ROSE: {
    bg: 'from-rose-500/20 to-rose-900/30',
    border: 'border-rose-500/30',
    badge: 'bg-rose-500/20 text-rose-300',
    text: 'text-rose-400',
  },
  CYAN: {
    bg: 'from-cyan-500/20 to-cyan-900/30',
    border: 'border-cyan-500/30',
    badge: 'bg-cyan-500/20 text-cyan-300',
    text: 'text-cyan-400',
  },
};

const LESSON_ICON: Record<string, React.ElementType> = {
  VIDEO: Video,
  ARTICLE: FileText,
  QUIZ: HelpCircle,
};

const DIFFICULTY_LABEL: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

const ACCESS_LABEL: Record<string, { label: string; icon: React.ElementType }> =
  {
    FREE: { label: 'Free', icon: BookOpen },
    PRO: { label: 'Pro', icon: Zap },
    PREMIUM: { label: 'Premium', icon: Star },
  };

export function CourseImportPreview({
  landingData,
  topics,
  metadata,
}: CourseImportPreviewProps) {
  const [openTopics, setOpenTopics] = useState<Record<number, boolean>>({
    0: true,
  });

  const colors = COLOR_MAP[metadata.color] ?? COLOR_MAP['BLUE'];
  const totalLessons = topics.reduce(
    (sum, t) => sum + (t.elements?.length ?? 0),
    0,
  );
  const AccessIcon = ACCESS_LABEL[metadata.access]?.icon ?? BookOpen;

  const toggleTopic = (idx: number) =>
    setOpenTopics((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const courseTitle = getText(landingData.title);
  const courseTitleAr = getArText(landingData.title);
  const courseDesc = getDescEn(landingData.description);

  return (
    <div className='space-y-6'>
      {/* ── Label ─────────────────────────────────────────── */}
      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
        <div className='h-px flex-1 bg-border' />
        <span className='px-2 font-medium uppercase tracking-wider'>
          Platform Preview
        </span>
        <div className='h-px flex-1 bg-border' />
      </div>

      {/* ── Course Card ────────────────────────────────────── */}
      <div
        className={cn(
          'rounded-xl border overflow-hidden',
          `bg-gradient-to-br ${colors.bg}`,
          colors.border,
        )}
      >
        {/* Hero thumbnail */}
        <div className='relative h-40 bg-black/30 flex items-center justify-center overflow-hidden'>
          {metadata.thumbnail ? (
            <img
              src={metadata.thumbnail}
              alt=''
              className='w-full h-full object-cover opacity-60'
            />
          ) : (
            <div className={cn('text-6xl opacity-20', colors.text)}>
              <BookOpen size={72} />
            </div>
          )}
          {/* Badges */}
          <div className='absolute top-3 left-3 flex gap-2 flex-wrap'>
            {metadata.isNew && (
              <span className='text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-500/80 text-black'>
                NEW
              </span>
            )}
            {metadata.isFeatured && (
              <span className='text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/80 text-white'>
                ⭐ Featured
              </span>
            )}
          </div>
          <div className='absolute top-3 right-3'>
            <span
              className={cn(
                'text-xs font-bold px-2 py-1 rounded-full',
                colors.badge,
              )}
            >
              {ACCESS_LABEL[metadata.access]?.label ?? metadata.access}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className='p-4 space-y-3'>
          <h3 className='text-lg font-bold leading-tight'>{courseTitle}</h3>
          {courseTitleAr && (
            <p className='text-sm text-muted-foreground font-arabic' dir='rtl'>
              {courseTitleAr}
            </p>
          )}
          {courseDesc && (
            <p className='text-sm text-muted-foreground line-clamp-2'>
              {courseDesc}
            </p>
          )}

          {/* Stats row */}
          <div className='flex flex-wrap gap-3 text-xs text-muted-foreground pt-1'>
            <span className='flex items-center gap-1'>
              <Clock size={12} />
              {metadata.estimatedHours}h
            </span>
            <span className='flex items-center gap-1'>
              <Layers size={12} />
              {topics.length} sections
            </span>
            <span className='flex items-center gap-1'>
              <BookOpen size={12} />
              {totalLessons} lessons
            </span>
            <span className='flex items-center gap-1'>
              <BarChart2 size={12} />
              {DIFFICULTY_LABEL[metadata.difficulty] ?? metadata.difficulty}
            </span>
            <span className='flex items-center gap-1'>
              <AccessIcon size={12} />
              {ACCESS_LABEL[metadata.access]?.label ?? metadata.access}
            </span>
          </div>

          {/* Skills tags */}
          {metadata.skills && metadata.skills.length > 0 && (
            <div className='flex flex-wrap gap-1.5 pt-1'>
              {metadata.skills.slice(0, 5).map((skill) => (
                <Badge key={skill} variant='secondary' className='text-xs'>
                  {skill}
                </Badge>
              ))}
              {metadata.skills.length > 5 && (
                <Badge variant='secondary' className='text-xs'>
                  +{metadata.skills.length - 5}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Curriculum (matches platform's course-curriculum) ──── */}
      <div className='rounded-xl border overflow-hidden'>
        <div className='px-4 py-3 bg-muted/50 border-b flex items-center justify-between'>
          <h4 className='font-semibold text-sm flex items-center gap-2'>
            <Layers size={14} />
            Course Curriculum
          </h4>
          <span className='text-xs text-muted-foreground'>
            {topics.length} sections · {totalLessons} lessons
          </span>
        </div>

        <div className='divide-y'>
          {topics.map((topic, idx) => {
            const isOpen = !!openTopics[idx];
            const lessonCount = topic.elements?.length ?? 0;
            const topicTitle = getText(topic.title);

            return (
              <div key={idx}>
                {/* Section header */}
                <button
                  onClick={() => toggleTopic(idx)}
                  className='w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors text-left'
                >
                  <div className='flex items-center gap-2.5'>
                    {isOpen ? (
                      <ChevronDown
                        size={14}
                        className='text-muted-foreground'
                      />
                    ) : (
                      <ChevronRight
                        size={14}
                        className='text-muted-foreground'
                      />
                    )}
                    <span className='font-medium text-sm'>{topicTitle}</span>
                  </div>
                  <span className='text-xs text-muted-foreground shrink-0 ml-2'>
                    {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
                  </span>
                </button>

                {/* Lessons */}
                {isOpen && topic.elements && topic.elements.length > 0 && (
                  <div className='bg-muted/20 divide-y divide-border/50'>
                    {topic.elements.map((el, eIdx) => {
                      const LessonIcon =
                        LESSON_ICON[el.type?.toUpperCase() ?? 'ARTICLE'] ??
                        FileText;
                      const elTitle = getText(el.title);
                      return (
                        <div
                          key={eIdx}
                          className='flex items-center gap-3 px-6 py-2.5 text-sm'
                        >
                          <LessonIcon
                            size={13}
                            className='text-muted-foreground shrink-0'
                          />
                          <span className='flex-1 truncate text-muted-foreground'>
                            {elTitle}
                          </span>
                          {metadata.access !== 'FREE' && (
                            <Lock
                              size={11}
                              className='text-muted-foreground/50 shrink-0'
                            />
                          )}
                          {el.duration && (
                            <span className='text-xs text-muted-foreground/70 shrink-0'>
                              {el.duration}m
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
