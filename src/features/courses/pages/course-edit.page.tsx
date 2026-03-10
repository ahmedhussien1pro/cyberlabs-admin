// src/features/courses/pages/course-edit.page.tsx
// صفحة التحرير الموحدة: Edit | Curriculum | Path Relations | Preview
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminCoursesApi } from '../services/admin-courses.api';
import { CourseMetadataForm } from '../components/course-metadata-form';
import { CourseCurriculumEditor } from '../components/course-curriculum-editor';
import { CoursePathRelations } from '../components/course-path-relations';
import { CoursePlatformPreviewTab } from '../components/course-preview-tab';
import { CourseStateControl } from '../components/course-state-control';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BookOpen, GitBranch, Eye, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'metadata' | 'curriculum' | 'paths' | 'preview';

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: 'metadata', label: 'Edit', icon: Pencil },
  { key: 'curriculum', label: 'Curriculum', icon: BookOpen },
  { key: 'paths', label: 'Path Relations', icon: GitBranch },
  { key: 'preview', label: 'Preview', icon: Eye },
];

export default function CourseEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('metadata');

  const {
    data: course,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin', 'courses', 'slug', slug],
    queryFn: () => adminCoursesApi.getBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading)
    return (
      <div className='space-y-4 p-6'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-12 w-full' />
        <Skeleton className='h-96 w-full' />
      </div>
    );

  if (error || !course)
    return <div className='p-6 text-destructive'>Failed to load course.</div>;

  return (
    <div className='flex flex-col gap-6'>
      {/* ── Header ── */}
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={() => navigate(-1)}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='text-xl font-bold'>{course.title}</h1>
            <p className='text-xs text-muted-foreground font-mono'>
              /courses/{course.slug}
            </p>
          </div>
        </div>
        {/* State Control — 3 حالات */}
        <CourseStateControl courseId={course.id} currentState={course.state} />
      </div>

      {/* ── Tabs ── */}
      <div className='flex gap-1 border-b border-border/50'>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
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
        {activeTab === 'metadata' && <CourseMetadataForm course={course} />}
        {activeTab === 'curriculum' && (
          <CourseCurriculumEditor
            courseId={course.id}
            courseSlug={course.slug}
          />
        )}
        {activeTab === 'paths' && (
          <CoursePathRelations
            courseId={course.id}
            courseTitle={course.title}
          />
        )}
        {activeTab === 'preview' && (
          <CoursePlatformPreviewTab course={course} />
        )}
      </div>
    </div>
  );
}
