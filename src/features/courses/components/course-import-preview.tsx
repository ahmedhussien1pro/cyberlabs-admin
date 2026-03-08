// src/features/courses/components/course-import-preview.tsx
// ─── Platform Preview لصفحة Import ─────────────────────────────────────────
// يعرض شكل الكورس كأنك بتشوفه على المنصة الأساسية (course-detail-page)
import {
  Clock,
  BookOpen,
  BarChart2,
  Layers,
  Zap,
  Star,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  PlatformCurriculum,
  type PreviewSection,
} from './platform-curriculum';
import type { CourseElement } from '@/core/types/curriculumCourses.types';

// ─── Types ────────────────────────────────────────────────────────────────────
type LocalizedText = string | { en: string; ar?: string } | null | undefined;

/** عنصر الـ topic من JSON الكورس — Rich CourseElement */
export interface ImportPreviewTopic {
  title: LocalizedText;
  description?: LocalizedText | { en?: string; ar?: string };
  elements?: CourseElement[];
}

export interface ImportPreviewMetadata {
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
  topics: ImportPreviewTopic[];
  metadata: ImportPreviewMetadata;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getText(val: LocalizedText): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return (val as any).en ?? '';
}
function getArText(val: LocalizedText): string | undefined {
  if (!val || typeof val === 'string') return undefined;
  return (val as any).ar || undefined;
}
function getDescEn(
  val: LocalizedText | { en?: string; ar?: string } | null | undefined,
): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return (val as any).en ?? '';
}

// ─── Color palettes (matches the main platform) ───────────────────────────────
const COLOR_MAP: Record<
  string,
  { bg: string; border: string; badge: string; text: string }
> = {
  EMERALD: { bg: 'from-emerald-500/20 to-emerald-900/30', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300', text: 'text-emerald-400' },
  BLUE:    { bg: 'from-blue-500/20 to-blue-900/30',       border: 'border-blue-500/30',    badge: 'bg-blue-500/20 text-blue-300',       text: 'text-blue-400' },
  VIOLET:  { bg: 'from-violet-500/20 to-violet-900/30',   border: 'border-violet-500/30',  badge: 'bg-violet-500/20 text-violet-300',   text: 'text-violet-400' },
  ORANGE:  { bg: 'from-orange-500/20 to-orange-900/30',   border: 'border-orange-500/30',  badge: 'bg-orange-500/20 text-orange-300',   text: 'text-orange-400' },
  ROSE:    { bg: 'from-rose-500/20 to-rose-900/30',       border: 'border-rose-500/30',    badge: 'bg-rose-500/20 text-rose-300',       text: 'text-rose-400' },
  CYAN:    { bg: 'from-cyan-500/20 to-cyan-900/30',       border: 'border-cyan-500/30',    badge: 'bg-cyan-500/20 text-cyan-300',       text: 'text-cyan-400' },
};

const DIFFICULTY_LABEL: Record<string, string> = {
  BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced',
};

const ACCESS_CFG: Record<string, { label: string; Icon: React.ElementType }> = {
  FREE:    { label: 'Free',    Icon: BookOpen },
  PRO:     { label: 'Pro',     Icon: Zap },
  PREMIUM: { label: 'Premium', Icon: Star },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export function CourseImportPreview({
  landingData,
  topics,
  metadata,
}: CourseImportPreviewProps) {
  const colors = COLOR_MAP[metadata.color?.toUpperCase()] ?? COLOR_MAP['BLUE'];
  const totalElements = topics.reduce(
    (sum, t) => sum + (t.elements?.length ?? 0),
    0,
  );
  const { label: accessLabel, Icon: AccessIcon } =
    ACCESS_CFG[metadata.access] ?? ACCESS_CFG['FREE'];

  const courseTitle   = getText(landingData.title);
  const courseTitleAr = getArText(landingData.title);
  const courseDesc    = getDescEn(landingData.description);

  // ── تحويل topics → PreviewSection[] للـ PlatformCurriculum ──────────────────
  const sections: PreviewSection[] = topics.map((topic, idx) => ({
    id: String(idx),
    title:    getText(topic.title),
    ar_title: getArText(topic.title) ?? null,
    elements: topic.elements ?? [],
  }));

  return (
    <div className='space-y-6'>
      {/* ── Divider label ── */}
      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
        <div className='h-px flex-1 bg-border' />
        <span className='px-2 font-medium uppercase tracking-wider'>
          Platform Preview
        </span>
        <div className='h-px flex-1 bg-border' />
      </div>

      {/* ── Course Card Hero (matches main platform card) ── */}
      <div
        className={cn(
          'overflow-hidden rounded-xl border',
          `bg-gradient-to-br ${colors.bg}`,
          colors.border,
        )}>
        {/* Thumbnail */}
        <div className='relative flex h-40 items-center justify-center overflow-hidden bg-black/30'>
          {metadata.thumbnail ? (
            <img
              src={metadata.thumbnail}
              alt=''
              className='h-full w-full object-cover opacity-60'
            />
          ) : (
            <BookOpen className={cn('opacity-20', colors.text)} size={72} />
          )}
          {/* Badges */}
          <div className='absolute left-3 top-3 flex flex-wrap gap-2'>
            {metadata.isNew && (
              <span className='rounded-full bg-yellow-500/80 px-2 py-0.5 text-xs font-bold text-black'>
                NEW
              </span>
            )}
            {metadata.isFeatured && (
              <span className='rounded-full bg-purple-500/80 px-2 py-0.5 text-xs font-bold text-white'>
                ⭐ Featured
              </span>
            )}
          </div>
          <div className='absolute right-3 top-3'>
            <span className={cn('rounded-full px-2 py-1 text-xs font-bold', colors.badge)}>
              {accessLabel}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className='space-y-3 p-4'>
          <h3 className='text-lg font-bold leading-tight'>{courseTitle}</h3>
          {courseTitleAr && (
            <p className='font-arabic text-sm text-muted-foreground' dir='rtl'>
              {courseTitleAr}
            </p>
          )}
          {courseDesc && (
            <p className='line-clamp-2 text-sm text-muted-foreground'>
              {courseDesc}
            </p>
          )}
          {/* Stats */}
          <div className='flex flex-wrap gap-3 pt-1 text-xs text-muted-foreground'>
            <span className='flex items-center gap-1'>
              <Clock size={12} />{metadata.estimatedHours}h
            </span>
            <span className='flex items-center gap-1'>
              <Layers size={12} />{topics.length} topics
            </span>
            <span className='flex items-center gap-1'>
              <BookOpen size={12} />{totalElements} elements
            </span>
            <span className='flex items-center gap-1'>
              <BarChart2 size={12} />
              {DIFFICULTY_LABEL[metadata.difficulty] ?? metadata.difficulty}
            </span>
            <span className='flex items-center gap-1'>
              <AccessIcon size={12} />{accessLabel}
            </span>
          </div>
          {/* Skills */}
          {(metadata.skills?.length ?? 0) > 0 && (
            <div className='flex flex-wrap gap-1.5 pt-1'>
              {metadata.skills!.slice(0, 5).map((skill) => (
                <Badge key={skill} variant='secondary' className='text-xs'>
                  {skill}
                </Badge>
              ))}
              {metadata.skills!.length > 5 && (
                <Badge variant='secondary' className='text-xs'>
                  +{metadata.skills!.length - 5}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Curriculum — PlatformCurriculum بنفس شكل المنصة ── */}
      <PlatformCurriculum
        sections={sections}
        estimatedHours={metadata.estimatedHours}
      />
    </div>
  );
}
