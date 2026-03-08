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
} from 'lucide-react';
import {
  PlatformCourseCard,
  type PlatformCourseData,
} from './platform-course-card';
import { cn } from '@/lib/utils';

const DOTTED_BG: React.CSSProperties = {
  backgroundImage:
    'radial-gradient(circle, #ffffff0a 1px, transparent 1px)',
  backgroundSize: '20px 20px',
};

type CheckItem = { label: string; ok: boolean; critical: boolean };

function getCompletenessItems(
  course: PlatformCourseData & Record<string, any>,
): CheckItem[] {
  return [
    { label: 'Title (EN)', ok: !!course.title, critical: true },
    { label: 'Title (AR)', ok: !!course.ar_title, critical: false },
    { label: 'Description', ok: !!course.description, critical: true },
    {
      label: 'Description (AR)',
      ok: !!course.ar_description,
      critical: false,
    },
    {
      label: 'Thumbnail / Image',
      ok: !!(course.thumbnail || course.image),
      critical: false,
    },
    { label: 'Category', ok: !!course.category, critical: false },
    {
      label: 'Instructor',
      ok: !!course.instructorId || !!course.instructor,
      critical: true,
    },
    { label: 'Difficulty', ok: !!course.difficulty, critical: true },
    { label: 'Duration', ok: !!course.duration, critical: false },
    {
      label: 'Tags',
      ok: (course.tags?.length ?? 0) > 0,
      critical: false,
    },
    {
      label: 'Skills',
      ok: (course.skills?.length ?? 0) > 0,
      critical: false,
    },
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
  const [tab, setTab] = useState<'grid' | 'list' | 'check'>('grid');
  const items = getCompletenessItems(course);
  const criticalMissing = items.filter((i) => i.critical && !i.ok).length;
  const totalMissing = items.filter((i) => !i.ok).length;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side='right'
        className='flex w-full flex-col p-0 sm:max-w-xl'
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
                  className='inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground'
                >
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
          className='flex flex-1 flex-col overflow-hidden'
        >
          <div className='shrink-0 border-b px-6 py-3'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='grid' className='gap-1.5 text-xs'>
                <Monitor className='h-3.5 w-3.5' /> Grid
              </TabsTrigger>
              <TabsTrigger value='list' className='gap-1.5 text-xs'>
                <Rows3 className='h-3.5 w-3.5' /> List
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
            className='flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-8 pt-5'
          >
            <div
              className='flex items-center justify-center rounded-xl bg-zinc-950 p-6'
              style={DOTTED_BG}
            >
              <div className='w-full max-w-[300px]'>
                <PlatformCourseCard course={course} variant='full' />
              </div>
            </div>
            <p className='text-center text-xs text-muted-foreground'>
              Shown in{' '}
              <code className='rounded bg-muted px-1 py-0.5 text-[10px]'>
                /courses
              </code>{' '}
              page — grid layout (300px wide)
            </p>
          </TabsContent>

          {/* ── List Tab ── */}
          <TabsContent
            value='list'
            className='flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-8 pt-5'
          >
            <div
              className='flex items-center rounded-xl bg-zinc-950 p-6'
              style={DOTTED_BG}
            >
              <div className='w-full'>
                <PlatformCourseCard course={course} variant='mini' />
              </div>
            </div>
            <p className='text-center text-xs text-muted-foreground'>
              Shown in{' '}
              <code className='rounded bg-muted px-1 py-0.5 text-[10px]'>
                /courses
              </code>{' '}
              list view &amp; search results
            </p>
          </TabsContent>

          {/* ── Completeness Tab ── */}
          <TabsContent
            value='check'
            className='flex flex-1 flex-col gap-3 overflow-y-auto px-6 pb-8 pt-5'
          >
            {/* Summary counters */}
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
                )}
              >
                <p
                  className={cn(
                    'text-2xl font-bold',
                    criticalMissing > 0
                      ? 'text-destructive'
                      : 'text-muted-foreground',
                  )}
                >
                  {totalMissing}
                </p>
                <p className='text-xs text-muted-foreground'>Missing</p>
              </div>
            </div>

            <Separator />

            {/* Items */}
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
                  )}
                >
                  <div className='flex items-center gap-2'>
                    <span className='text-sm'>{label}</span>
                    {critical && !ok && (
                      <Badge
                        variant='destructive'
                        className='px-1.5 py-0 text-[10px]'
                      >
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
