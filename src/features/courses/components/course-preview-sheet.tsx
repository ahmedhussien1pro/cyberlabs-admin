// src/features/courses/components/course-preview-sheet.tsx
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Monitor,
  Rows3,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  LayoutTemplate,
  Clock,
  BookOpen,
  BarChart2,
  Layers,
  GraduationCap,
} from 'lucide-react';
import {
  PlatformCourseCard,
  type PlatformCourseData,
} from './platform-course-card';
import {
  PlatformCurriculum,
  type PreviewSection,
} from './platform-curriculum';
import { cn } from '@/lib/utils';

const DOTTED_BG: React.CSSProperties = {
  backgroundImage: 'radial-gradient(circle, #ffffff0a 1px, transparent 1px)',
  backgroundSize: '20px 20px',
};

const DIFFICULTY_LABEL: Record<string, string> = {
  BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced',
};

type CheckItem = { label: string; ok: boolean; critical: boolean };

function getCompletenessItems(
  course: PlatformCourseData & Record<string, any>,
): CheckItem[] {
  return [
    { label: 'Title (EN)',       ok: !!course.title,                               critical: true  },
    { label: 'Title (AR)',       ok: !!course.ar_title,                            critical: false },
    { label: 'Description',     ok: !!course.description,                         critical: true  },
    { label: 'Description (AR)',ok: !!course.ar_description,                      critical: false },
    { label: 'Thumbnail',       ok: !!(course.thumbnail || course.image),         critical: false },
    { label: 'Category',        ok: !!course.category,                            critical: false },
    { label: 'Instructor',      ok: !!course.instructorId || !!course.instructor, critical: true  },
    { label: 'Difficulty',      ok: !!course.difficulty,                          critical: true  },
    { label: 'Duration',        ok: !!course.duration,                            critical: false },
    { label: 'Tags',            ok: (course.tags?.length ?? 0) > 0,               critical: false },
    { label: 'Skills',          ok: (course.skills?.length ?? 0) > 0,             critical: false },
    { label: 'Curriculum',      ok: (course.sections?.length ?? 0) > 0,           critical: false },
  ];
}

interface CoursePreviewSheetProps {
  open: boolean;
  onClose: () => void;
  course: PlatformCourseData & Record<string, any>;
}

