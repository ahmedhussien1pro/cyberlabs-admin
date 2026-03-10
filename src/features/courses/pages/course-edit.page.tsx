// src/features/courses/pages/course-edit.page.tsx
// ✅ Added: prominent Draft ⇄ Published quick-toggle button in header
import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCoursesApi } from '../services/admin-courses.api';
import { CourseMetadataForm } from '../components/course-metadata-form';
import { CourseCurriculumEditor } from '../components/course-curriculum-editor';
import { CoursePathRelations } from '../components/course-path-relations';
import { CoursePlatformPreviewTab } from '../components/course-preview-tab';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft, BookOpen, GitBranch, Eye, Pencil,
  Globe, FileEdit, Loader2, Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CourseState } from '../types/admin-course.types';

type Tab = 'metadata' | 'curriculum' | 'paths' | 'preview';

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: 'metadata',   label: 'Edit',          icon: Pencil    },
  { key: 'curriculum', label: 'Curriculum',     icon: BookOpen  },
  { key: 'paths',      label: 'Path Relations', icon: GitBranch },
  { key: 'preview',    label: 'Preview',        icon: Eye       },
];

const STATE_STYLES: Record<CourseState, { label: string; badge: string; next: CourseState; nextLabel: string; nextIcon: any; btnClass: string }> = {
  DRAFT: {
    label:     'Draft',
    badge:     'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
    next:      'PUBLISHED',
    nextLabel: 'Publish',
    nextIcon:  Globe,
    btnClass:  'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  PUBLISHED: {
    label:     'Published',
    badge:     'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    next:      'DRAFT',
    nextLabel: 'Unpublish',
    nextIcon:  FileEdit,
    btnClass:  'bg-zinc-600 hover:bg-zinc-700 text-white',
  },
  COMING_SOON: {
    label:     'Coming Soon',
    badge:     'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    next:      'PUBLISHED',
    nextLabel: 'Publish',
    nextIcon:  Globe,
    btnClass:  'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
};

export default function CourseEditPage() {
  const { slug }          = useParams<{ slug: string }>();
  const [searchParams]    = useSearchParams();
  const navigate          = useNavigate();
  const queryClient       = useQueryClient();

  // Support ?tab=preview from URL
  const initialTab = (searchParams.get('tab') as Tab) ?? 'metadata';
  const [activeTab, setActiveTab] = useState<Tab>(
    TABS.find((t) => t.key === initialTab) ? initialTab : 'metadata',
  );

  // Optimistic state for publish toggle
  const [localState, setLocalState] = useState<CourseState | null>(null);

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['admin', 'courses', 'slug', slug],
    queryFn:  () => adminCoursesApi.getBySlug(slug!),
    enabled:  !!slug,
  });

  const { mutate: toggleState, isPending: isToggling } = useMutation({
    mutationFn: (state: CourseState) => adminCoursesApi.setState(course!.id, state),
    onMutate: (state) => setLocalState(state),
    onSuccess: (_, state) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast.success(`Course is now ${STATE_STYLES[state].label}`);
    },
    onError: () => {
      setLocalState(null);
      toast.error('Failed to update course state');
    },
  });

  // ── Loading / Error states ──
  if (isLoading)
    return (
      <div className='space-y-4 p-6'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-12 w-full' />
        <Skeleton className='h-96 w-full' />
      </div>
    );

  if (error || !course) {
    const errMsg = (error as any)?.response?.data?.message ?? (error as any)?.message ?? 'Unknown error';
    return (
      <div className='flex flex-col items-center justify-center gap-4 p-12 text-center'>
        <div className='rounded-full bg-destructive/10 p-4'>
          <FileEdit className='h-8 w-8 text-destructive' />
        </div>
        <div>
          <p className='text-lg font-semibold'>Failed to load course</p>
          <p className='text-sm text-muted-foreground mt-1'>{errMsg}</p>
          <p className='text-xs text-muted-foreground/60 mt-1 font-mono'>slug: {slug}</p>
        </div>
        <Button variant='outline' onClick={() => navigate(-1)} className='gap-2'>
          <ArrowLeft className='h-4 w-4' /> Go Back
        </Button>
      </div>
    );
  }

  const displayState = localState ?? course.state;
  const stateStyle   = STATE_STYLES[displayState];
  const NextIcon     = stateStyle.nextIcon;

  return (
    <div className='flex flex-col gap-6'>
      {/* ── Header ── */}
      <div className='flex items-start justify-between gap-4 flex-wrap'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={() => navigate(-1)}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-xl font-bold'>{course.title}</h1>
              <Badge
                variant='outline'
                className={cn('text-xs font-semibold', stateStyle.badge)}>
                {stateStyle.label}
              </Badge>
            </div>
            <p className='text-xs text-muted-foreground font-mono mt-0.5'>
              /courses/{course.slug}
            </p>
          </div>
        </div>

        {/* ✅ Prominent Publish / Unpublish Toggle */}
        <div className='flex items-center gap-2'>
          {/* Also show COMING_SOON option */}
          {displayState !== 'COMING_SOON' && (
            <Button
              variant='outline'
              size='sm'
              className='gap-1.5 text-yellow-400 border-yellow-500/40 hover:bg-yellow-500/10'
              disabled={isToggling}
              onClick={() => toggleState('COMING_SOON')}>
              <Clock className='h-3.5 w-3.5' />
              Coming Soon
            </Button>
          )}
          <Button
            size='sm'
            className={cn('gap-1.5 min-w-[110px]', stateStyle.btnClass)}
            disabled={isToggling}
            onClick={() => toggleState(stateStyle.next)}>
            {isToggling ? (
              <Loader2 className='h-3.5 w-3.5 animate-spin' />
            ) : (
              <NextIcon className='h-3.5 w-3.5' />
            )}
            {isToggling ? 'Saving...' : stateStyle.nextLabel}
          </Button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className='flex gap-1 border-b border-border/50 overflow-x-auto'>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
              activeTab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}>
            <Icon className='h-3.5 w-3.5' />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div>
        {activeTab === 'metadata'   && <CourseMetadataForm course={course} />}
        {activeTab === 'curriculum' && (
          <CourseCurriculumEditor courseId={course.id} courseSlug={course.slug} />
        )}
        {activeTab === 'paths'      && (
          <CoursePathRelations courseId={course.id} courseTitle={course.title} />
        )}
        {activeTab === 'preview'    && <CoursePlatformPreviewTab course={course} />}
      </div>
    </div>
  );
}