export function CoursePreviewSheet({
  open,
  onClose,
  course,
}: CoursePreviewSheetProps) {
  const [tab, setTab] = useState<'grid' | 'list' | 'detail' | 'check'>('grid');
  const items = getCompletenessItems(course);
  const criticalMissing = items.filter((i) => i.critical && !i.ok).length;
  const totalMissing = items.filter((i) => !i.ok).length;

  // ── تحويل course.sections → PreviewSection[] ──────────────────────────────
  const previewSections: PreviewSection[] = (
    (course.sections ?? []) as any[]
  ).map((s) => ({
    id:       s.id,
    title:    s.title,
    ar_title: s.ar_title ?? null,
    order:    s.order,
    lessons: ((s.lessons ?? []) as any[]).map((l) => ({
      id:          l.id,
      title:       l.title,
      ar_title:    l.ar_title ?? null,
      type:        l.type,
      duration:    l.duration ?? null,
      order:       l.order,
      isPublished: l.isPublished,
    })),
  }));

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side='right'
        className='flex w-full flex-col p-0 sm:max-w-2xl'
      >
        {/* ── Header ── */}
        <SheetHeader className='shrink-0 border-b px-6 py-4'>
          <div className='flex items-center justify-between'>
            <SheetTitle className='flex items-center gap-2 text-base'>
              <Monitor className='h-4 w-4' />
              Platform Preview
            </SheetTitle>
            <div className='flex items-center gap-2'>
              {criticalMissing > 0 && (
                <Badge variant='destructive' className='gap-1 text-xs'>
                  <AlertCircle className='h-3 w-3' />
                  {criticalMissing} required missing
                </Badge>
              )}
              {course.slug && (
                <a
                  href={`/courses/${course.slug}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground'>
                  <ExternalLink className='h-3.5 w-3.5' />
                  /courses/{course.slug}
                </a>
              )}
            </div>
          </div>
          <SheetDescription className='text-xs'>
            Exact appearance of this course on the main platform
          </SheetDescription>
        </SheetHeader>

        {/* ── Tabs ── */}
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as typeof tab)}
          className='flex flex-1 flex-col overflow-hidden'>
          <div className='shrink-0 border-b px-6 py-3'>
            <TabsList className='grid w-full grid-cols-4'>
              <TabsTrigger value='grid' className='gap-1.5 text-xs'>
                <Monitor className='h-3.5 w-3.5' /> Grid
              </TabsTrigger>
              <TabsTrigger value='list' className='gap-1.5 text-xs'>
                <Rows3 className='h-3.5 w-3.5' /> List
              </TabsTrigger>
              <TabsTrigger value='detail' className='gap-1.5 text-xs'>
                <LayoutTemplate className='h-3.5 w-3.5' /> Detail
              </TabsTrigger>
              <TabsTrigger value='check' className='relative gap-1.5 text-xs'>
                <CheckCircle2 className='h-3.5 w-3.5' /> Checklist
                {criticalMissing > 0 && (
                  <span className='absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground'>
                    {criticalMissing}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── Grid Tab ── */}
          <TabsContent
            value='grid'
            className='flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-8 pt-5'>
            <div
              className='flex items-center justify-center rounded-xl bg-zinc-950 p-6'
              style={DOTTED_BG}>
              <div className='w-full max-w-[300px]'>
                <PlatformCourseCard course={course} variant='full' />
              </div>
            </div>
            <p className='text-center text-xs text-muted-foreground'>
              Shown in{' '}
              <code className='rounded bg-muted px-1 py-0.5 text-[10px]'>/courses</code>{' '}
              page — grid layout (300px wide)
            </p>
          </TabsContent>

          {/* ── List Tab ── */}
          <TabsContent
            value='list'
            className='flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-8 pt-5'>
            <div
              className='flex items-center rounded-xl bg-zinc-950 p-6'
              style={DOTTED_BG}>
              <div className='w-full'>
                <PlatformCourseCard course={course} variant='mini' />
              </div>
            </div>
            <p className='text-center text-xs text-muted-foreground'>
              Shown in{' '}
              <code className='rounded bg-muted px-1 py-0.5 text-[10px]'>/courses</code>{' '}
              list view &amp; search results
            </p>
          </TabsContent>

          {/* ── Detail Tab (course-detail-page layout) ── */}
          <TabsContent
            value='detail'
            className='flex-1 overflow-y-auto'>
            {/* Mini Hero — matches CourseDetailHero */}
            <div className='relative border-b bg-gradient-to-b from-muted/40 to-background px-6 pb-6 pt-5'>
              <div className='flex gap-4'>
                {/* Thumbnail */}
                {course.thumbnail && (
                  <div className='h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-border/50'>
                    <img
                      src={course.thumbnail}
                      alt=''
                      className='h-full w-full object-cover'
                    />
                  </div>
                )}
                <div className='min-w-0 flex-1'>
                  {/* Badges row */}
                  <div className='mb-1.5 flex flex-wrap items-center gap-1.5'>
                    {course.state && (
                      <Badge variant='outline' className='text-[10px] uppercase'>
                        {course.state}
                      </Badge>
                    )}
                    {course.difficulty && (
                      <Badge variant='secondary' className='text-[10px]'>
                        {DIFFICULTY_LABEL[course.difficulty] ?? course.difficulty}
                      </Badge>
                    )}
                    {course.access && (
                      <Badge variant='outline' className='text-[10px]'>
                        {course.access}
                      </Badge>
                    )}
                    {course.isNew && (
                      <Badge className='bg-yellow-500/80 text-[10px] text-black hover:bg-yellow-500/80'>
                        NEW
                      </Badge>
                    )}
                  </div>
                  {/* Title */}
                  <h1 className='text-base font-bold leading-snug'>
                    {course.title}
                  </h1>
                  {course.ar_title && (
                    <p
                      className='mt-0.5 text-xs text-muted-foreground'
                      dir='rtl'>
                      {course.ar_title}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className='mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground'>
                {course.estimatedHours && (
                  <span className='flex items-center gap-1'>
                    <Clock className='h-3.5 w-3.5' />
                    {course.estimatedHours}h estimated
                  </span>
                )}
                {course._count?.sections != null && (
                  <span className='flex items-center gap-1'>
                    <Layers className='h-3.5 w-3.5' />
                    {course._count.sections} sections
                  </span>
                )}
                {course._count?.lessons != null && (
                  <span className='flex items-center gap-1'>
                    <BookOpen className='h-3.5 w-3.5' />
                    {course._count.lessons} lessons
                  </span>
                )}
                {course._count?.enrollments != null && (
                  <span className='flex items-center gap-1'>
                    <GraduationCap className='h-3.5 w-3.5' />
                    {course._count.enrollments} enrolled
                  </span>
                )}
                {course.averageRating != null && (
                  <span className='flex items-center gap-1'>
                    ⭐ {Number(course.averageRating).toFixed(1)}
                    {course.reviewCount != null && (
                      <span className='text-muted-foreground/60'>
                        ({course.reviewCount})
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* Instructor */}
              {course.instructor && (
                <div className='mt-3 flex items-center gap-2'>
                  {course.instructor.avatarUrl ? (
                    <img
                      src={course.instructor.avatarUrl}
                      alt=''
                      className='h-6 w-6 rounded-full object-cover'
                    />
                  ) : (
                    <div className='flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold'>
                      {course.instructor.name?.[0] ?? '?'}
                    </div>
                  )}
                  <span className='text-xs text-muted-foreground'>
                    {course.instructor.name}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {(course.longDescription || course.description) && (
              <div className='mx-6 mt-5 rounded-xl border border-border/40 bg-muted/20 p-4'>
                <p className='text-sm leading-7 text-foreground/70'>
                  {course.longDescription ?? course.description}
                </p>
              </div>
            )}

            {/* Curriculum — PlatformCurriculum بنفس شكل المنصة تماماً */}
            <div className='px-6 pb-8 pt-6'>
              {previewSections.length === 0 ? (
                <div className='rounded-xl border border-dashed border-border/40 py-10 text-center'>
                  <BarChart2 className='mx-auto mb-2 h-8 w-8 text-muted-foreground/30' />
                  <p className='text-sm text-muted-foreground'>
                    No curriculum yet — import a JSON or add sections manually.
                  </p>
                </div>
              ) : (
                <PlatformCurriculum
                  sections={previewSections}
                  estimatedHours={course.estimatedHours}
                />
              )}
            </div>
          </TabsContent>

          {/* ── Completeness Tab ── */}
          <TabsContent
            value='check'
            className='flex flex-1 flex-col gap-3 overflow-y-auto px-6 pb-8 pt-5'>
            <div className='grid grid-cols-2 gap-3'>
              <div className='rounded-lg border bg-muted/30 p-3 text-center'>
                <p className='text-2xl font-bold text-emerald-400'>
                  {items.filter((i) => i.ok).length}
                </p>
                <p className='text-xs text-muted-foreground'>Complete</p>
              </div>
              <div
                className={cn(
                  'rounded-lg border p-3 text-center',
                  criticalMissing > 0
                    ? 'border-destructive/30 bg-destructive/10'
                    : 'bg-muted/30',
                )}>
                <p
                  className={cn(
                    'text-2xl font-bold',
                    criticalMissing > 0
                      ? 'text-destructive'
                      : 'text-muted-foreground',
                  )}>
                  {totalMissing}
                </p>
                <p className='text-xs text-muted-foreground'>Missing</p>
              </div>
            </div>

            <Separator />

            <div className='space-y-2'>
              {items.map(({ label, ok, critical }) => (
                <div
                  key={label}
                  className={cn(
                    'flex items-center justify-between rounded-lg border px-3 py-2',
                    ok
                      ? 'border-border/50 bg-muted/20'
                      : critical
                        ? 'border-destructive/40 bg-destructive/5'
                        : 'border-amber-500/30 bg-amber-500/5',
                  )}>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm'>{label}</span>
                    {critical && !ok && (
                      <Badge
                        variant='destructive'
                        className='px-1.5 py-0 text-[10px]'>
                        Required
                      </Badge>
                    )}
                  </div>
                  {ok ? (
                    <CheckCircle2 className='h-4 w-4 shrink-0 text-emerald-400' />
                  ) : critical ? (
                    <XCircle className='h-4 w-4 shrink-0 text-destructive' />
                  ) : (
                    <AlertCircle className='h-4 w-4 shrink-0 text-amber-400' />
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
